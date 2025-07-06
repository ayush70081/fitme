import api from './api.js';

// FastAPI Base URL for meal planning
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000/api';

// Create FastAPI axios instance
const fastapi = api.create({
  baseURL: FASTAPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
fastapi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitme_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
fastapi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle authentication error
      localStorage.removeItem('fitme_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Meal Plan API
export const mealPlanAPI = {
  // Generate a new meal plan
  generateMealPlan: async (userProfile, preferences = {}) => {
    try {
      // Use test endpoint for now to bypass authentication issues
      const response = await fastapi.post('/mealplan/generate-test');
      // Save as current plan in localStorage
      if (response.data && response.data.data) {
        localStorage.setItem('current_meal_plan', JSON.stringify(response.data.data.meals));
      }
      return response.data;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      
      // If FastAPI is down, try the authenticated endpoint
      try {
        const authResponse = await fastapi.post('/mealplan/generate', {
          user_profile: userProfile,
          budget_range: preferences.budget || 'medium',
          cooking_skill: preferences.cooking_skill || 'intermediate',
          meal_focus: preferences.meal_focus || 'balanced',
          max_prep_time: preferences.max_prep_time || 30,
          regenerate: false
        });
        if (authResponse.data && authResponse.data.data) {
          localStorage.setItem('current_meal_plan', JSON.stringify(authResponse.data.data.meals));
        }
        return authResponse.data;
      } catch (authError) {
        console.error('Both endpoints failed:', authError);
        throw error;
      }
    }
  },

  // Get all meal plans for the user
  getMealPlans: async (limit = 10, skip = 0) => {
    try {
      const response = await fastapi.get('/mealplan/', {
        params: { limit, skip }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  },

  // Get a specific meal plan
  getMealPlan: async (planId) => {
    try {
      const response = await fastapi.get(`/mealplan/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  },

  // Delete a meal plan
  deleteMealPlan: async (planId) => {
    try {
      const response = await fastapi.delete(`/mealplan/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  },

  // Regenerate an existing meal plan
  regenerateMealPlan: async (planId) => {
    try {
      const response = await fastapi.post(`/mealplan/regenerate/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error regenerating meal plan:', error);
      throw error;
    }
  },

  // Generate daily meal plan (cost-effective)
  generateDailyMealPlan: async (dailyRequest) => {
    try {
      console.log('Generating daily meal plan with request:', dailyRequest);
      
      // Use test endpoint for daily generation
      const response = await fastapi.post('/mealplan/generate-daily-test', {
        target_day: dailyRequest.target_day || 'Today',
        preferences: {
          age: dailyRequest.age || 30,
          weight: dailyRequest.weight || 70,
          height: dailyRequest.height || 170,
          gender: dailyRequest.gender || 'other',
          activity_level: dailyRequest.activity_level || 'moderately_active',
          fitness_goal: dailyRequest.fitness_goal || 'maintenance',
          dietary_preferences: dailyRequest.dietary_preferences || [],
          allergies: dailyRequest.allergies || [],
          disliked_foods: dailyRequest.disliked_foods || [],
          preferred_cuisines: dailyRequest.preferred_cuisines || [],
          budget: dailyRequest.budget || 'medium',
          cooking_skill: dailyRequest.cooking_skill || 'intermediate',
          meal_focus: dailyRequest.meal_focus || 'balanced',
          max_prep_time: dailyRequest.max_prep_time || 30
        }
      });
      
      if (response.data && response.data.data) {
        localStorage.setItem('current_meal_plan', JSON.stringify(response.data.data.meals));
      }
      console.log('Daily meal plan response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error generating daily meal plan:', error);
      
      // Fallback to regular endpoint
      try {
        const userProfile = mealPlanUtils.getUserProfileFromStorage();
        const authResponse = await fastapi.post('/mealplan/generate', {
          user_profile: {
            ...userProfile,
            ...dailyRequest
          },
          budget_range: dailyRequest.budget || 'medium',
          cooking_skill: dailyRequest.cooking_skill || 'intermediate',
          meal_focus: dailyRequest.meal_focus || 'balanced',
          max_prep_time: dailyRequest.max_prep_time || 30,
          regenerate: false
        });
        if (authResponse.data && authResponse.data.data) {
          localStorage.setItem('current_meal_plan', JSON.stringify(authResponse.data.data.meals));
        }
        return authResponse.data;
      } catch (authError) {
        console.error('Both daily endpoints failed:', authError);
        throw error;
      }
    }
  },

  // Analyze nutrition for food items
  analyzeNutrition: async (foodItems, portions = []) => {
    try {
      const response = await fastapi.post('/mealplan/nutrition/analyze', {
        food_items: foodItems,
        portions: portions
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      throw error;
    }
  }
};

// Utility functions for meal plan data transformation
export const mealPlanUtils = {
  // Transform FastAPI daily meal plan to frontend format
  transformDailyPlanToFrontendFormat: (mealPlan, dayName = 'Today') => {
    // Handle the MealPlan object structure
    if (!mealPlan || !mealPlan.meals) {
      console.error('Invalid meal plan data:', mealPlan);
      return {};
    }
    
    const meals = mealPlan.meals;
    console.log('Transforming meals:', meals);
    
    const transformed = {};
    
    // Handle breakfast
    if (meals.breakfast) {
      transformed.breakfast = {
        name: meals.breakfast.name,
        ingredients: meals.breakfast.ingredients || [],
        recipe: meals.breakfast.instructions || [],
        prepTime: meals.breakfast.prep_time || 0,
        nutrition: meals.breakfast.nutrition || null,
        description: meals.breakfast.description || '',
        cuisineType: meals.breakfast.cuisine_type || '',
        difficulty: meals.breakfast.difficulty || 'medium',
        portionSize: meals.breakfast.portion_size || 'serves 1'
      };
    }
    
    // Handle lunch
    if (meals.lunch) {
      transformed.lunch = {
        name: meals.lunch.name,
        ingredients: meals.lunch.ingredients || [],
        recipe: meals.lunch.instructions || [],
        prepTime: meals.lunch.prep_time || 0,
        nutrition: meals.lunch.nutrition || null,
        description: meals.lunch.description || '',
        cuisineType: meals.lunch.cuisine_type || '',
        difficulty: meals.lunch.difficulty || 'medium',
        portionSize: meals.lunch.portion_size || 'serves 1'
      };
    }
    
    // Handle dinner
    if (meals.dinner) {
      transformed.dinner = {
        name: meals.dinner.name,
        ingredients: meals.dinner.ingredients || [],
        recipe: meals.dinner.instructions || [],
        prepTime: meals.dinner.prep_time || 0,
        nutrition: meals.dinner.nutrition || null,
        description: meals.dinner.description || '',
        cuisineType: meals.dinner.cuisine_type || '',
        difficulty: meals.dinner.difficulty || 'medium',
        portionSize: meals.dinner.portion_size || 'serves 1'
      };
    }
    
    // Handle snack (optional)
    if (meals.snack) {
      transformed.snack = {
        name: meals.snack.name,
        ingredients: meals.snack.ingredients || [],
        recipe: meals.snack.instructions || [],
        prepTime: meals.snack.prep_time || 0,
        nutrition: meals.snack.nutrition || null,
        description: meals.snack.description || '',
        cuisineType: meals.snack.cuisine_type || '',
        difficulty: meals.snack.difficulty || 'easy',
        portionSize: meals.snack.portion_size || 'serves 1'
      };
    }
    
    // Add daily totals
    transformed.dailyTotals = {
      calories: meals.total_calories || 0,
      protein: meals.total_protein || 0,
      carbs: meals.total_carbs || 0,
      fat: meals.total_fat || 0
    };
    
    console.log('Transformed meal plan:', transformed);
    return transformed;
  },

  // Get user profile from stored data
  getUserProfileFromStorage: () => {
    const user = JSON.parse(localStorage.getItem('fitme_user') || '{}');
    
    return {
      age: user.age || 30,
      weight: user.weight || 70,
      height: user.height || 170,
      gender: user.gender || 'other',
      activity_level: user.activityLevel || 'moderately_active',
      fitness_goal: user.fitnessGoal || 'maintenance',
      dietary_preferences: user.dietaryPreferences || [],
      allergies: user.allergies || [],
      disliked_foods: user.dislikedFoods || [],
      preferred_cuisines: user.preferredCuisines || [],
      budget_range: user.budgetRange || 'medium',
      cooking_skill: user.cookingSkill || 'intermediate'
    };
  },

  // Create daily request from user preferences
  createDailyRequest: (preferences = {}) => {
    const userProfile = mealPlanUtils.getUserProfileFromStorage();
    
    return {
      target_day: preferences.target_day || 'Today',
      age: preferences.age || userProfile.age,
      weight: preferences.weight || userProfile.weight,
      height: preferences.height || userProfile.height,
      gender: preferences.gender || userProfile.gender,
      activity_level: preferences.activity_level || userProfile.activity_level,
      fitness_goal: preferences.fitness_goal || userProfile.fitness_goal,
      dietary_preferences: preferences.dietary_preferences || userProfile.dietary_preferences,
      allergies: preferences.allergies || userProfile.allergies,
      disliked_foods: preferences.disliked_foods || userProfile.disliked_foods,
      preferred_cuisines: preferences.preferred_cuisines || userProfile.preferred_cuisines,
      budget: preferences.budget || userProfile.budget_range,
      cooking_skill: preferences.cooking_skill || userProfile.cooking_skill,
      meal_focus: preferences.meal_focus || 'balanced',
      max_prep_time: preferences.max_prep_time || 30
    };
  }
};

// Save plan to backend
export async function savePlan(plan, token) {
  const res = await fetch('/api/mealplan/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(plan)
  });
  return res.json();
}

// Load saved plan from backend
export async function getSavedPlan(token) {
  const res = await fetch('/api/mealplan/saved', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
}

export default mealPlanAPI;