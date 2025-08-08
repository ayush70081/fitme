const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  verifyToken,
  sendOTP,
  verifyOTP,
  resendOTP,
  requestPasswordReset,
  resetPasswordWithOTP
} = require('../controllers/authController');

// Import middleware
const { authenticate, validateRefreshToken } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateRefreshToken: validateRefreshTokenBody,
  validateOTP,
  validateEmailOTP,
  validatePasswordResetRequest,
  validatePasswordReset
} = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', validateRefreshTokenBody, validateRefreshToken, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, validatePasswordChange, changePassword);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP for email verification
 * @access  Public
 */
router.post('/send-otp', validateEmailOTP, sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and activate account
 * @access  Public
 */
router.post('/verify-otp', validateOTP, verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for email verification
 * @access  Public
 */
router.post('/resend-otp', validateEmailOTP, resendOTP);

/**
 * @route   POST /api/auth/forgot-password/request
 * @desc    Request password reset code
 * @access  Public
 */
router.post('/forgot-password/request', validatePasswordResetRequest, requestPasswordReset);

/**
 * @route   POST /api/auth/forgot-password/confirm
 * @desc    Confirm password reset with OTP
 * @access  Public
 */
router.post('/forgot-password/confirm', validatePasswordReset, resetPasswordWithOTP);

module.exports = router; 