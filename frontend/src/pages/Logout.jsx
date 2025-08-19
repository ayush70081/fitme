// pages/Logout.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Perform logout and redirect to landing page
    const performLogout = async () => {
      try {
        await logout(); // Clear auth tokens and user data
        setTimeout(() => {
          navigate('/'); // Redirect to home page
        }, 1500); // Give a bit more time to show logout message
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/'); // Redirect anyway if there's an error
      }
    };

    performLogout();
  }, [navigate, logout]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we sign you out securely.</p>
      </div>
    </div>
  );
};

export default Logout;