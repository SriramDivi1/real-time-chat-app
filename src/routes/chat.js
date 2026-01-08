const express = require('express');
const { body, param, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  createChat,
  getChatList,
  getChatHistory,
  sendMessage,
  editMessage,
  deleteMessage,
  addParticipant,
  removeParticipant
} = require('../controllers/chatController');

const router = express.Router();

// Middleware to verify authentication for all routes
router.use(authMiddleware);

/**
 * Validation middleware for creating chat
 */
const validateCreateChat = [
  body('chatType')
    .notEmpty()
    .withMessage('Chat type is required')
    .isIn(['direct', 'group'])
    .withMessage('Chat type must be either "direct" or "group"'),
  body('participantIds')
    .optional()
    .isArray()
    .withMessage('Participant IDs must be an array'),
  body('groupName')
    .if((value, { req }) => req.body.chatType === 'group')
    .notEmpty()
    .withMessage('Group name is required for group chats')
    .isLength({ min: 1, max: 100 })
    .withMessage('Group name must be between 1 and 100 characters'),
  body('groupDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Group description cannot exceed 500 characters')
];

/**
 * Validation middleware for sending message
 */
const validateSendMessage = [
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'system'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

/**
 * Validation middleware for editing message
 */
const validateEditMessage = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Invalid message ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
];

/**
 * Validation middleware for chat ID param
 */
const validateChatId = [
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID')
];

/**
 * Validation middleware for adding/removing participant
 */
const validateParticipant = [
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Routes

/**
 * POST /api/chats
 * Create a new chat (direct or group)
 */
router.post('/', validateCreateChat, createChat);

/**
 * GET /api/chats
 * Get list of all chats for authenticated user
 */
router.get(
  '/',
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be >= 0'),
  getChatList
);

/**
 * GET /api/chats/:chatId/messages
 * Get chat history (messages) for a specific chat
 */
router.get(
  '/:chatId/messages',
  validateChatId,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Skip must be >= 0'),
  getChatHistory
);

/**
 * POST /api/chats/:chatId/messages
 * Send a message to a chat
 */
router.post('/:chatId/messages', validateSendMessage, sendMessage);

/**
 * PUT /api/chats/messages/:messageId
 * Edit a message
 */
router.put('/messages/:messageId', validateEditMessage, editMessage);

/**
 * DELETE /api/chats/messages/:messageId
 * Delete a message
 */
router.delete(
  '/messages/:messageId',
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Invalid message ID'),
  deleteMessage
);

/**
 * POST /api/chats/:chatId/participants
 * Add participant to group chat
 */
router.post('/:chatId/participants', validateParticipant, addParticipant);

/**
 * DELETE /api/chats/:chatId/participants
 * Remove participant from group chat
 */
router.delete(
  '/:chatId/participants',
  param('chatId')
    .notEmpty()
    .withMessage('Chat ID is required')
    .isMongoId()
    .withMessage('Invalid chat ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
  removeParticipant
);

module.exports = router;
