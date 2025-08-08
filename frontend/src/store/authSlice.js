import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI, apiUtils } from '../services/api';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, tokens } = response.data;
        
        // Store access token
        const accessToken = tokens.accessToken;
        if (!accessToken) {
          console.error('No access token received');
          return rejectWithValue('No access token received');
        }
        
        // Store both tokens in localStorage and set auth header
        apiUtils.setAuthToken(accessToken);
        localStorage.setItem('fitme_refresh_token', tokens.refreshToken);
        localStorage.setItem('fitme_user', JSON.stringify(user));
        
        return { user, tokens };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user } = response.data;
        const tokens = response.data?.tokens;

        // Always store user data
        localStorage.setItem('fitme_user', JSON.stringify(user));

        // If tokens are present (legacy or direct-login flows), store them
        if (tokens && tokens.accessToken) {
          apiUtils.setAuthToken(tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('fitme_refresh_token', tokens.refreshToken);
          }
          return { user, tokens, requiresEmailVerification: false };
        }

        // New flow: registration requires email verification and returns no tokens
        const requiresEmailVerification = !!response.data?.requiresEmailVerification;
        return { user, requiresEmailVerification };
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      
      // Clear local storage
      apiUtils.removeAuthToken();
      localStorage.removeItem('fitme_refresh_token');
      localStorage.removeItem('fitme_user');
      
      return true;
    } catch (error) {
      // Even if logout fails on server, clear local data
      apiUtils.removeAuthToken();
      localStorage.removeItem('fitme_refresh_token');
      localStorage.removeItem('fitme_user');
      
      return true;
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe();
      
      if (response.success) {
        // Update user data in localStorage
        localStorage.setItem('fitme_user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Failed to get user data');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(profileData);
      
      if (response.success) {
        // Update user data in localStorage
        localStorage.setItem('fitme_user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const updateProfilePhoto = createAsyncThunk(
  'auth/updateProfilePhoto',
  async (profilePhoto, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfilePhoto(profilePhoto);
      
      if (response.success) {
        // Update user data in localStorage
        localStorage.setItem('fitme_user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Profile photo update failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const deleteProfilePhoto = createAsyncThunk(
  'auth/deleteProfilePhoto',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.deleteProfilePhoto();
      
      if (response.success) {
        // Update user data in localStorage
        localStorage.setItem('fitme_user', JSON.stringify(response.data.user));
        return response.data.user;
      } else {
        return rejectWithValue(response.message || 'Profile photo deletion failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Password change failed');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

export const getUserStats = createAsyncThunk(
  'auth/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserStats();
      
      if (response.success) {
        return response.data.stats;
      } else {
        return rejectWithValue(response.message || 'Failed to get user stats');
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      return rejectWithValue(errorData.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  userStats: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
  isInitialized: false,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    initializeAuth: (state) => {
      // Check for existing session
      const token = apiUtils.getAuthToken();
      const userData = localStorage.getItem('fitme_user');
      
      if (token && userData) {
        try {
          state.user = JSON.parse(userData);
          state.isAuthenticated = true;
          // Ensure axios headers are set up
          apiUtils.setAuthToken(token);
        } catch (error) {
          console.error('Error parsing user data:', error);
          apiUtils.removeAuthToken();
          localStorage.removeItem('fitme_refresh_token');
          localStorage.removeItem('fitme_user');
          state.isAuthenticated = false;
          state.user = null;
        }
      } else {
        // Clear any existing auth state
        state.isAuthenticated = false;
        state.user = null;
        apiUtils.removeAuthToken();
      }
      state.isInitialized = true;
      state.loading = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('fitme_user', JSON.stringify(state.user));
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.successMessage = 'Login successful!';
        // Ensure token is set in axios defaults
        apiUtils.setAuthToken(action.payload.tokens.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        // Clear any existing tokens
        apiUtils.removeAuthToken();
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = Boolean(action.payload.tokens && action.payload.tokens.accessToken);
        state.error = null;
        state.successMessage = action.payload.requiresEmailVerification
          ? 'Registration successful! Please verify your email.'
          : 'Registration successful!';
        // Ensure token is set in axios defaults when available
        if (action.payload.tokens && action.payload.tokens.accessToken) {
          apiUtils.setAuthToken(action.payload.tokens.accessToken);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        // Clear any existing tokens
        apiUtils.removeAuthToken();
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.userStats = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.successMessage = 'Logged out successfully!';
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear authentication on user fetch failure
      })
      
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.successMessage = 'Profile updated successfully!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update profile photo cases
      .addCase(updateProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.successMessage = 'Profile photo updated successfully!';
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete profile photo cases
      .addCase(deleteProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProfilePhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.successMessage = 'Profile photo deleted successfully!';
      })
      .addCase(deleteProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get user stats cases
      .addCase(getUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload;
        state.error = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccessMessage, 
  setInitialized, 
  initializeAuth,
  updateUser 
} = authSlice.actions;

export default authSlice.reducer; 