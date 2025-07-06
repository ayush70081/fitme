const express = require('express');
const router = express.Router();

// Import controllers
const {
  updateProfile,
  deleteAccount,
  getUserStats,
  updateEmail,
  getPreferences,
  updateProfilePhoto,
  deleteProfilePhoto
} = require('../controllers/userController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

/**
 * @route   PUT /api/user/profile-photo
 * @desc    Update user profile photo
 * @access  Private
 */
router.put('/profile-photo', authenticate, updateProfilePhoto);

/**
 * @route   DELETE /api/user/profile-photo
 * @desc    Delete user profile photo
 * @access  Private
 */
router.delete('/profile-photo', authenticate, deleteProfilePhoto);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticate, deleteAccount);

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics (BMI, BMR, TDEE, etc.)
 * @access  Private
 */
router.get('/stats', authenticate, getUserStats);

/**
 * @route   PUT /api/user/email
 * @desc    Update user email address
 * @access  Private
 */
router.put('/email', authenticate, updateEmail);

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences and settings
 * @access  Private
 */
router.get('/preferences', authenticate, getPreferences);

module.exports = router; 