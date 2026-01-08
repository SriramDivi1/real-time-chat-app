const redis = require('redis');
const config = require('./environment');
const { logger } = require('../utils/logger');

// Create Redis clients
const redisClient = redis.createClient({
  host: config.REDIS_HOST || 'localhost',
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined,
  retryStrategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis connection refused');
      return new Error('End of retry');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

const publisherClient = redis.createClient({
  host: config.REDIS_HOST || 'localhost',
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined
});

const subscriberClient = redis.createClient({
  host: config.REDIS_HOST || 'localhost',
  port: config.REDIS_PORT || 6379,
  password: config.REDIS_PASSWORD || undefined
});

// Connection events
redisClient.on('connect', () => {
  logger.info('✅ Redis main client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis main client error:', err);
});

redisClient.on('reconnecting', () => {
  logger.warn('🔄 Redis main client reconnecting...');
});

publisherClient.on('connect', () => {
  logger.info('✅ Redis publisher client connected');
});

publisherClient.on('error', (err) => {
  logger.error('Redis publisher client error:', err);
});

subscriberClient.on('connect', () => {
  logger.info('✅ Redis subscriber client connected');
});

subscriberClient.on('error', (err) => {
  logger.error('Redis subscriber client error:', err);
});

subscriberClient.on('message', (channel, message) => {
  logger.debug(`Redis message on channel ${channel}:`, message);
});

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    await new Promise((resolve, reject) => {
      redisClient.ping((err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
    logger.info('🚀 Redis connected successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error.message);
    return false;
  }
};

/**
 * Close Redis connections
 */
const closeRedis = async () => {
  try {
    redisClient.quit();
    publisherClient.quit();
    subscriberClient.quit();
    logger.info('Redis connections closed');
  } catch (error) {
    logger.error('Error closing Redis connections:', error.message);
  }
};

module.exports = {
  redisClient,
  publisherClient,
  subscriberClient,
  connectRedis,
  closeRedis
};
