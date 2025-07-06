// src/utils/localStorage.js
// Local storage utilities for persisting user data

const STORAGE_KEYS = {
  USER_DATA: 'workout_user_data',
  WORKOUT_PLAN: 'workout_plan',
  WORKOUT_HISTORY: 'workout_history',
  PREFERENCES: 'user_preferences'
};

export const storage = {
  // Save user data
  saveUserData: (userData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  // Get user data
  getUserData: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Save workout plan
  saveWorkoutPlan: (workoutPlan) => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_PLAN, JSON.stringify(workoutPlan));
      return true;
    } catch (error) {
      console.error('Error saving workout plan:', error);
      return false;
    }
  },

  // Get workout plan
  getWorkoutPlan: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting workout plan:', error);
      return null;
    }
  },

  // Save workout completion
  saveWorkoutHistory: (workoutData) => {
    try {
      const existing = storage.getWorkoutHistory() || [];
      const updated = [...existing, { ...workoutData, completedAt: new Date().toISOString() }];
      localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error saving workout history:', error);
      return false;
    }
  },

  // Get workout history
  getWorkoutHistory: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  // Check if user has completed setup
  hasUserData: () => {
    return !!storage.getUserData();
  }
};