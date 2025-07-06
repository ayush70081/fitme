// ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireCompleteProfile = true }) => {
  const { user, isAuthenticated, loading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only check profile completion if explicitly required
  if (requireCompleteProfile) {
    if (!user?.profileCompleted && location.pathname !== '/onboarding') {
      // Redirect to onboarding if profile is not complete
      return <Navigate to="/onboarding" replace />;
    }
  } else {
    // If we're on onboarding and profile is complete, redirect to dashboard
    if (user?.profileCompleted && location.pathname === '/onboarding') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 