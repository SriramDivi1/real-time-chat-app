const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const config = require('../config/environment');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  try {
    const token = jwt.sign(
      { id: userId },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRE }
    );
    return token;
  } catch (error) {
    logger.error('Token generation failed:', error.message);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Optional auth middleware - doesn't fail if no token is provided
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.userId = decoded.id;
      req.user = decoded;
      req.isAuthenticated = true;
    } else {
      req.isAuthenticated = false;
    }
    next();
  } catch (error) {
    logger.warn('Optional token verification failed:', error.message);
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  authMiddleware,
  generateToken,
  optionalAuth
};
