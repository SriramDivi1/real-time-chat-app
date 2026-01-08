const { redisClient, publisherClient } = require('../config/redis');
const { logger } = require('../utils/logger');
const User = require('../models/User');
const config = require('../config/environment');

// Redis key prefixes
const ONLINE_USERS_KEY = 'online_users';
const USER_PRESENCE_KEY = 'user_presence:';
const USER_SOCKET_KEY = 'user_sockets:';
const PRESENCE_EXPIRY = 24 * 60 * 60; // 24 hours

/**
 * Mark user as online
 */
const setUserOnline = async (userId, socketId, userData = {}) => {
  try {
    const presenceKey = `${USER_PRESENCE_KEY}${userId}`;
    const socketKey = `${USER_SOCKET_KEY}${userId}`;

    const presenceData = {
      userId,
      socketId,
      status: 'online',
      serverId: config.SERVER_ID,
      timestamp: Date.now(),
      ...userData
    };

    // Store in Redis with expiry
    await new Promise((resolve, reject) => {
      redisClient.setex(
        presenceKey,
        PRESENCE_EXPIRY,
        JSON.stringify(presenceData),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Add to online users set
    await new Promise((resolve, reject) => {
      redisClient.sadd(ONLINE_USERS_KEY, userId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Store socket connection
    await new Promise((resolve, reject) => {
      redisClient.sadd(socketKey, socketId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Update user status in database
    await User.findByIdAndUpdate(userId, {
      status: 'online',
      lastSeen: new Date()
    });

    logger.info(`User online: ${userId} - Socket: ${socketId}`);

    return presenceData;
  } catch (error) {
    logger.error('Set user online error:', error.message);
    throw error;
  }
};

/**
 * Mark user as offline
 */
const setUserOffline = async (userId, socketId) => {
  try {
    const presenceKey = `${USER_PRESENCE_KEY}${userId}`;
    const socketKey = `${USER_SOCKET_KEY}${userId}`;

    // Remove socket
    await new Promise((resolve, reject) => {
      redisClient.srem(socketKey, socketId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has other sockets
    const socketCount = await new Promise((resolve, reject) => {
      redisClient.scard(socketKey, (err, count) => {
        if (err) reject(err);
        else resolve(count);
      });
    });

    // If no more sockets, mark as offline
    if (socketCount === 0) {
      // Delete presence key
      await new Promise((resolve, reject) => {
        redisClient.del(presenceKey, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Remove from online users
      await new Promise((resolve, reject) => {
        redisClient.srem(ONLINE_USERS_KEY, userId, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Update user status in database
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      });

      logger.info(`User offline: ${userId}`);

      return { status: 'offline', userId };
    }

    return { status: 'online', userId, socketsRemaining: socketCount };
  } catch (error) {
    logger.error('Set user offline error:', error.message);
    throw error;
  }
};

/**
 * Get user presence
 */
const getUserPresence = async (userId) => {
  try {
    const presenceKey = `${USER_PRESENCE_KEY}${userId}`;

    const presence = await new Promise((resolve, reject) => {
      redisClient.get(presenceKey, (err, data) => {
        if (err) reject(err);
        else resolve(data ? JSON.parse(data) : null);
      });
    });

    return presence;
  } catch (error) {
    logger.error('Get user presence error:', error.message);
    return null;
  }
};

/**
 * Get all online users
 */
const getOnlineUsers = async () => {
  try {
    const userIds = await new Promise((resolve, reject) => {
      redisClient.smembers(ONLINE_USERS_KEY, (err, members) => {
        if (err) reject(err);
        else resolve(members || []);
      });
    });

    const presenceData = await Promise.all(
      userIds.map((userId) => getUserPresence(userId))
    );

    return presenceData.filter((p) => p !== null);
  } catch (error) {
    logger.error('Get online users error:', error.message);
    return [];
  }
};

/**
 * Get user socket count
 */
const getUserSocketCount = async (userId) => {
  try {
    const socketKey = `${USER_SOCKET_KEY}${userId}`;

    const count = await new Promise((resolve, reject) => {
      redisClient.scard(socketKey, (err, count) => {
        if (err) reject(err);
        else resolve(count || 0);
      });
    });

    return count;
  } catch (error) {
    logger.error('Get user socket count error:', error.message);
    return 0;
  }
};

/**
 * Publish presence event
 */
const publishPresenceEvent = async (event, data) => {
  try {
    const eventData = {
      event,
      data,
      timestamp: Date.now(),
      serverId: config.SERVER_ID
    };

    await new Promise((resolve, reject) => {
      publisherClient.publish(
        'presence_events',
        JSON.stringify(eventData),
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logger.debug(`Published presence event: ${event}`);
  } catch (error) {
    logger.error('Publish presence event error:', error.message);
  }
};

/**
 * Clear expired user sessions
 */
const clearExpiredSessions = async () => {
  try {
    const userIds = await new Promise((resolve, reject) => {
      redisClient.smembers(ONLINE_USERS_KEY, (err, members) => {
        if (err) reject(err);
        else resolve(members || []);
      });
    });

    for (const userId of userIds) {
      const presence = await getUserPresence(userId);
      if (!presence) {
        // Presence expired, remove from online users
        await new Promise((resolve, reject) => {
          redisClient.srem(ONLINE_USERS_KEY, userId, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        logger.info(`Cleared expired session for user: ${userId}`);
      }
    }
  } catch (error) {
    logger.error('Clear expired sessions error:', error.message);
  }
};

module.exports = {
  setUserOnline,
  setUserOffline,
  getUserPresence,
  getOnlineUsers,
  getUserSocketCount,
  publishPresenceEvent,
  clearExpiredSessions
};
