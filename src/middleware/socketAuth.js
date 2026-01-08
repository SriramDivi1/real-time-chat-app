const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const { logger } = require('../utils/logger');

/**
 * Socket.IO authentication middleware
 */
const socketAuthMiddleware = (socket, next) => {
  try {
    // Get token from handshake data
    const token = socket.handshake.auth.token || socket.handshake.headers['x-auth-token'];

    if (!token) {
      logger.warn(`Socket connection attempt without token: ${socket.id}`);
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.userId = decoded.id;
    socket.user = decoded;

    logger.info(`Socket authenticated: ${socket.id} - User: ${socket.userId}`);
    next();
  } catch (error) {
    logger.error(`Socket authentication failed: ${error.message}`);
    next(new Error(`Authentication error: ${error.message}`));
  }
};

module.exports = {
  socketAuthMiddleware
};
