require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  SOCKET_IO_PORT: process.env.SOCKET_IO_PORT || 5001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  REDIS_DB: process.env.REDIS_DB || 0,
  SERVER_ID: process.env.SERVER_ID || `server-${Date.now()}`
};
