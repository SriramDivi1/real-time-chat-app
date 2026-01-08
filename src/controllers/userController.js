const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const { validationResult } = require('express-validator');

/**
 * User Registration Controller
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, password, confirmPassword, fullName } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName: fullName || username
    });

    // Save user to database
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * User Login Controller
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last seen
    user.lastSeen = new Date();
    user.status = 'online';
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get Current User Profile
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Get current user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * Update User Profile
 */
const updateProfile = async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    let user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Logout User
 */
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date();
      await user.save();
      logger.info(`User logged out: ${user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout
};
