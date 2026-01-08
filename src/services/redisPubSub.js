const { subscriberClient, publisherClient } = require('../config/redis');
const { logger } = require('../utils/logger');
const config = require('../config/environment');

/**
 * Initialize Redis Pub/Sub handlers
 */
const initializeRedisPubSub = (io) => {
  /**
   * Subscribe to presence events
   */
  subscriberClient.subscribe('presence_events', (err) => {
    if (err) {
      logger.error('Failed to subscribe to presence_events:', err);
    } else {
      logger.info('✅ Subscribed to Redis channel: presence_events');
    }
  });

  /**
   * Handle presence events from other servers
   */
  subscriberClient.on('message', (channel, message) => {
    try {
      if (channel === 'presence_events') {
        const eventData = JSON.parse(message);
        const { event, data, serverId } = eventData;

        // Ignore events from this server (already handled locally)
        if (serverId === config.SERVER_ID) {
          return;
        }

        logger.debug(
          `Received ${channel} event from server ${serverId}: ${event}`
        );

        // Broadcast event to all connected clients
        switch (event) {
          case 'user:online':
            io.emit('user:online', data);
            break;
          case 'user:offline':
            io.emit('user:offline', data);
            break;
          case 'user:status_change':
            io.emit('user:statusChanged', data);
            break;
          case 'chat:message':
            io.to(`chat:${data.chatId}`).emit('message:received', data);
            break;
          default:
            logger.warn(`Unknown event type: ${event}`);
        }
      }
    } catch (error) {
      logger.error(`Error handling ${channel} message:`, error.message);
    }
  });

  /**
   * Subscribe to chat events channel
   */
  subscriberClient.subscribe('chat_events', (err) => {
    if (err) {
      logger.error('Failed to subscribe to chat_events:', err);
    } else {
      logger.info('✅ Subscribed to Redis channel: chat_events');
    }
  });

  /**
   * Handle chat events from other servers
   */
  subscriberClient.on('message', (channel, message) => {
    if (channel === 'chat_events') {
      try {
        const eventData = JSON.parse(message);
        const { event, chatId, data, serverId } = eventData;

        // Ignore events from this server
        if (serverId === config.SERVER_ID) {
          return;
        }

        logger.debug(
          `Received ${channel} event from server ${serverId}: ${event} for chat ${chatId}`
        );

        // Broadcast to specific chat room
        const room = `chat:${chatId}`;
        switch (event) {
          case 'message:sent':
            io.to(room).emit('message:received', data);
            break;
          case 'message:edited':
            io.to(room).emit('message:edited', data);
            break;
          case 'message:deleted':
            io.to(room).emit('message:deleted', data);
            break;
          case 'user:typing':
            io.to(room).emit('user:typing', data);
            break;
          case 'user:stoppedTyping':
            io.to(room).emit('user:stoppedTyping', data);
            break;
          default:
            logger.warn(`Unknown chat event: ${event}`);
        }
      } catch (error) {
        logger.error(`Error handling ${channel} message:`, error.message);
      }
    }
  });

  logger.info('🔴 Redis Pub/Sub initialized');
};

/**
 * Publish presence event
 */
const publishPresenceEvent = (event, data) => {
  try {
    const eventData = {
      event,
      data,
      timestamp: Date.now(),
      serverId: config.SERVER_ID
    };

    publisherClient.publish('presence_events', JSON.stringify(eventData), (err) => {
      if (err) {
        logger.error('Error publishing presence event:', err);
      }
    });
  } catch (error) {
    logger.error('Publish presence event error:', error.message);
  }
};

/**
 * Publish chat event
 */
const publishChatEvent = (event, chatId, data) => {
  try {
    const eventData = {
      event,
      chatId,
      data,
      timestamp: Date.now(),
      serverId: config.SERVER_ID
    };

    publisherClient.publish('chat_events', JSON.stringify(eventData), (err) => {
      if (err) {
        logger.error('Error publishing chat event:', err);
      }
    });
  } catch (error) {
    logger.error('Publish chat event error:', error.message);
  }
};

/**
 * Close Redis Pub/Sub connections
 */
const closeRedisPubSub = () => {
  try {
    subscriberClient.unsubscribe();
    subscriberClient.quit();
    publisherClient.quit();
    logger.info('Redis Pub/Sub connections closed');
  } catch (error) {
    logger.error('Error closing Redis Pub/Sub:', error.message);
  }
};

module.exports = {
  initializeRedisPubSub,
  publishPresenceEvent,
  publishChatEvent,
  closeRedisPubSub
};
