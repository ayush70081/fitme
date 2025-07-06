import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client with enhanced debugging
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Enhanced debugging for API key issues
console.log('🔍 Gemini API Status:', GEMINI_API_KEY ? 'API Key Loaded' : 'API Key Missing');

// Validate API key format
const isValidAPIKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  if (key === 'your_gemini_api_key_here') return false;
  if (key.length < 20) return false; // Gemini API keys are typically longer
  return true;
};

const apiKeyValid = isValidAPIKey(GEMINI_API_KEY);
console.log('✅ API Key Validation:', apiKeyValid ? 'VALID' : 'INVALID');

if (!GEMINI_API_KEY) {
  console.error('❌ Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.');
} else if (!apiKeyValid) {
  console.error('❌ Gemini API key appears to be invalid or placeholder. Please check your .env file.');
} else {
  console.log('✅ Gemini API key detected and appears valid.');
}

const genAI = apiKeyValid ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Get the model instance
const getModel = () => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please check your API key.');
  }
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 4096,
    }
  });
};

// Generate workout plan using Gemini API
export const generateWorkoutPlanWithGemini = async (userProfile) => {
  try {
    const model = getModel();
    
    // Create a comprehensive prompt with user data
    const prompt = createWorkoutPrompt(userProfile);
    
    console.log('Generating workout plan with Gemini API...');
    console.log('User profile:', userProfile);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    // Parse the JSON response
    const workoutPlan = parseWorkoutResponse(text);
    
    console.log('Parsed workout plan:', workoutPlan);
    
    return {
      workoutPlan,
      isAIGenerated: true,
      isDemoMode: false
    };
    
  } catch (error) {
    console.error('Error generating workout plan with Gemini:', error);
    
    // Return demo data if API fails
    return {
      workoutPlan: getDemoWorkoutPlan(userProfile),
      isAIGenerated: false,
      isDemoMode: true,
      message: 'Gemini API unavailable - showing demo workout plan'
    };
  }
};

