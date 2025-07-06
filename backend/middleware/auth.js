const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Check if token type is access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      req.userId = null;
      return next();
    }

    // Verify the token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = user;
      req.userId = user._id;
      req.token = token;
    } else {
      req.user = null;
      req.userId = null;
    }

    next();
  } catch (error) {
    // If token verification fails, continue without authentication
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // If no roles specified, just check authentication
    if (roles.length === 0) {
      return next();
    }

    // Check if user has required role (for future implementation)
    const userRole = req.user.role || 'user';
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user profile is complete
 */
const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!req.user.isProfileComplete()) {
    return res.status(400).json({
      success: false,
      message: 'Profile incomplete. Please complete your profile first.',
      code: 'PROFILE_INCOMPLETE'
    });
  }

  next();
};

/**
 * Middleware to validate refresh token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken);

    // Check if token type is refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token type.'
      });
    }

    // Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is valid but user not found.'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;
    
    next();
  } catch (error) {
    console.error('Refresh token validation error:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token.',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireCompleteProfile,
  validateRefreshToken
}; 