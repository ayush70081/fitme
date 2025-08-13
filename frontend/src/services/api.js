import axios from 'axios';
import { generateWorkoutPlanWithGemini } from './geminiAPI.js';

// Base API configuration - Express backend for auth/user, FastAPI for AI Coach
const EXPRESS_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000/api';
const BASE_URL = EXPRESS_BASE_URL; // Default to Express for auth/user APIs

// Create axios instances
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Separate instance for FastAPI backend
const fastapi = axios.create({
  baseURL: FASTAPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getToken = () => localStorage.getItem('fitme_token');
const setToken = (token) => {
  if (token) {
    localStorage.setItem('fitme_token', token);
    // Update Authorization header for future requests on both instances
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fastapi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Avoid logging tokens to console
  }
};
const removeToken = () => {
  localStorage.removeItem('fitme_token');
  // Remove Authorization header from both instances
  delete api.defaults.headers.common['Authorization'];
  delete fastapi.defaults.headers.common['Authorization'];
};

// Request interceptor to add auth token (for both instances)
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Add auth interceptors to both instances
addAuthInterceptor(api);
addAuthInterceptor(fastapi);

// Ensure token is set on both instances if it exists
const existingToken = getToken();
if (existingToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
  fastapi.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('fitme_refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          // Store the new access token properly
          setToken(accessToken);
          localStorage.setItem('fitme_refresh_token', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeToken();
        localStorage.removeItem('fitme_refresh_token');
        localStorage.removeItem('fitme_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    console.log('API: Attempting registration with:', userData);
    try {
      const response = await api.post('/auth/register', userData);
      console.log('API: Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Registration error:', error);
      console.error('API: Response data:', error.response?.data);
      console.error('API: Response status:', error.response?.status);
      throw error;
    }
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // OTP verification endpoints
  sendOTP: async (email) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resendOTP: async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Password reset (OTP by email)
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password/request', { email });
    return response.data;
  },

  resetPasswordWithOTP: async ({ email, otp, newPassword, confirmPassword }) => {
    const response = await api.post('/auth/forgot-password/confirm', { email, otp, password: newPassword, confirmPassword });
    return response.data;
  }
};

// User API
export const userAPI = {
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  updateProfilePhoto: async (profilePhoto) => {
    const response = await api.put('/user/profile-photo', { profilePhoto });
    return response.data;
  },

  deleteProfilePhoto: async () => {
    const response = await api.delete('/user/profile-photo');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  updateEmail: async (emailData) => {
    const response = await api.put('/user/email', emailData);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await api.delete('/user/account', {
      data: { password }
    });
    return response.data;
  }
};

// Workout API
export const workoutAPI = {
  generateWorkoutPlan: async (enhancedProfile = null) => {
    try {
      // Use provided profile or get user profile data for AI generation
      let userProfile = enhancedProfile;
      if (!userProfile) {
        const userResponse = await api.get('/auth/me');
        userProfile = userResponse.data.user;
      }
      
      // Use Gemini API as the primary and only method
      const geminiResult = await generateWorkoutPlanWithGemini(userProfile);
      return geminiResult;
      
    } catch (error) {
      console.error('Workout plan generation failed:', error);
      
      // If Gemini fails, fall back to a simple demo plan
      return {
        success: true,
        workoutPlan: {
          goal: "General Fitness",
          duration_per_day_minutes: 30,
          preference: ["Cardio", "Strength"],
          days: [
            {
              day: "Day 1",
              workout_type: "Full Body Workout",
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
                }
              ]
            }
          ]
        },
        message: 'Demo workout plan (Gemini unavailable)',
        isDemoMode: true
      };
    }
  },

  saveWorkoutPlan: async (workoutPlan, name) => {
    const response = await api.post('/workouts/save', {
      workoutPlan,
      name
    });
    return response.data;
  },

  getSavedWorkoutPlans: async (options = {}) => {
    const { page = 1, limit = 10, sort = 'createdAt' } = options;
    const response = await api.get('/workouts/saved', {
      params: { page, limit, sort }
    });
    return response.data;
  },

  getWorkoutPlanById: async (planId) => {
    const response = await api.get(`/workouts/${planId}`);
    return response.data;
  },

  deleteWorkoutPlan: async (planId) => {
    const response = await api.delete(`/workouts/${planId}`);
    return response.data;
  },

  setActivePlan: async (planId) => {
    const response = await api.put(`/workouts/${planId}/activate`);
    return response.data;
  },

  createCustomWorkout: async (name, exercises) => {
    const response = await api.post('/workouts/custom', {
      name,
      exercises
    });
    return response.data;
  },

  completeWorkout: async (workoutData) => {
    const response = await api.post('/workouts/complete', workoutData);
    return response.data;
  },

  getWorkoutStatistics: async () => {
    const response = await api.get('/workouts/statistics');
    return response.data;
  },

  getWeeklySummary: async () => {
    const response = await api.get('/workouts/weekly-summary');
    return response.data;
  }
};

// AI Coach API - Uses FastAPI backend
export const aiCoachAPI = {
  chat: async (message, conversationHistory = []) => {
    try {
      const response = await fastapi.post('/aicoach/chat', {
        message,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('AI Coach chat error:', error);
      throw error;
    }
  },

  getSuggestions: async () => {
    try {
      const token = getToken();
      console.log('getSuggestions: Token exists:', !!token);
      console.log('getSuggestions: Making request to /aicoach/suggestions');
      const response = await fastapi.get('/aicoach/suggestions');
      return response.data;
    } catch (error) {
      console.error('AI Coach suggestions error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await fastapi.get('/aicoach/health');
      return response.data;
    } catch (error) {
      console.error('AI Coach health check error:', error);
      throw error;
    }
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Utility functions
export const apiUtils = {
  setAuthToken: setToken,
  getAuthToken: getToken,
  removeAuthToken: removeToken,
  
  // Handle API errors with enhanced messaging
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Return enhanced error information from backend
      if (data.errorCode) {
        return {
          message: data.message,
          errorCode: data.errorCode,
          suggestions: data.suggestions || [],
          field: data.field,
          errors: data.errors || [],
          missingFields: data.missingFields,
          attemptsRemaining: data.attemptsRemaining,
          timeRemaining: data.timeRemaining
        };
      }
      
      // Fallback to generic messages for status codes
      switch (status) {
        case 400:
          return {
            message: data.message || 'Invalid request. Please check your input.',
            errorCode: 'BAD_REQUEST',
            errors: data.errors || []
          };
        case 401:
          return {
            message: data.message || 'Authentication failed. Please login again.',
            errorCode: 'UNAUTHORIZED',
            suggestions: ['Please login again', 'Check your credentials']
          };
        case 403:
          return {
            message: 'Access denied. Insufficient permissions.',
            errorCode: 'FORBIDDEN',
            suggestions: ['Contact administrator for access']
          };
        case 404:
          return {
            message: 'Resource not found.',
            errorCode: 'NOT_FOUND',
            suggestions: ['Check the URL or contact support']
          };
        case 429:
          return {
            message: data.message || 'Too many requests. Please try again later.',
            errorCode: 'RATE_LIMITED',
            suggestions: ['Wait a few minutes before trying again']
          };
        case 500:
          return {
            message: 'Server error. Please try again later.',
            errorCode: 'SERVER_ERROR',
            suggestions: ['Try again in a few moments', 'Contact support if problem persists']
          };
        default:
          return {
            message: data.message || 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
          };
      }
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }
};

export default api; 