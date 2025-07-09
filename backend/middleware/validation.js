const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  handleValidationErrors
];

/**
 * Validation rules for password reset request
 */
const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  handleValidationErrors
];

/**
 * Validation rules for password reset
 */
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  handleValidationErrors
];

/**
 * Validation rules for profile update
 */
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      
      return true;
    }),
    
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
    
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
    
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
    
  body('fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array')
    .custom((goals) => {
      const validGoals = ['weight-loss', 'weight-gain', 'muscle-gain', 'strength', 'general-fitness'];
      const invalidGoals = goals.filter(goal => !validGoals.includes(goal));
      
      if (invalidGoals.length > 0) {
        throw new Error(`Invalid fitness goals: ${invalidGoals.join(', ')}`);
      }
      
      return true;
    }),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
    
  body('goalWeight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Goal weight must be between 20 and 500 kg'),
    
  body('profilePhoto')
    .optional()
    .custom((value) => {
      if (!value) return true; // Allow empty values
      
      // Check if it's a valid data URI format
      const dataUriRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
      if (!dataUriRegex.test(value)) {
        throw new Error('Profile photo must be a valid image data URI (JPEG, PNG, GIF, WebP)');
      }
      
      // Estimate file size (base64 is about 4/3 the size of original)
      const base64Data = value.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 image data');
      }
      
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSizeInMB = 5; // 5MB limit
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (sizeInBytes > maxSizeInBytes) {
        throw new Error(`Profile photo must be under ${maxSizeInMB}MB`);
      }
      
      return true;
    }),
    
  body('bio')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
    
  // Fitness preference fields
  body('fitnessExperience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Fitness experience must be one of: beginner, intermediate, advanced, expert'),
    
  body('workoutFrequency')
    .optional()
    .isIn(['2-3', '3-4', '4-5', '5-6', 'daily'])
    .withMessage('Workout frequency must be one of: 2-3, 3-4, 4-5, 5-6, daily'),
    
  body('workoutDuration')
    .optional()
    .isIn(['15-30', '30-45', '45-60', '60-90', '90+'])
    .withMessage('Workout duration must be one of: 15-30, 30-45, 45-60, 60-90, 90+'),
    
  body('dietaryPreference')
    .optional()
    .isIn(['No Restrictions', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Low Carb', 'Gluten Free', 'Dairy Free', 'Intermittent Fasting', 'Pescatarian', 'Other'])
    .withMessage('Invalid dietary preference'),
    
  body('preferredWorkouts')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Preferred workouts cannot exceed 500 characters'),
    
  // Dynamic goal-specific fields
  body('targetMuscleGain')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Target muscle gain must be between 0 and 50 kg'),
    
  body('currentStrengthLevel')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Strength level must be one of: Beginner, Intermediate, Advanced'),
    
  handleValidationErrors
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
    
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
    
  handleValidationErrors
];

/**
 * Validation rules for refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
    
  handleValidationErrors
];

/**
 * Validation rules for email OTP requests
 */
const validateEmailOTP = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  handleValidationErrors
];

/**
 * Validation rules for OTP verification
 */
const validateOTP = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .matches(/^[0-9]{6}$/)
    .withMessage('OTP must contain only numbers'),
    
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateProfileUpdate,
  validatePasswordChange,
  validateRefreshToken,
  validateEmailOTP,
  validateOTP,
  handleValidationErrors
}; 