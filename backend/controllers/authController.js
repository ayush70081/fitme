const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

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
      isEmailVerified: true // Auto-verify for now since email verification is not implemented
    });

    console.log('Attempting to save user...');
    await user.save();
    console.log('User saved successfully:', user._id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken,
          refreshToken
        }
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

    // Check if account is verified (only enforce in production)
    // For development, we skip email verification
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && user.isEmailVerified === false) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in',
        errorCode: 'EMAIL_NOT_VERIFIED',
        suggestions: [
          'Check your email for a verification link',
          'Request a new verification email',
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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  verifyToken
}; 