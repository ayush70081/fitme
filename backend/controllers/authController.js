const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const OTPGenerator = require('../utils/otpGenerator');
const emailService = require('../utils/emailService');

// Track failed login attempts (in production, use Redis or database)
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Debug logging
    console.log('Registration request received:', {
      email,
      firstName,
      lastName,
      username,
      passwordLength: password ? password.length : 0,
      body: req.body
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        errorCode: 'EMAIL_EXISTS',
        suggestions: [
          'Try logging in instead',
          'Use the "Forgot Password" link if you forgot your password',
          'Contact support if you believe this is an error'
        ]
      });
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        console.log('Username already taken:', username);
        return res.status(400).json({
          success: false,
          message: 'Username is already taken',
          errorCode: 'USERNAME_EXISTS',
          suggestions: [
            'Try a different username',
            'Add numbers or special characters to make it unique'
          ]
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      username: username || email.split('@')[0], // Generate username from email if not provided
      isEmailVerified: false // Email verification required
    });

    console.log('Attempting to save user...');
    await user.save();
    console.log('User saved successfully:', user._id);

    // Send OTP email for verification
    try {
      await sendOTPEmail(user._id);
      console.log('OTP email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification code.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profileCompleted: user.profileCompleted,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt
        },
        requiresEmailVerification: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already taken`,
        errorCode: 'DUPLICATE_FIELD',
        field: field
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      console.log('Mongoose validation errors:', validationErrors);

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      errorCode: 'SERVER_ERROR'
    });
  }
};

/**
 * Check if account is locked due to failed attempts
 */
const isAccountLocked = (email) => {
  const attempts = failedAttempts.get(email);
  if (!attempts) return false;
  
  const now = Date.now();
  if (attempts.count >= MAX_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_TIME) {
    return {
      locked: true,
      timeRemaining: Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 1000 / 60)
    };
  }
  
  // Reset if lockout period has passed
  if ((now - attempts.lastAttempt) >= LOCKOUT_TIME) {
    failedAttempts.delete(email);
    return false;
  }
  
  return false;
};

/**
 * Record failed login attempt
 */
const recordFailedAttempt = (email) => {
  const now = Date.now();
  const attempts = failedAttempts.get(email) || { count: 0, lastAttempt: now };
  
  attempts.count += 1;
  attempts.lastAttempt = now;
  failedAttempts.set(email, attempts);
  
  return {
    count: attempts.count,
    remaining: MAX_ATTEMPTS - attempts.count
  };
};

/**
 * Clear failed attempts on successful login
 */
const clearFailedAttempts = (email) => {
  failedAttempts.delete(email);
};

/**
 * Enhanced login with specific error messages
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        errorCode: 'MISSING_CREDENTIALS',
        missingFields: {
          email: !email,
          password: !password
        }
      });
    }

    // Check if account is locked
    const lockStatus = isAccountLocked(email);
    if (lockStatus && lockStatus.locked) {
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked due to multiple failed login attempts. Try again in ${lockStatus.timeRemaining} minutes.`,
        errorCode: 'ACCOUNT_LOCKED',
        timeRemaining: lockStatus.timeRemaining,
        suggestions: [
          'Wait for the lockout period to end',
          'Use "Forgot Password" to reset your password',
          'Contact support if you need immediate access'
        ]
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Record failed attempt for email enumeration protection
      recordFailedAttempt(email);
      
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND',
        suggestions: [
          'Check your email address for typos',
          'Create a new account if you haven\'t registered yet',
          'Contact support if you believe this email should be registered'
        ]
      });
    }

    // Check if account is verified
    if (user.isEmailVerified === false) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in',
        errorCode: 'EMAIL_NOT_VERIFIED',
        data: {
          userId: user._id,
          email: user.email
        },
        suggestions: [
          'Check your email for a verification code',
          'Request a new verification code',
          'Contact support if you need help'
        ]
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const attemptInfo = recordFailedAttempt(email);
      
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
        errorCode: 'INVALID_PASSWORD',
        attemptsRemaining: attemptInfo.remaining,
        suggestions: [
          'Check your password for typos',
          'Make sure Caps Lock is not on',
          'Use "Forgot Password" if you can\'t remember your password',
          `${attemptInfo.remaining} attempts remaining before account lockout`
        ]
      });
    }

    // Successful login - clear failed attempts
    clearFailedAttempts(email);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profileCompleted: user.profileCompleted,
          lastLoginAt: user.lastLoginAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error. Please try again.',
      errorCode: 'SERVER_ERROR',
      suggestions: [
        'Try again in a few moments',
        'Contact support if the problem persists'
      ]
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = async (req, res) => {
  try {
    const user = req.user; // Set by validateRefreshToken middleware

    // Generate new access token
    const accessToken = generateAccessToken(user);
    
    // Optionally generate new refresh token for security
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed. Please login again.',
      errorCode: 'TOKEN_REFRESH_FAILED'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // or store logout time in the user record
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      errorCode: 'LOGOUT_ERROR'
    });
  }
};

