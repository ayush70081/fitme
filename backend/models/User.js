const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // Profile fields
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but enforce uniqueness for non-null values
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    default: ''
  },

  // Profile photo
  profilePhoto: {
    type: String, // Store as base64 data URI
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow null/empty values
        
        // Check if it's a valid data URI format
        const dataUriRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        if (!dataUriRegex.test(value)) {
          return false;
        }
        
        // Estimate file size (base64 is about 4/3 the size of original)
        const base64Data = value.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSizeInMB = 5; // 5MB limit
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        
        return sizeInBytes <= maxSizeInBytes;
      },
      message: 'Profile photo must be a valid image (JPEG, PNG, GIF, WebP) and under 5MB'
    }
  },

  // Fitness profile
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  height: {
    type: Number, // in cm
    min: [50, 'Height must be at least 50cm'],
    max: [300, 'Height cannot exceed 300cm']
  },
  weight: {
    type: Number, // in kg
    min: [20, 'Weight must be at least 20kg'],
    max: [500, 'Weight cannot exceed 500kg']
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'],
    default: 'sedentary'
  },
  fitnessGoals: [{
    type: String,
    enum: ['weight-loss', 'weight-gain', 'muscle-gain', 'strength', 'general-fitness']
  }],

  // Contact and location
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  // Goal weight
  goalWeight: {
    type: Number, // in kg
    min: [20, 'Goal weight must be at least 20kg'],
    max: [500, 'Goal weight cannot exceed 500kg']
  },

  // Extended questionnaire fields
  fitnessExperience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  preferredWorkouts: {
    type: String, // Store as comma-separated string
    default: ''
  },
  workoutFrequency: {
    type: String,
    enum: ['2-3', '3-4', '4-5', '5-6', 'daily'],
    default: '2-3'
  },
  workoutDuration: {
    type: String,
    enum: ['15-30', '30-45', '45-60', '60-90', '90+'],
    default: '30-45'
  },
  dietaryPreference: {
    type: String,
    enum: ['No Restrictions', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Low Carb', 'Gluten Free', 'Dairy Free', 'Intermittent Fasting', 'Pescatarian', 'Other'],
    default: 'No Restrictions'
  },

  // Dynamic goal-specific fields
  targetMuscleGain: {
    type: Number, // in kg
    min: [0, 'Target muscle gain cannot be negative'],
    max: [50, 'Target muscle gain cannot exceed 50kg']
  },
  currentStrengthLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },

  // System fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Email verification OTP fields
  emailOTP: {
    type: String,
    select: false // Don't include in queries by default
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },

  // Password reset OTP fields
  passwordResetOTP: {
    type: String,
    select: false
  },
  passwordResetExpiresAt: {
    type: Date,
    select: false
  },
  passwordResetAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  passwordResetLastSentAt: {
    type: Date,
    select: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  lastLoginAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Fitness statistics
  totalWorkouts: {
    type: Number,
    default: 0
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  totalWorkoutTimeMinutes: {
    type: Number,
    default: 0
  },
  averageWorkoutTimeMinutes: {
    type: Number,
    default: 0
  },
  workoutHistory: [{
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    caloriesBurned: {
      type: Number,
      default: 0
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    workoutName: String,
    exercises: [{
      name: String,
      completed: Boolean,
      caloriesBurned: Number
    }]
  }],
  longestStreak: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  achievements: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to check if profile is complete
userSchema.methods.isProfileComplete = function() {
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'height', 'weight', 'activityLevel'];
  return requiredFields.every(field => this[field] != null && this[field] !== '');
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema); 