// Create a detailed prompt for workout generation
const createWorkoutPrompt = (userProfile) => {
  const {
    fitnessGoals = [],
    activityLevel = 'moderately-active',
    fitnessExperience = 'intermediate',
    preferredWorkouts = [],
    workoutFrequency = '3-4',
    workoutDuration = '45-60',
    height,
    weight,
    age,
    gender,
    dietaryPreference,
    targetMuscleGain,
    goalWeight,
    currentStrengthLevel,
    customOptions = null
  } = userProfile;

  const primaryGoal = Array.isArray(fitnessGoals) ? fitnessGoals[0] : fitnessGoals;
  const workoutTypes = Array.isArray(preferredWorkouts) ? preferredWorkouts.join(', ') : preferredWorkouts;
  
  // Override with custom options if provided
  const finalDuration = customOptions?.duration || workoutDuration;
  const focusArea = customOptions?.focusArea;
  const intensity = customOptions?.intensity;
  const equipment = customOptions?.equipment;
  const specificGoals = customOptions?.specificGoals;
  
  // Determine number of workout days based on frequency
  const getWorkoutDays = (frequency) => {
    const frequencyMap = {
      '2-3': 3,
      '3-4': 4, 
      '4-5': 5,
      '5-6': 6,
      'daily': 7
    };
    return frequencyMap[frequency] || 3; // Default to 3 if not specified
  };
  
  const numberOfDays = getWorkoutDays(workoutFrequency);
  const dayLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].slice(0, numberOfDays);
  
  return `You are an expert fitness trainer and nutritionist. Create a personalized ${numberOfDays}-day workout plan based on the following user profile:

USER PROFILE:
- Primary Fitness Goal: ${primaryGoal || 'general fitness'}
- Activity Level: ${activityLevel}
- Fitness Experience: ${fitnessExperience}
- Preferred Workout Types: ${workoutTypes || 'varied'}
- Workout Frequency: ${workoutFrequency} times per week
- Session Duration: ${finalDuration} minutes
- Height: ${height || 'not specified'} cm
- Weight: ${weight || 'not specified'} kg
- Age: ${age || 'not specified'}
- Gender: ${gender || 'not specified'}
- Dietary Preference: ${dietaryPreference || 'no restrictions'}
${targetMuscleGain ? `- Target Muscle Gain: ${targetMuscleGain} kg` : ''}
${goalWeight ? `- Goal Weight: ${goalWeight} kg` : ''}
${currentStrengthLevel ? `- Current Strength Level: ${currentStrengthLevel}` : ''}

${customOptions ? `CUSTOM PREFERENCES:
${focusArea ? `- Focus Area: ${focusArea}` : ''}
${intensity ? `- Intensity Level: ${intensity}` : ''}
${equipment ? `- Available Equipment: ${equipment}` : ''}
${specificGoals ? `- Specific Goals: ${specificGoals}` : ''}` : ''}

REQUIREMENTS:
1. Create exactly ${numberOfDays} workout days (${dayLabels.join(', ')})
2. Each day should have 4-8 exercises
3. Include detailed exercise descriptions with proper form instructions
4. Provide sets, reps, duration, and rest periods for each exercise
5. Calculate realistic calorie burn estimates
6. Ensure exercises match the user's fitness level and goals
7. Include variety between days (e.g., upper body, lower body, full body, active recovery)
8. Consider the user's preferred workout types when possible
9. For ${numberOfDays}-day plans, ensure proper muscle group rotation and recovery
${customOptions ? `10. IMPORTANT: Follow custom preferences - focus on ${focusArea || 'balanced training'}, use ${equipment || 'bodyweight'} exercises, target ${intensity || 'appropriate'} intensity level` : ''}
${specificGoals ? `11. SPECIAL INSTRUCTIONS: ${specificGoals}` : ''}

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure. IMPORTANT: All numeric fields must be actual numbers, not strings or ranges:

{
  "name": "Personalized ${numberOfDays}-Day Workout Plan",
  "goal": "${primaryGoal || 'Improve Overall Fitness'}",
  "duration_per_day_minutes": ${parseInt(finalDuration?.split('-')[1]) || 45},
  "preference": ["${workoutTypes || 'Mixed Training'}"],
  "frequency": "${workoutFrequency}",
  "days": [
    ${dayLabels.map((day, index) => {
      const workoutTypes = numberOfDays <= 3 
        ? ['Full Body', 'Upper Body Strength', 'Lower Body & Core'][index] || 'Mixed Training'
        : numberOfDays <= 5
        ? ['Upper Body', 'Lower Body', 'Cardio & Core', 'Full Body', 'Active Recovery'][index] || 'Mixed Training'
        : ['Push (Chest, Shoulders, Triceps)', 'Pull (Back, Biceps)', 'Legs & Glutes', 'Upper Body', 'Lower Body', 'Cardio & Core', 'Active Recovery'][index] || 'Mixed Training';
      
      return `{
      "day": "${day}",
      "workout_type": "${workoutTypes}",
      "estimated_calories_burned": 300,
      "exercises": [
        {
          "name": "Exercise Name",
          "type": "Strength",
          "sets": 3,
          "reps": 12,
          "duration_minutes": 0,
          "duration_seconds": 0,
          "rest_between_sets_seconds": 60,
          "calories_burned": 50,
          "description": "Detailed exercise description with proper form instructions, muscles targeted, and safety tips. Include step-by-step instructions."
        }
      ]
    }`;
    }).join(',\n    ')}
  ]
}

CRITICAL JSON FORMATTING RULES:
- "reps" must be a number (e.g., 12) or null if time-based
- "sets" must be a number (e.g., 3)
- "calories_burned" must be a number (e.g., 50)
- "estimated_calories_burned" must be a number (e.g., 300)
- Do NOT use ranges like "8-12" - use the average number instead (e.g., 10)
- Do NOT use text like "As many as possible" - use null instead
- All duration fields must be numbers or 0

Important notes:
- Use realistic calorie estimates based on exercise intensity and duration
- Adjust exercise difficulty based on fitness experience level
- Include both compound and isolation exercises when appropriate
- Provide detailed, helpful descriptions for each exercise
- Ensure total workout time matches the preferred duration
- For ${numberOfDays}-day plans, vary workout types appropriately (full body for 3 days, upper/lower split for 4-5 days, push/pull/legs for 6+ days)
- Include active recovery or lighter days for longer plans
- Make sure the JSON is properly formatted and valid`;
};

