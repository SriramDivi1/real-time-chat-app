const amqp = require('amqplib');
const config = require('./environment');
const { logger } = require('../utils/logger');

let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ
 */
const connectRabbitMQ = async () => {
  try {
    const url = `amqp://${config.RABBITMQ_USER}:${config.RABBITMQ_PASSWORD}@${config.RABBITMQ_HOST}:${config.RABBITMQ_PORT}/`;

    connection = await amqp.connect(url, {
      connectionTimeout: 10000,
      heartbeat: 60
    });

    channel = await connection.createChannel();

    // Handle connection errors
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error:', err);
      connection = null;
      channel = null;
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });

    logger.info('✅ Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error.message);
    throw error;
  }
};

/**
 * Get channel (with auto-reconnect)
 */
const getChannel = async () => {
  if (!channel) {
    logger.warn('Reconnecting to RabbitMQ...');
    await connectRabbitMQ();
  }
  return channel;
};

/**
 * Assert exchange
 */
const assertExchange = async (exchange, type = 'topic') => {
  try {
    const ch = await getChannel();
    await ch.assertExchange(exchange, type, { durable: true });
    logger.debug(`Exchange asserted: ${exchange}`);
  } catch (error) {
    logger.error(`Failed to assert exchange ${exchange}:`, error.message);
  }
};

/**
 * Assert queue
 */
const assertQueue = async (queue, options = {}) => {
  try {
    const ch = await getChannel();
    const queueOptions = {
      durable: true,
      arguments: {
        'x-message-ttl': options.ttl || 86400000, // 24h default
        'x-max-length': options.maxLength || 10000, // Max 10k messages
        ...options.arguments
      }
    };

    await ch.assertQueue(queue, queueOptions);
    logger.debug(`Queue asserted: ${queue}`);
  } catch (error) {
    logger.error(`Failed to assert queue ${queue}:`, error.message);
  }
};

/**
 * Bind queue to exchange
 */
const bindQueue = async (queue, exchange, routingKey) => {
  try {
    const ch = await getChannel();
    await ch.bindQueue(queue, exchange, routingKey);
    logger.debug(`Queue bound: ${queue} -> ${exchange} (${routingKey})`);
  } catch (error) {
    logger.error(`Failed to bind queue ${queue}:`, error.message);
  }
};

/**
 * Publish message
 */
const publishMessage = async (exchange, routingKey, message, options = {}) => {
  try {
    const ch = await getChannel();

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const publishOptions = {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      ...options
    };

    ch.publish(exchange, routingKey, messageBuffer, publishOptions);
    logger.debug(`Message published to ${exchange} with key ${routingKey}`);
  } catch (error) {
    logger.error('Failed to publish message:', error.message);
    throw error;
  }
};

/**
 * Consume messages
 */
const consumeMessages = async (queue, callback, options = {}) => {
  try {
    const ch = await getChannel();

    const consumeOptions = {
      noAck: false, // Require acknowledgement
      ...options
    };

    await ch.consume(queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg);
          ch.ack(msg);
        } catch (error) {
          logger.error('Error processing message:', error.message);
          ch.nack(msg, false, true); // Requeue on error
        }
      }
    }, consumeOptions);

    logger.info(`Consumer started for queue: ${queue}`);
  } catch (error) {
    logger.error('Failed to consume messages:', error.message);
  }
};

/**
 * Send to queue
 */
const sendToQueue = async (queue, message, options = {}) => {
  try {
    const ch = await getChannel();

    const messageBuffer = Buffer.from(JSON.stringify(message));
    const sendOptions = {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      ...options
    };

    ch.sendToQueue(queue, messageBuffer, sendOptions);
    logger.debug(`Message sent to queue: ${queue}`);
  } catch (error) {
    logger.error('Failed to send message to queue:', error.message);
    throw error;
  }
};

/**
 * Close RabbitMQ connection
 */
const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ:', error.message);
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  assertExchange,
  assertQueue,
  bindQueue,
  publishMessage,
  consumeMessages,
  sendToQueue,
  closeRabbitMQ
};