/**
 * Get current user info
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId || req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User data retrieved successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user data',
      errorCode: 'GET_USER_ERROR'
    });
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId || req.user._id;

    // Find user with password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        errorCode: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Prevent reusing the current password
    const isSameAsOld = await user.comparePassword(newPassword);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password',
        errorCode: 'PASSWORD_REUSE_NOT_ALLOWED',
        suggestions: [
          'Choose a password you have not used before',
          'Add length (12+ chars) and mix letters, numbers, symbols'
        ]
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed',
        errorCode: 'PASSWORD_VALIDATION_ERROR',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Password change failed',
      errorCode: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

/**
 * Verify token
 * @route GET /api/auth/verify
 * @access Private
 */
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      errorCode: 'TOKEN_VERIFICATION_ERROR'
    });
  }
};

/**
 * Send OTP email for verification
 * @param {string} userId - User ID
 * @returns {Promise} - OTP send result
 */
const sendOTPEmail = async (userId) => {
  const user = await User.findById(userId).select('+emailOTP +otpExpiresAt +otpAttempts');
  if (!user) {
    throw new Error('User not found');
  }

  // Generate OTP
  const otp = OTPGenerator.generateOTP();
  const hashedOTP = await OTPGenerator.hashOTP(otp);
  const otpExpiry = OTPGenerator.getOTPExpiry();

  // Save OTP to user
  user.emailOTP = hashedOTP;
  user.otpExpiresAt = otpExpiry;
  user.otpAttempts = 0;
  await user.save();

  // Send email
  await emailService.sendOTPEmail(user.email, otp, user.firstName);
  
  return { success: true };
};

