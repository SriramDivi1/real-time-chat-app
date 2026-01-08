const Message = require('../models/Message');
const {
  sendToQueue,
  assertQueue,
  consumeMessages,
  publishMessage,
  assertExchange,
  bindQueue
} = require('../config/rabbitmq');
const { logger } = require('../utils/logger');

// Queue names
const OFFLINE_MESSAGES_QUEUE = 'offline_messages';
const MESSAGE_DELIVERY_QUEUE = 'message_delivery';
const OFFLINE_MESSAGES_EXCHANGE = 'offline_messages_exchange';

/**
 * Initialize message queue
 */
const initializeMessageQueue = async () => {
  try {
    // Setup offline messages queue
    await assertExchange(OFFLINE_MESSAGES_EXCHANGE, 'direct');
    await assertQueue(OFFLINE_MESSAGES_QUEUE, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxLength: 100000, // Max 100k messages
      arguments: {
        'x-dead-letter-exchange': 'dlx',
        'x-dead-letter-routing-key': 'dead_letter'
      }
    });
    await bindQueue(OFFLINE_MESSAGES_QUEUE, OFFLINE_MESSAGES_EXCHANGE, 'offline');

    // Setup message delivery tracking queue
    await assertQueue(MESSAGE_DELIVERY_QUEUE, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxLength: 50000
    });

    logger.info('✅ Message queues initialized');
  } catch (error) {
    logger.error('Failed to initialize message queues:', error.message);
    throw error;
  }
};

/**
 * Queue message for offline user
 */
const queueOfflineMessage = async (userId, chatId, message) => {
  try {
    const offlineMessage = {
      userId,
      chatId,
      messageId: message._id,
      senderId: message.senderId,
      content: message.content,
      messageType: message.messageType,
      attachments: message.attachments,
      replyTo: message.replyTo,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h expiry
    };

    await sendToQueue(OFFLINE_MESSAGES_QUEUE, offlineMessage, {
      headers: {
        'x-user-id': userId,
        'x-chat-id': chatId
      }
    });

    logger.info(`Offline message queued for user ${userId} in chat ${chatId}`);

    return offlineMessage;
  } catch (error) {
    logger.error('Failed to queue offline message:', error.message);
    throw error;
  }
};

/**
 * Get queued messages for user
 */
const getQueuedMessages = async (userId) => {
  try {
    // Query from MongoDB for now (messages stored as read=false)
    const messages = await Message.find({
      'readBy.userId': { $ne: userId },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('senderId', 'username avatar email');

    return messages;
  } catch (error) {
    logger.error('Failed to get queued messages:', error.message);
    return [];
  }
};

/**
 * Deliver queued messages to user
 */
const deliverQueuedMessages = async (userId, socket, io) => {
  try {
    // Get unread messages for user
    const messages = await Message.find({
      'readBy.userId': { $ne: userId }
    })
      .populate('senderId', 'username avatar email')
      .sort({ createdAt: -1 })
      .limit(1000);

    if (messages.length === 0) {
      logger.debug(`No queued messages for user ${userId}`);
      return [];
    }

    // Send messages to user
    socket.emit('messages:queued', {
      count: messages.length,
      messages: messages
    });

    logger.info(`Delivered ${messages.length} queued messages to user ${userId}`);

    // Mark messages as delivered (not necessarily read yet)
    await Message.updateMany(
      { _id: { $in: messages.map((m) => m._id) } },
      {
        $addToSet: {
          readBy: {
            userId,
            readAt: new Date()
          }
        }
      }
    );

    return messages;
  } catch (error) {
    logger.error('Failed to deliver queued messages:', error.message);
    return [];
  }
};

/**
 * Track message delivery
 */
const trackMessageDelivery = async (messageId, userId, status = 'delivered') => {
  try {
    const deliveryRecord = {
      messageId,
      userId,
      status, // delivered, read, failed
      timestamp: new Date(),
      deliveredAt: new Date()
    };

    await publishMessage(
      OFFLINE_MESSAGES_EXCHANGE,
      'delivery_status',
      deliveryRecord
    );

    logger.debug(`Message delivery tracked: ${messageId} -> ${userId} (${status})`);

    return deliveryRecord;
  } catch (error) {
    logger.error('Failed to track message delivery:', error.message);
  }
};

/**
 * Setup message delivery worker
 */
const setupMessageDeliveryWorker = async (io) => {
  try {
    await consumeMessages(MESSAGE_DELIVERY_QUEUE, async (message) => {
      try {
        const { messageId, userId, status } = message;

        // Update message status in database
        await Message.findByIdAndUpdate(messageId, {
          $set: {
            deliveryStatus: status,
            deliveredAt: new Date()
          }
        });

        logger.debug(
          `Message delivery worker processed: ${messageId} for user ${userId}`
        );

        // Emit delivery event to user if online
        io.to(userId).emit('message:deliveryStatus', {
          messageId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Error processing delivery message:', error.message);
      }
    });

    logger.info('Message delivery worker started');
  } catch (error) {
    logger.error('Failed to setup message delivery worker:', error.message);
  }
};

/**
 * Handle user reconnection
 */
const handleUserReconnection = async (userId, socket, io) => {
  try {
    logger.info(`User ${userId} reconnected, delivering offline messages`);

    // Deliver queued messages
    const queuedMessages = await deliverQueuedMessages(userId, socket, io);

    // Get undelivered messages
    const undeliveredMessages = await Message.find({
      'readBy.userId': { $ne: userId },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(100);

    // Emit reconnection event
    socket.emit('reconnection:complete', {
      queuedMessagesCount: queuedMessages.length,
      undeliveredCount: undeliveredMessages.length
    });

    return {
      queuedMessages,
      undeliveredMessages
    };
  } catch (error) {
    logger.error('Error handling user reconnection:', error.message);
    return { queuedMessages: [], undeliveredMessages: [] };
  }
};

/**
 * Cleanup expired messages
 */
const cleanupExpiredMessages = async () => {
  try {
    const expiryTime = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Message.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: expiryTime }
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} expired messages`);
    }
  } catch (error) {
    logger.error('Failed to cleanup expired messages:', error.message);
  }
};

module.exports = {
  initializeMessageQueue,
  queueOfflineMessage,
  getQueuedMessages,
  deliverQueuedMessages,
  trackMessageDelivery,
  setupMessageDeliveryWorker,
  handleUserReconnection,
  cleanupExpiredMessages
};
