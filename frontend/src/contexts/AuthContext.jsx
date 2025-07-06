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
      
      console.log('Login result:', result);
      console.log('User profile result:', userProfile);
      
      // Check if profile is complete
      if (!userProfile.profileCompleted) {
        return { success: true, onboarding: true };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
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

      console.log('Attempting registration with:', { email, firstName, lastName });
      
      const result = await dispatch(registerUser({ 
        email, 
        password, 
        firstName, 
        lastName 
      })).unwrap();
      
      // After successful registration, fetch the full user profile
      await dispatch(getCurrentUser()).unwrap();
      
      console.log('Registration successful:', result);
      return { success: true, onboarding: true };
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
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
    clearSuccessMessage: clearAuthSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 