/**
 * Send OTP for email verification
 * @route POST /api/auth/send-otp
 * @access Public
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errorCode: 'EMAIL_REQUIRED'
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+emailOTP +otpExpiresAt +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        errorCode: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Rate limiting - check if too many attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.',
        errorCode: 'TOO_MANY_ATTEMPTS'
      });
    }

    // Check if OTP was sent recently (prevent spam)
    if (user.otpExpiresAt && !OTPGenerator.isOTPExpired(user.otpExpiresAt)) {
      const timeRemaining = Math.ceil((user.otpExpiresAt - new Date()) / 1000);
      return res.status(429).json({
        success: false,
        message: `OTP already sent. Please wait ${timeRemaining} seconds before requesting again.`,
        errorCode: 'OTP_ALREADY_SENT',
        timeRemaining
      });
    }

    // Send OTP
    await sendOTPEmail(user._id);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email address',
      data: {
        email: user.email,
        expiresIn: '5 minutes'
      }
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      errorCode: 'SEND_OTP_ERROR'
    });
  }
};

/**
 * Verify OTP and activate account
 * @route POST /api/auth/verify-otp
 * @access Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        errorCode: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate OTP format
    if (!OTPGenerator.validateOTPFormat(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. OTP must be 6 digits.',
        errorCode: 'INVALID_OTP_FORMAT'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+emailOTP +otpExpiresAt +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        errorCode: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Check if OTP exists
    if (!user.emailOTP || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new OTP.',
        errorCode: 'NO_OTP_FOUND'
      });
    }

    // Check if OTP is expired
    if (OTPGenerator.isOTPExpired(user.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
        errorCode: 'OTP_EXPIRED'
      });
    }

    // Check attempts limit
    if (user.otpAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
        errorCode: 'TOO_MANY_ATTEMPTS'
      });
    }

    // Verify OTP
    const isOTPValid = await OTPGenerator.verifyOTP(otp, user.emailOTP);
    if (!isOTPValid) {
      // Increment attempts
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        errorCode: 'INVALID_OTP',
        attemptsRemaining: 3 - user.otpAttempts
      });
    }

    // Success - verify email and clear OTP data
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if welcome email fails
    }

    // Generate tokens for automatic login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to FitMe!',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profileCompleted: user.profileCompleted,
          isEmailVerified: user.isEmailVerified,
          lastLoginAt: user.lastLoginAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      errorCode: 'VERIFY_OTP_ERROR'
    });
  }
};

/**
 * Resend OTP
 * @route POST /api/auth/resend-otp
 * @access Public
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errorCode: 'EMAIL_REQUIRED'
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+emailOTP +otpExpiresAt +otpAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        errorCode: 'EMAIL_ALREADY_VERIFIED'
      });
    }

    // Send new OTP
    await sendOTPEmail(user._id);

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully to your email address',
      data: {
        email: user.email,
        expiresIn: '5 minutes'
      }
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      errorCode: 'RESEND_OTP_ERROR'
    });
  }
};

/**
 * Request password reset (send OTP to email)
 * @route POST /api/auth/forgot-password/request
 * @access Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errorCode: 'EMAIL_REQUIRED'
      });
    }

    // Find user and include password reset fields
    const user = await User.findOne({ email }).select('+passwordResetOTP +passwordResetExpiresAt +passwordResetAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    // Allow resend after 60 seconds regardless of OTP validity
    const now = new Date();
    if (user.passwordResetLastSentAt) {
      const secondsSinceLast = Math.floor((now - user.passwordResetLastSentAt) / 1000);
      if (secondsSinceLast < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${60 - secondsSinceLast} seconds before requesting a new code`,
          errorCode: 'RESEND_COOLDOWN',
          timeRemaining: 60 - secondsSinceLast
        });
      }
    }

    // Simple rate-limit based on attempts
    if (user.passwordResetAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many password reset requests. Please try again later.',
        errorCode: 'TOO_MANY_ATTEMPTS'
      });
    }

    // Generate new OTP for password reset
    const otp = OTPGenerator.generateOTP();
    const hashedOTP = await OTPGenerator.hashOTP(otp);
    const otpExpiry = OTPGenerator.getOTPExpiry();

    user.passwordResetOTP = hashedOTP;
    user.passwordResetExpiresAt = otpExpiry;
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = now;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetOTP(user.email, otp, user.firstName);

    return res.status(200).json({
      success: true,
      message: 'Password reset code sent successfully',
      data: { email: user.email, expiresIn: '5 minutes' }
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send password reset code',
      errorCode: 'PASSWORD_RESET_EMAIL_ERROR'
    });
  }
};

/**
 * Reset password using OTP
 * @route POST /api/auth/forgot-password/confirm
 * @access Public
 */
const resetPasswordWithOTP = async (req, res) => {
  try {
    // Accept 'password' as the new password field (matches validator and frontend)
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP and new password are required',
        errorCode: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (!OTPGenerator.validateOTPFormat(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format. OTP must be 6 digits.',
        errorCode: 'INVALID_OTP_FORMAT'
      });
    }

    // Find user with reset fields
    const user = await User.findOne({ email }).select('+password +passwordResetOTP +passwordResetExpiresAt +passwordResetAttempts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address',
        errorCode: 'EMAIL_NOT_FOUND'
      });
    }

    if (!user.passwordResetOTP || !user.passwordResetExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No password reset request found. Please request a new code.',
        errorCode: 'NO_RESET_REQUEST'
      });
    }

    if (OTPGenerator.isOTPExpired(user.passwordResetExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new code.',
        errorCode: 'OTP_EXPIRED'
      });
    }

    if (user.passwordResetAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
        errorCode: 'TOO_MANY_ATTEMPTS'
      });
    }

    const isValid = await OTPGenerator.verifyOTP(otp, user.passwordResetOTP);
    if (!isValid) {
      user.passwordResetAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
        errorCode: 'INVALID_OTP',
        attemptsRemaining: Math.max(0, 3 - user.passwordResetAttempts)
      });
    }

    // Prevent using the same password as current
    const isSameAsOld = await user.comparePassword(password);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current password',
        errorCode: 'PASSWORD_REUSE_NOT_ALLOWED',
        suggestions: [
          'Choose a password you have not used before',
          'Add length (12+ chars) and mix letters, numbers, symbols'
        ]
      });
    }

    // Update password and clear reset fields
    user.password = password;
    user.passwordResetOTP = undefined;
    user.passwordResetExpiresAt = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      errorCode: 'PASSWORD_RESET_ERROR'
    });
  }
};

module.exports = {
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
}; 