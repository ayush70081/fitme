import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  initializeAuth,
  clearError,
  clearSuccessMessage,
  getCurrentUser
} from '../store/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    successMessage, 
    isInitialized 
  } = useAppSelector((state) => state.auth);

  // Initialize auth state on app load
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAuth());
      
      // If there's a token, fetch the current user
      const token = localStorage.getItem('fitme_token');
      if (token) {
        dispatch(getCurrentUser());
      }
    }
  }, [dispatch, isInitialized]);

  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      
      // Fetch full user profile to get extended fields
      const userProfile = await dispatch(getCurrentUser()).unwrap();
      
      // Check if profile is complete
      if (!userProfile.profileCompleted) {
        return { success: true, onboarding: true };
      }

      return { success: true };
    } catch (error) {
      // Avoid logging detailed auth errors to console in production
      return { success: false, message: error };
    }
  };

  const register = async (email, password, confirmPassword, firstName, lastName) => {
    try {
      // Basic validation
      if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
      }

      if (!firstName || !lastName) {
        return { success: false, message: 'First name and last name are required' };
      }

      // Avoid logging PII
      
      const result = await dispatch(registerUser({ 
        email, 
        password, 
        firstName, 
        lastName 
      })).unwrap();
      
      // Only fetch user profile if tokens are available (after email verification)
      if (result.tokens && result.tokens.accessToken) {
        await dispatch(getCurrentUser()).unwrap();
      }
      
      // Avoid logging tokens/user payloads
      
      // Check if email verification is required
      if (result.requiresEmailVerification) {
        // Email verification required
        return { success: true, requiresEmailVerification: true };
      }
      
      // Proceed to onboarding
      return { success: true, onboarding: true };
    } catch (error) {
      // Avoid verbose logging of registration errors
      return { success: false, message: error };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local state
      return { success: true };
    }
  };

  // Manual login function for OTP verification (bypasses redux login)
  const manualLogin = (userData, tokens) => {
    // Store tokens
    if (tokens) {
      localStorage.setItem('fitme_token', tokens.accessToken);
      localStorage.setItem('fitme_refresh_token', tokens.refreshToken);
    }
    
    // Store user data
    if (userData) {
      localStorage.setItem('fitme_user', JSON.stringify(userData));
    }
    
    // Refresh auth state
    dispatch(initializeAuth());
    
    // Fetch updated user profile
    if (tokens) {
      dispatch(getCurrentUser());
    }
  };

  // Helper functions for managing messages
  const clearAuthError = () => dispatch(clearError());
  const clearAuthSuccess = () => dispatch(clearSuccessMessage());

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    successMessage,
    isAuthenticated,
    isInitialized,
    clearError: clearAuthError,
    clearSuccessMessage: clearAuthSuccess,
    manualLogin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 