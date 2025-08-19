// App.jsx
import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerificationPage from "./pages/OTPVerification";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import AiCoach from "./pages/AiCoach";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import ToastContainer from "./components/ToastContainer";
import { useToast } from "./hooks/useToast";

const AppContent = () => {
  const { error, successMessage, clearError, clearSuccessMessage, isInitialized, loading } = useAuth();
  const { toasts, hideToast, showError, showSuccess } = useToast();

  // Handle auth errors and success messages
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, showSuccess, clearSuccessMessage]);

  // Show loading spinner while initializing auth
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans scroll-smooth">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onHideToast={hideToast} />
      
      {/* Routes Of All Pages */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verification" element={<OTPVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute requireCompleteProfile={false}>
            <Onboarding />
          </ProtectedRoute>
        } />
        
        {/* Protected Dashboard Routes with Sidebar Layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="ai-coach" element={<AiCoach />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