// Parse the workout response from Gemini
const parseWorkoutResponse = (responseText) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    let jsonText = jsonMatch[0];
    
    // Fix common JSON parsing issues
    // Fix reps field - convert "8-12" to 10, "As many as possible" to null
    jsonText = jsonText.replace(/"reps":\s*"?([^",\n}]+)"?,?/g, (match, reps) => {
      const repsStr = reps.trim();
      if (repsStr.toLowerCase().includes('amrap') || repsStr.toLowerCase().includes('as many as possible')) {
        return '"reps": null,';
      }
      if (repsStr.includes('-')) {
        // Convert "8-12" to average value 10
        const parts = repsStr.split('-');
        const avg = Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2);
        return `"reps": ${avg},`;
      }
      if (isNaN(parseInt(repsStr))) {
        return '"reps": null,';
      }
      return `"reps": ${parseInt(repsStr)},`;
    });
    
    // Fix any other potential string values that should be numbers
    jsonText = jsonText.replace(/"sets":\s*"([^"]+)"/g, (match, sets) => {
      const num = parseInt(sets);
      return `"sets": ${isNaN(num) ? 3 : num}`;
    });
    
    jsonText = jsonText.replace(/"calories_burned":\s*"([^"]+)"/g, (match, calories) => {
      const num = parseInt(calories);
      return `"calories_burned": ${isNaN(num) ? 50 : num}`;
    });
    
    jsonText = jsonText.replace(/"estimated_calories_burned":\s*"([^"]+)"/g, (match, calories) => {
      const num = parseInt(calories);
      return `"estimated_calories_burned": ${isNaN(num) ? 300 : num}`;
    });
    
    const workoutPlan = JSON.parse(jsonText);
    
    // Validate the structure
    if (!workoutPlan.days || !Array.isArray(workoutPlan.days)) {
      throw new Error('Invalid workout plan structure');
    }
    
    // Ensure each day has the required structure
    workoutPlan.days = workoutPlan.days.map((day, index) => ({
      day: day.day || `Day ${index + 1}`,
      workout_type: day.workout_type || 'Mixed Training',
      estimated_calories_burned: typeof day.estimated_calories_burned === 'number' ? day.estimated_calories_burned : 300,
      exercises: (day.exercises || []).map(exercise => ({
        name: exercise.name || 'Unknown Exercise',
        type: exercise.type || 'General',
        sets: typeof exercise.sets === 'number' ? exercise.sets : 3,
        reps: typeof exercise.reps === 'number' ? exercise.reps : null,
        duration_minutes: typeof exercise.duration_minutes === 'number' && exercise.duration_minutes > 0 ? exercise.duration_minutes : null,
        duration_seconds: typeof exercise.duration_seconds === 'number' && exercise.duration_seconds > 0 ? exercise.duration_seconds : null,
        rest_between_sets_seconds: typeof exercise.rest_between_sets_seconds === 'number' ? exercise.rest_between_sets_seconds : 60,
        calories_burned: typeof exercise.calories_burned === 'number' ? exercise.calories_burned : 50,
        description: exercise.description || 'Exercise description not available.'
      }))
    }));
    
    return workoutPlan;
    
  } catch (error) {
    console.error('Error parsing workout response:', error);
    console.error('Response text:', responseText);
    
    // Return a fallback structure if parsing fails
    throw new Error('Failed to parse workout plan from API response');
  }
};

