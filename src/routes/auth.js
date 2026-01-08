const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout
} = require('../controllers/userController');

const router = express.Router();

/**
 * Validation middleware for registration
 */
const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscore, and hyphen'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required'),
  body('fullName')
    .trim()
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name cannot exceed 50 characters')
];

/**
 * Validation middleware for login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation middleware for profile update
 */
const validateProfileUpdate = [
  body('fullName')
    .trim()
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name cannot exceed 50 characters'),
  body('bio')
    .trim()
    .optional()
    .isLength({ max: 200 })
    .withMessage('Bio cannot exceed 200 characters'),
  body('avatar')
    .trim()
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Public Routes
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validateRegister, register);

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', validateLogin, login);

// Protected Routes (require authentication)
/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware, validateProfileUpdate, updateProfile);

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;
