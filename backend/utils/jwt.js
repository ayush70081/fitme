const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token for user
 * @param {Object} payload - User data to include in token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
      issuer: 'fitness-tracker-api',
      audience: 'fitness-tracker-client'
    });
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'fitness-tracker-api',
      audience: 'fitness-tracker-client'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Generate access token for authenticated user
 * @param {Object} user - User object from database
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    username: user.username,
    type: 'access'
  };
  
  return generateToken(payload);
};

/**
 * Generate refresh token for user (longer expiry)
 * @param {Object} user - User object from database
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    type: 'refresh'
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // Refresh tokens last longer
    issuer: 'fitness-tracker-api',
    audience: 'fitness-tracker-client'
  });
};

/**
 * Decode token without verification (for expired token handling)
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error('Token decode failed');
  }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    return token;
  }
  
  // If it's just the token without Bearer prefix
  if (authHeader.trim()) {
    return authHeader.trim();
  }
  
  return null;
};

/**
 * Check if token is expired
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.payload.exp < currentTime;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

/**
 * Get token expiration time
 * @param {String} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    return new Date(decoded.payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiration
}; 