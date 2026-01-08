const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// In-memory store for active users and their socket connections
const activeUsers = new Map(); // userId -> { socketId, rooms: Set }
const socketUsers = new Map(); // socketId -> userId

/**
 * Initialize Socket.IO events
 */
const initializeSocketEvents = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.userId;

    logger.info(`User connected: ${userId} - Socket: ${socket.id}`);

    // Store user connection
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, { sockets: new Set(), rooms: new Set() });
    }
    activeUsers.get(userId).sockets.add(socket.id);
    socketUsers.set(socket.id, userId);

    // Update user status to online
    await updateUserStatus(userId, 'online');

    // Broadcast user online status
    io.emit('user:online', { userId, timestamp: new Date() });

    /**
     * User joins a chat room
     */
    socket.on('chat:join', async (data) => {
      try {
        const { chatId } = data;
        const room = `chat:${chatId}`;

        // Verify user is participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isParticipant(userId)) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }

        // Join room
        socket.join(room);
        activeUsers.get(userId).rooms.add(chatId);

        logger.info(`User ${userId} joined chat ${chatId}`);

        // Notify others in the room
        socket.broadcast.to(room).emit('user:joined', {
          chatId,
          userId,
          timestamp: new Date()
        });

        // Send active participants count
        const participants = io.sockets.adapter.rooms.get(room);
        io.to(room).emit('chat:activeUsers', {
          chatId,
          count: participants ? participants.size : 0
        });
      } catch (error) {
        logger.error('chat:join error:', error.message);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    /**
     * User leaves a chat room
     */
    socket.on('chat:leave', async (data) => {
      try {
        const { chatId } = data;
        const room = `chat:${chatId}`;

        socket.leave(room);
        activeUsers.get(userId).rooms.delete(chatId);

        logger.info(`User ${userId} left chat ${chatId}`);

        // Notify others in the room
        socket.broadcast.to(room).emit('user:left', {
          chatId,
          userId,
          timestamp: new Date()
        });

        // Send active participants count
        const participants = io.sockets.adapter.rooms.get(room);
        io.to(room).emit('chat:activeUsers', {
          chatId,
          count: participants ? participants.size : 0
        });
      } catch (error) {
        logger.error('chat:leave error:', error.message);
      }
    });

    /**
     * Send message in real-time
     */
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType = 'text', attachments = [], replyTo } = data;

        // Verify chat exists and user is participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isParticipant(userId)) {
          socket.emit('error', { message: 'Not authorized to send messages in this chat' });
          return;
        }

        // Create message
        const message = new Message({
          chatId,
          senderId: userId,
          content,
          messageType,
          attachments: attachments.length > 0 ? attachments : undefined,
          replyTo: replyTo || null,
          readBy: [{ userId, readAt: new Date() }]
        });

        await message.save();
        await message.populate('senderId', 'username avatar email');

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageTime = new Date();
        chat.messageCount = (chat.messageCount || 0) + 1;
        await chat.save();

        logger.info(`Message sent to chat ${chatId} by user ${userId}`);

        // Broadcast message to room
        const room = `chat:${chatId}`;
        io.to(room).emit('message:received', {
          ...message.toObject(),
          isNew: true
        });

        // Acknowledge to sender
        socket.emit('message:sent', {
          messageId: message._id,
          chatId,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('message:send error:', error.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Real-time typing indicator
     */
    socket.on('chat:typing', (data) => {
      try {
        const { chatId } = data;
        const room = `chat:${chatId}`;

        // Broadcast typing indicator to others in room
        socket.broadcast.to(room).emit('user:typing', {
          chatId,
          userId,
          username: socket.handshake.auth.username || 'User'
        });
      } catch (error) {
        logger.error('chat:typing error:', error.message);
      }
    });

    /**
     * Stop typing indicator
     */
    socket.on('chat:stopTyping', (data) => {
      try {
        const { chatId } = data;
        const room = `chat:${chatId}`;

        // Broadcast stop typing to others in room
        socket.broadcast.to(room).emit('user:stoppedTyping', {
          chatId,
          userId
        });
      } catch (error) {
        logger.error('chat:stopTyping error:', error.message);
      }
    });

    /**
     * Mark message as read
     */
    socket.on('message:markRead', async (data) => {
      try {
        const { messageId, chatId } = data;

        // Update message read status
        await Message.findByIdAndUpdate(
          messageId,
          {
            $addToSet: {
              readBy: { userId, readAt: new Date() }
            }
          },
          { new: true }
        );

        const room = `chat:${chatId}`;

        // Broadcast read receipt
        io.to(room).emit('message:read', {
          messageId,
          userId,
          readAt: new Date()
        });

        logger.info(`Message ${messageId} marked as read by ${userId}`);
      } catch (error) {
        logger.error('message:markRead error:', error.message);
      }
    });

    /**
     * Edit message in real-time
     */
    socket.on('message:edit', async (data) => {
      try {
        const { messageId, content, chatId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Only message sender can edit
        if (message.senderId.toString() !== userId) {
          socket.emit('error', { message: 'You can only edit your own messages' });
          return;
        }

        // Save edit history
        if (!message.editHistory) {
          message.editHistory = [];
        }
        message.editHistory.push({
          content: message.content,
          editedAt: new Date()
        });

        message.content = content;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        logger.info(`Message ${messageId} edited by ${userId}`);

        const room = `chat:${chatId}`;

        // Broadcast edited message
        io.to(room).emit('message:edited', {
          messageId,
          content,
          edited: true,
          editedAt: new Date(),
          chatId
        });
      } catch (error) {
        logger.error('message:edit error:', error.message);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    /**
     * Delete message in real-time
     */
    socket.on('message:delete', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Only message sender or admin can delete
        const chat = await Chat.findById(chatId);
        const isAdmin = chat.isAdmin(userId);
        const isSender = message.senderId.toString() === userId;

        if (!isAdmin && !isSender) {
          socket.emit('error', { message: 'You can only delete your own messages' });
          return;
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = '[This message has been deleted]';
        await message.save();

        logger.info(`Message ${messageId} deleted by ${userId}`);

        const room = `chat:${chatId}`;

        // Broadcast message deletion
        io.to(room).emit('message:deleted', {
          messageId,
          chatId,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('message:delete error:', error.message);
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    /**
     * Add emoji reaction to message
     */
    socket.on('message:reaction', async (data) => {
      try {
        const { messageId, emoji, chatId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already has this reaction
        const existingReaction = message.reactions.find(
          (r) => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction if exists
          message.reactions = message.reactions.filter(
            (r) => !(r.userId.toString() === userId && r.emoji === emoji)
          );
        } else {
          // Add new reaction
          message.reactions.push({ userId, emoji });
        }

        await message.save();

        logger.info(`Reaction added to message ${messageId} by ${userId}`);

        const room = `chat:${chatId}`;

        // Broadcast reaction update
        io.to(room).emit('message:reactionUpdated', {
          messageId,
          reactions: message.reactions,
          chatId
        });
      } catch (error) {
        logger.error('message:reaction error:', error.message);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    /**
     * User disconnects
     */
    socket.on('disconnect', async () => {
      try {
        logger.info(`User disconnected: ${userId} - Socket: ${socket.id}`);

        // Remove socket from active users
        const userSockets = activeUsers.get(userId);
        if (userSockets) {
          userSockets.sockets.delete(socket.id);

          // If no more sockets for this user, set status to offline
          if (userSockets.sockets.size === 0) {
            await updateUserStatus(userId, 'offline');
            activeUsers.delete(userId);

            // Broadcast user offline status
            io.emit('user:offline', { userId, timestamp: new Date() });

            logger.info(`User ${userId} is now offline`);
          }
        }

        socketUsers.delete(socket.id);

        // Notify rooms the user was in
        if (userSockets && userSockets.rooms.size > 0) {
          for (const chatId of userSockets.rooms) {
            const room = `chat:${chatId}`;
            io.to(room).emit('user:left', { chatId, userId, timestamp: new Date() });
          }
        }
      } catch (error) {
        logger.error('disconnect error:', error.message);
      }
    });

    /**
     * Handle socket errors
     */
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });
};

/**
 * Update user status in database
 */
const updateUserStatus = async (userId, status) => {
  try {
    await User.findByIdAndUpdate(userId, {
      status,
      lastSeen: new Date()
    });
  } catch (error) {
    logger.error(`Failed to update user status: ${error.message}`);
  }
};

/**
 * Get active users in a chat
 */
const getActiveChatUsers = (io, chatId) => {
  const room = `chat:${chatId}`;
  const sockets = io.sockets.adapter.rooms.get(room);
  return sockets ? Array.from(sockets) : [];
};

/**
 * Send message to specific user (if online)
 */
const sendMessageToUser = (io, userId, event, data) => {
  const userInfo = activeUsers.get(userId);
  if (userInfo) {
    userInfo.sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Broadcast message to chat room
 */
const broadcastToChat = (io, chatId, event, data) => {
  const room = `chat:${chatId}`;
  io.to(room).emit(event, data);
};

module.exports = {
  initializeSocketEvents,
  getActiveChatUsers,
  sendMessageToUser,
  broadcastToChat,
  activeUsers,
  socketUsers
};