// Demo workout plan generator based on user profile
const getDemoWorkoutPlan = (userProfile) => {
  const {
    fitnessGoals = [],
    fitnessExperience = 'intermediate',
    workoutDuration = '45-60',
    workoutFrequency = '3-4'
  } = userProfile;
  
  const primaryGoal = Array.isArray(fitnessGoals) ? fitnessGoals[0] : fitnessGoals;
  const duration = parseInt(workoutDuration?.split('-')[1]) || 45;
  
  // Determine number of workout days based on frequency (same logic as prompt)
  const getWorkoutDays = (frequency) => {
    const frequencyMap = {
      '2-3': 3,
      '3-4': 4, 
      '4-5': 5,
      '5-6': 6,
      'daily': 7
    };
    return frequencyMap[frequency] || 3;
  };
  
  const numberOfDays = getWorkoutDays(workoutFrequency);
  
  // Generate workout types based on number of days
  const generateWorkoutTypes = (days) => {
    if (days <= 3) {
      return ['Full Body Strength', 'Cardio & Core', 'Upper & Lower Body'];
    } else if (days <= 5) {
      return ['Upper Body Strength', 'Lower Body & Core', 'Cardio Focus', 'Full Body Circuit', 'Active Recovery'];
    } else {
      return ['Push (Chest, Shoulders, Triceps)', 'Pull (Back, Biceps)', 'Legs & Glutes', 'Upper Body Power', 'Lower Body Strength', 'Cardio & Core', 'Active Recovery'];
    }
  };
  
  const workoutTypes = generateWorkoutTypes(numberOfDays);
  
  // Generate different exercise sets for each day type
  const generateExercisesForDay = (dayIndex, workoutType) => {
    const baseExercises = {
      'Full Body Strength': [
        {
          name: "Push-ups",
          type: "Upper Body",
          sets: 3,
          reps: 12,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 60,
          calories_burned: 50,
          description: "Start in a high plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor, then push back up to the starting position. Keep your core engaged and maintain a straight line from head to heels throughout the movement."
        },
        {
          name: "Bodyweight Squats",
          type: "Lower Body",
          sets: 3,
          reps: 15,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 60,
          calories_burned: 60,
          description: "Stand with feet shoulder-width apart, toes slightly turned out. Lower your body by bending your knees and pushing your hips back as if sitting in a chair. Keep your chest up and knees tracking over your toes. Lower until thighs are parallel to the floor, then drive through your heels to return to standing."
        },
        {
          name: "Plank Hold",
          type: "Core",
          sets: 3,
          reps: null,
          duration_minutes: 1,
          duration_seconds: null,
          rest_between_sets_seconds: 45,
          calories_burned: 40,
          description: "Start in a push-up position but rest on your forearms instead of your hands. Keep your body in a straight line from head to heels, engaging your core muscles. Hold this position while breathing normally. Avoid sagging hips or raising your bottom too high."
        }
      ],
      'Upper Body Strength': [
        {
          name: "Pike Push-ups",
          type: "Upper Body",
          sets: 3,
          reps: 10,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 60,
          calories_burned: 60,
          description: "Start in a downward dog position with hands shoulder-width apart and hips high. Lower your head toward the ground by bending your elbows, then press back up. This targets the shoulders and upper chest. Keep your legs straight and core engaged."
        },
        {
          name: "Tricep Dips",
          type: "Upper Body",
          sets: 3,
          reps: 12,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 60,
          calories_burned: 45,
          description: "Sit on the edge of a chair or bench with hands beside your hips. Slide forward off the seat and lower your body by bending your elbows. Push back up to the starting position. Keep your back close to the chair and feet flat on the floor."
        }
      ],
      'Lower Body & Core': [
        {
          name: "Lunges",
          type: "Lower Body",
          sets: 3,
          reps: 12,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 60,
          calories_burned: 80,
          description: "Stand tall with feet hip-width apart. Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees. The front knee should be directly above the ankle, not pushed out past the toes. Push back to the starting position and repeat with the other leg."
        },
        {
          name: "Glute Bridges",
          type: "Lower Body",
          sets: 3,
          reps: 15,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 45,
          calories_burned: 50,
          description: "Lie on your back with knees bent and feet flat on the floor, hip-width apart. Squeeze your glutes and lift your hips off the ground until your knees, hips, and shoulders form a straight line. Hold briefly at the top, then slowly lower back down."
        }
      ],
      'Cardio & Core': [
        {
          name: "High Knees",
          type: "Cardio",
          sets: 3,
          reps: null,
          duration_minutes: null,
          duration_seconds: 30,
          rest_between_sets_seconds: 60,
          calories_burned: 90,
          description: "Stand tall and run in place, bringing your knees up toward your chest as high as possible. Pump your arms naturally as you would when running. Maintain good posture and land on the balls of your feet. Keep a quick, controlled pace."
        },
        {
          name: "Russian Twists",
          type: "Core",
          sets: 3,
          reps: 20,
          duration_minutes: null,
          duration_seconds: null,
          rest_between_sets_seconds: 45,
          calories_burned: 45,
          description: "Sit on the floor with knees bent and feet slightly elevated. Lean back slightly while keeping your back straight. Rotate your torso from side to side, touching the ground beside your hip with each twist. Keep your core engaged throughout the movement."
        }
      ],
      'Active Recovery': [
        {
          name: "Gentle Yoga Flow",
          type: "Flexibility",
          sets: 1,
          reps: null,
          duration_minutes: 15,
          duration_seconds: null,
          rest_between_sets_seconds: 0,
          calories_burned: 60,
          description: "Perform a gentle sequence of yoga poses including cat-cow stretches, child's pose, downward dog, and gentle twists. Focus on breathing deeply and moving slowly. This helps with recovery and flexibility."
        },
        {
          name: "Walking",
          type: "Cardio",
          sets: 1,
          reps: null,
          duration_minutes: 20,
          duration_seconds: null,
          rest_between_sets_seconds: 0,
          calories_burned: 80,
          description: "Take a leisurely walk at a comfortable pace. Focus on maintaining good posture and breathing deeply. This light activity promotes blood flow and aids in recovery while keeping you active."
        }
      ]
    };
    
    // Return exercises based on workout type, with fallback to full body
    return baseExercises[workoutType] || baseExercises['Full Body Strength'];
  };
  
  // Generate days array
  const days = [];
  for (let i = 0; i < numberOfDays; i++) {
    const workoutType = workoutTypes[i] || workoutTypes[0];
    const exercises = generateExercisesForDay(i, workoutType);
    const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories_burned, 0);
    
    days.push({
      day: `Day ${i + 1}`,
      workout_type: workoutType,
      estimated_calories_burned: totalCalories,
      exercises: exercises
    });
  }
  
  return {
    name: `Demo ${numberOfDays}-Day Workout Plan`,
    goal: primaryGoal || "Improve Overall Fitness",
    duration_per_day_minutes: duration,
    preference: ["Mixed Training"],
    frequency: workoutFrequency,
    days: days
  };
};

