import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI } from '../services/api';
import { testGeminiConnection } from '../services/geminiAPI';
import GeminiDiagnostics from './GeminiDiagnostics';
import { 
  Dumbbell, 
  Target, 
  Clock, 
  Calendar,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Info,
  Sparkles,
  Wrench
} from 'lucide-react';

const WorkoutPlanGenerator = ({ onPlanGenerated, onError }) => {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Custom generation options
  const [customOptions, setCustomOptions] = useState({
    focusArea: '',
    intensity: '',
    equipment: '',
    duration: '',
    specificGoals: ''
  });

  // Check Gemini API status on component mount
  useEffect(() => {
    checkGeminiStatus();
  }, []);

  const checkGeminiStatus = async () => {
    try {
      const result = await testGeminiConnection();
      setGeminiStatus(result);
    } catch (error) {
      setGeminiStatus({ success: false, error: 'Connection failed' });
    }
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      onError('Please make sure you are logged in and have completed your profile.');
      return;
    }

    setGenerating(true);
    
    try {
      // Calculate age from date of birth
      const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
          age--;
        }
        return age;
      };

      // Combine user profile with custom options for generation
      const enhancedProfile = {
        ...user,
        age: calculateAge(user.dateOfBirth),
        customOptions: showAdvanced ? customOptions : null
      };

      console.log('Generating workout plan with enhanced profile:', enhancedProfile);
      
      const result = await workoutAPI.generateWorkoutPlan(enhancedProfile);
      
      if (result.workoutPlan) {
        onPlanGenerated(result);
      } else {
        onError('Failed to generate workout plan. Please try again.');
      }
      
    } catch (error) {
      console.error('Error generating workout plan:', error);
      onError(error.message || 'Failed to generate workout plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCustomOptionChange = (field, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get user's profile completeness
  const getProfileCompleteness = () => {
    if (!user) return 0;
    
    const requiredFields = [
      'fitnessGoals', 'activityLevel', 'fitnessExperience', 
      'preferredWorkouts', 'workoutFrequency', 'workoutDuration',
      'height', 'weight'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = user[field];
      return value && value !== '' && (!Array.isArray(value) || value.length > 0);
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const profileCompleteness = getProfileCompleteness();
  const isProfileComplete = profileCompleteness >= 70;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Workout Plan Generator</h2>
          <p className="text-gray-600">Powered by Gemini 2.0 Flash</p>
        </div>
      </div>

      {/* API Status */}
      {geminiStatus && (
        <div className={`flex items-center justify-between p-3 rounded-lg mb-4 ${
          geminiStatus.success 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          <div className="flex items-center gap-2">
            {geminiStatus.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {geminiStatus.success 
                ? 'Gemini AI is ready to create your personalized workout plan'
                : 'Gemini AI unavailable - will use demo mode'
              }
            </span>
          </div>
          {!geminiStatus.success && (
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-900 font-medium"
            >
              <Wrench className="w-4 h-4" />
              Troubleshoot
            </button>
          )}
        </div>
      )}

      {/* Diagnostics Panel */}
      <AnimatePresence>
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <GeminiDiagnostics />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Completeness */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
          <span className="text-sm font-bold text-pink-600">{profileCompleteness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              profileCompleteness >= 70 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${profileCompleteness}%` }}
          ></div>
        </div>
        {!isProfileComplete && (
          <p className="text-sm text-gray-600 mt-2">
            Complete your profile for better AI recommendations. Visit your Profile page to add missing information.
          </p>
        )}
      </div>

      {/* User Profile Summary */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Goal</div>
            <div className="text-sm font-semibold text-gray-900">
              {user.fitnessGoals?.[0] ? 
                user.fitnessGoals[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                'Not Set'
              }
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Dumbbell className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Experience</div>
            <div className="text-sm font-semibold text-gray-900 capitalize">
              {user.fitnessExperience || 'Not Set'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Frequency</div>
            <div className="text-sm font-semibold text-gray-900">
              {user.workoutFrequency ? `${user.workoutFrequency}/week` : 'Not Set'}
            </div>
            {user.workoutFrequency && (
              <div className="text-xs text-pink-600 mt-1">
                {(() => {
                  const freq = user.workoutFrequency;
                  if (freq === '2-3') return '3 days';
                  if (freq === '3-4') return '4 days';
                  if (freq === '4-5') return '5 days';
                  if (freq === '5-6') return '6 days';
                  if (freq === 'daily') return '7 days';
                  return '3 days';
                })()} plan
              </div>
            )}
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-pink-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Duration</div>
            <div className="text-sm font-semibold text-gray-900">
              {user.workoutDuration || 'Not Set'} min
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Advanced Options</span>
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Area
                </label>
                <select
                  value={customOptions.focusArea}
                  onChange={(e) => handleCustomOptionChange('focusArea', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Default (Balanced)</option>
                  <option value="upper-body">Upper Body</option>
                  <option value="lower-body">Lower Body</option>
                  <option value="core">Core & Abs</option>
                  <option value="cardio">Cardio Focus</option>
                  <option value="strength">Strength Building</option>
                  <option value="flexibility">Flexibility & Mobility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity Level
                </label>
                <select
                  value={customOptions.intensity}
                  onChange={(e) => handleCustomOptionChange('intensity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Default (Based on Experience)</option>
                  <option value="low">Low Intensity</option>
                  <option value="moderate">Moderate Intensity</option>
                  <option value="high">High Intensity</option>
                  <option value="extreme">Extreme Intensity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Equipment
                </label>
                <select
                  value={customOptions.equipment}
                  onChange={(e) => handleCustomOptionChange('equipment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Bodyweight Only</option>
                  <option value="basic">Basic (Dumbbells, Resistance bands)</option>
                  <option value="home-gym">Home Gym Setup</option>
                  <option value="full-gym">Full Gym Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration Override
                </label>
                <select
                  value={customOptions.duration}
                  onChange={(e) => handleCustomOptionChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Use Profile Setting</option>
                  <option value="15-30">Quick (15-30 min)</option>
                  <option value="30-45">Standard (30-45 min)</option>
                  <option value="45-60">Extended (45-60 min)</option>
                  <option value="60-90">Long (60-90 min)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Goals or Instructions
                </label>
                <textarea
                  value={customOptions.specificGoals}
                  onChange={(e) => handleCustomOptionChange('specificGoals', e.target.value)}
                  placeholder="e.g., Focus on improving posture, prepare for a 5K run, target specific muscle groups..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {200 - customOptions.specificGoals.length} characters remaining
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">How it works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• AI analyzes your profile, goals, and preferences</li>
              <li>• Generates a personalized 3-day workout plan</li>
              <li>• Includes detailed exercise descriptions and form tips</li>
              <li>• Adapts difficulty based on your experience level</li>
              <li>• Provides calorie estimates and progression tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateWorkoutPlan}
        disabled={generating}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
          generating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:scale-98'
        }`}
      >
        {generating ? (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Generating Your Personalized Plan...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Zap className="w-5 h-5" />
            <span>Generate AI Workout Plan</span>
          </div>
        )}
      </button>

      {/* Tips */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          💡 Tip: Update your profile regularly to get better AI recommendations
        </p>
      </div>
    </div>
  );
};

export default WorkoutPlanGenerator;