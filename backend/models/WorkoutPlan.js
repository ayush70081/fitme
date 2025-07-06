const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  sets: {
    type: Number
  },
  reps: {
    type: mongoose.Schema.Types.Mixed
  },
  rounds: {
    type: Number
  },
  duration_minutes: {
    type: Number
  },
  duration_seconds: {
    type: Number
  },
  rest_between_sets_seconds: {
    type: Number
  },
  description: {
    type: String
  },
  calories_burned: {
    type: Number,
    default: 0
  }
});

const daySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  workout_type: {
    type: String,
    required: true
  },
  estimated_calories_burned: {
    type: Number,
    default: 0
  },
  exercises: [exerciseSchema]
});

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: String,
    required: true
  },
  duration_per_day_minutes: {
    type: Number,
    default: 30
  },
  preference: [{
    type: String
  }],
  days: [daySchema],
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

// Calculate total calories when saving
workoutPlanSchema.pre('save', function(next) {
  if (this.days && this.days.length > 0) {
    this.totalCaloriesBurned = this.days.reduce((total, day) => {
      return total + (day.estimated_calories_burned || 0);
    }, 0);
  }
  next();
});

// Instance methods
workoutPlanSchema.methods.markAsUsed = function() {
  this.lastUsed = new Date();
  return this.save();
};

workoutPlanSchema.methods.setAsActive = async function() {
  // Set all other plans for this user as inactive
  await this.constructor.updateMany(
    { userId: this.userId, _id: { $ne: this._id } },
    { isActive: false }
  );
  
  // Set this plan as active
  this.isActive = true;
  return this.save();
};

// Static methods
workoutPlanSchema.statics.getActivePlan = function(userId) {
  return this.findOne({ userId, isActive: true });
};

workoutPlanSchema.statics.getUserPlans = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 }); // Default: newest first
  }
  
  return query;
};

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = WorkoutPlan;