// Enhanced test function to check if Gemini API is working
export const testGeminiConnection = async () => {
  console.log('🧪 Testing Gemini API Connection...');
  
  try {
    // Pre-flight checks
    console.log('🔍 Pre-flight checks:');
    console.log('- API Key Present:', !!GEMINI_API_KEY);
    console.log('- API Key Valid:', apiKeyValid);
    console.log('- GenAI Instance:', !!genAI);
    
    if (!GEMINI_API_KEY) {
      const error = 'API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.';
      console.error('❌', error);
      return { success: false, error };
    }
    
    if (!apiKeyValid) {
      const error = 'API key appears to be invalid or still contains placeholder text.';
      console.error('❌', error);
      return { success: false, error };
    }
    
    if (!genAI) {
      const error = 'GoogleGenerativeAI instance could not be created.';
      console.error('❌', error);
      return { success: false, error };
    }
    
    console.log('🚀 Attempting API call...');
    const model = getModel();
    const result = await model.generateContent("Say 'Hello, Gemini API is working!' and confirm the current date.");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API call successful!');
    console.log('📝 Response:', text);
    
    return { success: true, message: text };
    
  } catch (error) {
    console.error('❌ API call failed:');
    console.error('- Error Type:', error.constructor.name);
    console.error('- Error Message:', error.message);
    console.error('- Error Code:', error.code);
    console.error('- Full Error:', error);
    
    // Provide specific error guidance
    let userFriendlyError = error.message;
    
    if (error.message?.includes('API_KEY_INVALID')) {
      userFriendlyError = 'Invalid API key. Please check your Gemini API key in the .env file.';
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      userFriendlyError = 'API key lacks necessary permissions. Please check your Google Cloud project settings.';
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      userFriendlyError = 'API quota exceeded. Please check your usage limits in Google Cloud Console.';
    } else if (error.message?.includes('NETWORK')) {
      userFriendlyError = 'Network error. Please check your internet connection.';
    }
    
    return { success: false, error: userFriendlyError, originalError: error.message };
  }
};

export default {
  generateWorkoutPlanWithGemini,
  testGeminiConnection
};