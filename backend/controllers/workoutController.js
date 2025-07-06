const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');

const generateWorkoutPlan = async (req, res) => {
  try {
    console.log('=== Backend Fallback Workout Plan Generation ===');
    console.log('Note: Primary workout generation is handled by Gemini on the frontend');
    
    // This endpoint now serves as a fallback only
    // The main workout generation is handled by Gemini API on the frontend
    
    const userId = req.user._id || req.user.id;
    console.log('User ID:', userId);
    
    const user = await User.findById(userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Extract user data for workout generation
    const userData = {
      goal: user.fitnessGoals?.[0] || 'general-fitness',
      weight: user.weight,
      height: user.height,
      age: calculateAge(user.dateOfBirth),
      gender: user.gender,
      fitnessExperience: user.fitnessExperience || 'beginner',
      preferredWorkouts: user.preferredWorkouts ? user.preferredWorkouts.split(',') : [],
      dietaryPreference: user.dietaryPreference || 'none',
      workoutFrequency: user.workoutFrequency || '3-4',
      workoutDuration: user.workoutDuration || '30-45'
    };

    console.log('User data:', JSON.stringify(userData, null, 2));

    // Determine duration per day from workout duration
    let durationPerDay = 30; // Default
    if (userData.workoutDuration) {
      switch (userData.workoutDuration) {
        case '15-30':
          durationPerDay = 30;
          break;
        case '30-45':
          durationPerDay = 45;
          break;
        case '45-60':
          durationPerDay = 60;
          break;
        case '60-90':
          durationPerDay = 90;
          break;
        case '90+':
          durationPerDay = 120;
          break;
      }
    }

    console.log('🔄 Providing fallback demo workout plan');
    
    const fallbackPlan = {
      goal: mapGoalToDescription(userData.goal),
      duration_per_day_minutes: durationPerDay,
      preference: userData.preferredWorkouts.length > 0 ? userData.preferredWorkouts : ["Cardio", "Strength"],
      days: [
        {
          day: "Day 1",
          workout_type: "Full Body Cardio",
          estimated_calories_burned: 250,
          exercises: [
            {
              name: "Jumping Jacks",
              type: "Cardio",
              sets: 3,
              reps: 20,
              rest_between_sets_seconds: 30,
              description: "Stand upright and jump while spreading your legs and arms; return to start position.",
              calories_burned: 60
            },
            {
              name: "Push-ups",
              type: "Strength",
              sets: 3,
              reps: 10,
              rest_between_sets_seconds: 45,
              description: "Start in plank position, lower body until chest nearly touches floor, push back up.",
              calories_burned: 50
            },
            {
              name: "Bodyweight Squats",
              type: "Strength",
              sets: 3,
              reps: 15,
              rest_between_sets_seconds: 30,
              description: "Stand with feet shoulder-width apart, bend knees and lower into a squat, then return.",
              calories_burned: 70
            },
            {
              name: "Mountain Climbers",
              type: "Cardio",
              sets: 3,
              duration_seconds: 30,
              rest_between_sets_seconds: 30,
              description: "Start in plank position and rapidly alternate knees toward your chest.",
              calories_burned: 70
            }
          ]
        },
        {
          day: "Day 2",
          workout_type: "Upper Body Focus",
          estimated_calories_burned: 220,
          exercises: [
            {
              name: "Arm Circles",
              type: "Warm-up",
              sets: 2,
              reps: 15,
              description: "Extend arms and make small circles, gradually increasing size.",
              calories_burned: 20
            },
            {
              name: "Pike Push-ups",
              type: "Strength",
              sets: 3,
              reps: 8,
              rest_between_sets_seconds: 45,
              description: "Start in downward dog position, bend elbows to lower head toward floor.",
              calories_burned: 60
            },
            {
              name: "Tricep Dips",
              type: "Strength",
              sets: 3,
              reps: 12,
              rest_between_sets_seconds: 30,
              description: "Sit on edge of chair, lower body by bending elbows, push back up.",
              calories_burned: 50
            },
            {
              name: "Plank Hold",
              type: "Core",
              sets: 3,
              duration_seconds: 30,
              rest_between_sets_seconds: 30,
              description: "Hold straight-body position on elbows and toes, engaging core.",
              calories_burned: 40
            },
            {
              name: "Burpees",
              type: "Cardio",
              sets: 2,
              reps: 8,
              rest_between_sets_seconds: 60,
              description: "Squat down, jump back to plank, do push-up, jump feet forward, jump up.",
              calories_burned: 50
            }
          ]
        },
        {
          day: "Day 3",
          workout_type: "Lower Body & Core",
          estimated_calories_burned: 280,
          exercises: [
            {
              name: "Leg Swings",
              type: "Warm-up",
              sets: 2,
              reps: 10,
              description: "Hold wall for support, swing leg forward and back, then side to side.",
              calories_burned: 15
            },
            {
              name: "Lunges",
              type: "Strength",
              sets: 3,
              reps: 12,
              rest_between_sets_seconds: 30,
              description: "Step forward into lunge position, lower back knee toward floor, return to start.",
              calories_burned: 80
            },
            {
              name: "Glute Bridges",
              type: "Strength",
              sets: 3,
              reps: 15,
              rest_between_sets_seconds: 30,
              description: "Lie on back, feet flat on floor, lift hips by squeezing glutes.",
              calories_burned: 45
            },
            {
              name: "Wall Sit",
              type: "Strength",
              sets: 3,
              duration_seconds: 30,
              rest_between_sets_seconds: 45,
              description: "Back against wall, slide down until thighs parallel to floor, hold position.",
              calories_burned: 40
            },
            {
              name: "High Knees",
              type: "Cardio",
              sets: 3,
              duration_seconds: 30,
              rest_between_sets_seconds: 30,
              description: "Jog in place while lifting knees as high as possible.",
              calories_burned: 60
            },
            {
              name: "Russian Twists",
              type: "Core",
              sets: 3,
              reps: 20,
              rest_between_sets_seconds: 30,
              description: "Sit with knees bent, lean back slightly, rotate torso side to side.",
              calories_burned: 40
            }
          ]
        }
      ]
    };

    return res.json({
      success: true,
      workoutPlan: fallbackPlan,
      message: 'Fallback workout plan generated (Gemini primary method)',
      isDemoMode: true
    });

  } catch (error) {
    console.error('❌ Error generating workout plan:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 25; // Default age if not provided
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const mapGoalToDescription = (goal) => {
  const goalMap = {
    'weight-loss': 'Weight Loss',
    'weight-gain': 'Weight Gain',
    'muscle-gain': 'Muscle Building',
    'strength': 'Strength Training',
    'general-fitness': 'General Fitness'
  };
  return goalMap[goal] || 'General Fitness';
};

const saveWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { workoutPlan, name } = req.body;

    console.log('Received workout plan data:', JSON.stringify({ workoutPlan, name }, null, 2));

    if (!workoutPlan) {
      return res.status(400).json({
        success: false,
        message: 'Workout plan data is required'
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Workout plan name is required'
      });
    }

    // Validate workout plan structure
    if (!workoutPlan.goal) {
      return res.status(400).json({
        success: false,
        message: 'Workout plan goal is required'
      });
    }

    // Validate days array
    if (workoutPlan.days && workoutPlan.days.length > 0) {
      for (let i = 0; i < workoutPlan.days.length; i++) {
        const day = workoutPlan.days[i];
        if (!day.day) {
          return res.status(400).json({
            success: false,
            message: `Day field is required for day ${i + 1}`
          });
        }
        if (!day.workout_type) {
          return res.status(400).json({
            success: false,
            message: `Workout type is required for day ${i + 1}`
          });
        }
        
        // Validate exercises
        if (day.exercises && day.exercises.length > 0) {
          for (let j = 0; j < day.exercises.length; j++) {
            const exercise = day.exercises[j];
            if (!exercise.name) {
              return res.status(400).json({
                success: false,
                message: `Exercise name is required for exercise ${j + 1} on day ${i + 1}`
              });
            }
            if (!exercise.type) {
              return res.status(400).json({
                success: false,
                message: `Exercise type is required for exercise ${j + 1} on day ${i + 1}`
              });
            }
          }
        }
      }
    }

    // Create new workout plan
    const newWorkoutPlan = new WorkoutPlan({
      userId,
      name: name.trim(),
      goal: workoutPlan.goal,
      duration_per_day_minutes: workoutPlan.duration_per_day_minutes,
      preference: workoutPlan.preference || [],
      days: workoutPlan.days || [],
      isAIGenerated: workoutPlan.isAIGenerated || false
    });

    console.log('About to save workout plan:', JSON.stringify(newWorkoutPlan.toObject(), null, 2));

    const savedPlan = await newWorkoutPlan.save();

    res.json({
      success: true,
      message: 'Workout plan saved successfully',
      workoutPlan: savedPlan
    });

  } catch (error) {
    console.error('Error saving workout plan:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to save workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getSavedWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;

    const options = {
      limit: parseInt(limit),
      sort: {}
    };

    // Set sort options
    if (sort === 'name') {
      options.sort = { name: 1 };
    } else if (sort === 'lastUsed') {
      options.sort = { lastUsed: -1 };
    } else {
      options.sort = { createdAt: -1 };
    }

    const workoutPlans = await WorkoutPlan.getUserPlans(userId, options);
    const total = await WorkoutPlan.countDocuments({ userId });

    res.json({
      success: true,
      workoutPlans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching saved workout plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved workout plans',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getWorkoutPlanById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { planId } = req.params;

    const workoutPlan = await WorkoutPlan.findOne({ _id: planId, userId });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    // Mark as used
    await workoutPlan.markAsUsed();

    res.json({
      success: true,
      workoutPlan
    });

  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { planId } = req.params;

    const workoutPlan = await WorkoutPlan.findOneAndDelete({ _id: planId, userId });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const setActivePlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { planId } = req.params;

    const workoutPlan = await WorkoutPlan.findOne({ _id: planId, userId });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    await workoutPlan.setAsActive();

    res.json({
      success: true,
      message: 'Workout plan set as active successfully',
      workoutPlan
    });

  } catch (error) {
    console.error('Error setting active workout plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set active workout plan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const createCustomWorkout = async (req, res) => {
  try {
    console.log('=== Custom Workout Creation Debug ===');
    console.log('Request user:', req.user ? 'Present' : 'Missing');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const userId = req.user._id || req.user.id;
    console.log('User ID:', userId);
    
    const { name, exercises } = req.body;

    if (!name || name.trim().length === 0) {
      console.log('❌ Validation failed: Missing workout name');
      return res.status(400).json({
        success: false,
        message: 'Workout name is required'
      });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      console.log('❌ Validation failed: Missing or invalid exercises');
      return res.status(400).json({
        success: false,
        message: 'At least one exercise is required'
      });
    }

    // Validate exercises
    console.log('Validating exercises...');
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      console.log(`Exercise ${i + 1}:`, exercise);
      if (!exercise.name || exercise.name.trim().length === 0) {
        console.log(`❌ Validation failed: Exercise ${i + 1} missing name`);
        return res.status(400).json({
          success: false,
          message: `Exercise ${i + 1} name is required`
        });
      }
    }

    // Convert the custom workout format to our workout plan format
    const customWorkoutPlan = {
      userId,
      name: name.trim(),
      goal: 'Custom Workout',
      duration_per_day_minutes: calculateWorkoutDuration(exercises),
      preference: ['Custom'],
      days: [{
        day: "Custom Workout",
        workout_type: "Custom Exercise Plan",
        estimated_calories_burned: calculateTotalCalories(exercises),
        exercises: exercises.map(exercise => {
          const processedExercise = {
            name: exercise.name.trim(),
            type: exercise.type || 'Custom',
            rest_between_sets_seconds: exercise.rest || 60,
            description: exercise.description || `Custom exercise: ${exercise.name}`,
            calories_burned: calculateExerciseCalories(exercise)
          };
          
          // Only add sets/reps if they are provided and valid
          if (exercise.sets && parseInt(exercise.sets) > 0) {
            processedExercise.sets = parseInt(exercise.sets);
          }
          if (exercise.reps && parseInt(exercise.reps) > 0) {
            processedExercise.reps = parseInt(exercise.reps);
          }
          
          // Only add duration if provided and valid
          if (exercise.duration && parseInt(exercise.duration) > 0) {
            processedExercise.duration_minutes = parseInt(exercise.duration);
          }
          
          return processedExercise;
        })
      }],
      isAIGenerated: false,
      isCustom: true
    };

    console.log('Creating workout plan with data:', JSON.stringify(customWorkoutPlan, null, 2));
    
    const newWorkoutPlan = new WorkoutPlan(customWorkoutPlan);
    console.log('Saving workout plan to database...');
    
    const savedPlan = await newWorkoutPlan.save();
    console.log('✅ Workout plan saved successfully:', savedPlan._id);

    res.json({
      success: true,
      message: 'Custom workout created successfully',
      workoutPlan: savedPlan
    });

  } catch (error) {
    console.error('❌ Error creating custom workout:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create custom workout',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to calculate workout duration
const calculateWorkoutDuration = (exercises) => {
  let totalMinutes = 0;
  exercises.forEach(exercise => {
    if (exercise.duration) {
      totalMinutes += parseInt(exercise.duration) || 0;
    } else if (exercise.sets && exercise.reps) {
      // Estimate time: 30 seconds per set + rest time
      const sets = parseInt(exercise.sets) || 1;
      const restTime = (exercise.rest || 60) * sets / 60; // Convert to minutes
      totalMinutes += (sets * 0.5) + restTime; // 30 seconds per set + rest
    } else {
      totalMinutes += 5; // Default 5 minutes per exercise
    }
  });
  return Math.max(totalMinutes, 10); // Minimum 10 minutes
};

// Helper function to calculate total calories
const calculateTotalCalories = (exercises) => {
  let totalCalories = 0;
  exercises.forEach(exercise => {
    totalCalories += calculateExerciseCalories(exercise);
  });
  return Math.max(totalCalories, 50); // Minimum 50 calories
};

// Helper function to calculate exercise calories
const calculateExerciseCalories = (exercise) => {
  const sets = parseInt(exercise.sets) || 1;
  const reps = parseInt(exercise.reps) || 10;
  const duration = parseInt(exercise.duration) || 0;

  if (duration > 0) {
    // Duration-based exercises: ~5 calories per minute
    return duration * 5;
  } else {
    // Sets/reps based exercises: estimate based on intensity
    const totalReps = sets * reps;
    return Math.max(totalReps * 0.5, 20); // At least 20 calories per exercise
  }
};

const completeWorkout = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { workoutId, caloriesBurned, durationMinutes, completedExercises, workoutName } = req.body;

    // Validate required data
    if (!caloriesBurned || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Calories burned and workout duration are required'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create workout completion entry
    const workoutCompletion = {
      workoutId: workoutId || null,
      completedAt: new Date(),
      caloriesBurned: parseInt(caloriesBurned),
      durationMinutes: parseInt(durationMinutes),
      workoutName: workoutName || 'Custom Workout',
      exercises: completedExercises || []
    };

    // Update user statistics
    user.totalWorkouts += 1;
    user.totalCaloriesBurned += parseInt(caloriesBurned);
    user.totalWorkoutTimeMinutes += parseInt(durationMinutes);
    user.averageWorkoutTimeMinutes = Math.round(user.totalWorkoutTimeMinutes / user.totalWorkouts);
    
    // Add to workout history
    user.workoutHistory.push(workoutCompletion);
    
    // Keep only last 50 workouts in history to prevent document from growing too large
    if (user.workoutHistory.length > 50) {
      user.workoutHistory = user.workoutHistory.slice(-50);
    }

    await user.save();

    res.json({
      success: true,
      message: 'Workout completed successfully',
      statistics: {
        totalWorkouts: user.totalWorkouts,
        totalCaloriesBurned: user.totalCaloriesBurned,
        averageWorkoutTimeMinutes: user.averageWorkoutTimeMinutes,
        totalWorkoutTimeMinutes: user.totalWorkoutTimeMinutes
      }
    });

  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete workout',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getWorkoutStatistics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const statistics = {
      totalWorkouts: user.totalWorkouts || 0,
      totalCaloriesBurned: user.totalCaloriesBurned || 0,
      averageWorkoutTimeMinutes: user.averageWorkoutTimeMinutes || 0,
      totalWorkoutTimeMinutes: user.totalWorkoutTimeMinutes || 0,
      recentWorkouts: user.workoutHistory ? user.workoutHistory.slice(-5).reverse() : []
    };

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error fetching workout statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  generateWorkoutPlan,
  saveWorkoutPlan,
  getSavedWorkoutPlans,
  getWorkoutPlanById,
  deleteWorkoutPlan,
  setActivePlan,
  createCustomWorkout,
  completeWorkout,
  getWorkoutStatistics
};