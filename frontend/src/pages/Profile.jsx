import React, { useState, useRef, useEffect } from 'react';
import userStorage from '../utils/userScopedStorage';
import { useAppDispatch } from '../hooks/redux';
import { updateUserProfile, updateProfilePhoto, deleteProfilePhoto } from '../store/authSlice';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { validateImageFile, compressImage } from '../utils/imageUtils';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit3, 
  Camera, 
  Save, 
  X,
  Target,
  Activity,
  Award,
  TrendingUp,
  Upload,
  Image as ImageIcon,
  Trash2,
  Heart,
  Utensils,
  Dumbbell,
  Clock,
  Shield,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { userAPI, workoutAPI } from '../services/api';
import Select from 'react-select';

const WORKOUT_TYPE_OPTIONS = [
  'Strength Training',
  'Cardio',
  'Yoga',
  'Pilates',
  'HIIT',
  'Running',
  'Swimming',
  'Cycling',
  'Boxing',
  'Dancing',
  'Calisthenics',
  'CrossFit'
];

const Profile = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profilePhoto || null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageError, setImageError] = useState(null);
  
  // Add debug logs
  console.log('Raw user data:', user);
  console.log('User name fields:', {
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user?.fullName
  });

  // Load profile photo from user data when component mounts or user changes
  useEffect(() => {
    if (user?.profilePhoto) {
      setProfileImage(user.profilePhoto);
    } else {
      setProfileImage(null);
    }
  }, [user?.profilePhoto]);

  // Utility functions for robust data parsing and display
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field.filter(Boolean);
    if (typeof field === 'string') {
      return field.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return [];
  };

  // Helper to format frequency
  const formatFrequency = (freq) => {
    const mapping = {
      '2-3': '2-3 times per week',
      '3-4': '3-4 times per week',
      '4-5': '4-5 times per week',
      '5-6': '5-6 times per week',
      'daily': 'Daily',
    };
    return mapping[freq] || (freq ? `${freq} times per week` : 'Not specified');
  };

  // Helper to format duration
  const formatDuration = (duration) => {
    const mapping = {
      '15-30': '15-30 minutes',
      '30-45': '30-45 minutes',
      '45-60': '45-60 minutes',
      '60-90': '60-90 minutes',
      '90+': '90+ minutes',
    };
    return mapping[duration] || (duration ? `${duration} minutes` : 'Not specified');
  };

  // Helper to format height
  const formatHeight = (height) => height ? `${height} cm` : '--';
  // Helper to format weight
  const formatWeight = (weight) => weight ? `${weight} kg` : '--';
  // Helper to format goal weight
  const formatGoalWeight = (goalWeight) => goalWeight ? `${goalWeight} kg` : '--';
  // Helper to format muscle gain
  const formatMuscleGain = (muscleGain) => muscleGain ? `${muscleGain} kg` : '--';

  // Update getDisplayName function with more robust handling and logging
  const getDisplayName = (user) => {
    console.log('getDisplayName called with user:', user);
    
    // First try to get the name from firstName and lastName
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    console.log('Constructed name parts:', { firstName, lastName, fullName });
    
    if (fullName && fullName !== ' ') {
      console.log('Using constructed fullName:', fullName);
      return fullName;
    }
    
    // If no firstName/lastName, try fullName
    if (user?.fullName && user.fullName.trim() !== '' && user.fullName !== 'User Profile') {
      console.log('Using user.fullName:', user.fullName);
      return user.fullName;
    }
    
    console.log('No valid name found, returning Not specified');
    return 'Not specified';
  };

  // Update initial state with logging
  const initialProfileData = {
    name: getDisplayName(user),
    email: user?.email || '',
    location: user?.location || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    height: user?.height ? user.height.toString() : '',
    weight: user?.weight ? user.weight.toString() : '',
    goalWeight: user?.goalWeight ? user.goalWeight.toString() : '',
    fitnessGoal: Array.isArray(user?.fitnessGoals) ? user.fitnessGoals[0] : user?.fitnessGoals || '',
    activityLevel: user?.activityLevel || '',
    bio: user?.bio || '',
    
    // Extended questionnaire data
    fitnessExperience: user?.fitnessExperience || '',
    preferredWorkouts: parseArrayField(user?.preferredWorkouts),
    workoutFrequency: user?.workoutFrequency || '',
    workoutDuration: user?.workoutDuration || '',
    dietaryPreference: user?.dietaryPreference || '',
    
    // Dynamic goal-specific fields
    targetMuscleGain: user?.targetMuscleGain ? user.targetMuscleGain.toString() : '',
    currentStrengthLevel: user?.currentStrengthLevel || ''
  };
  console.log('Initial profile data name:', initialProfileData.name);

  const [profileData, setProfileData] = useState(initialProfileData);

  // Sync profile data with user data changes
  useEffect(() => {
    if (user) {
      const syncedData = {
        name: getDisplayName(user),
        email: user?.email || '',
        location: user?.location || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user?.gender || '',
        height: user?.height ? user.height.toString() : '',
        weight: user?.weight ? user.weight.toString() : '',
        goalWeight: user?.goalWeight ? user.goalWeight.toString() : '',
        fitnessGoal: Array.isArray(user?.fitnessGoals) ? user.fitnessGoals[0] : user?.fitnessGoals || '',
        activityLevel: user?.activityLevel || '',
        bio: user?.bio || '',
        
        // Extended questionnaire data
        fitnessExperience: user?.fitnessExperience || '',
        preferredWorkouts: parseArrayField(user?.preferredWorkouts),
        workoutFrequency: user?.workoutFrequency || '',
        workoutDuration: user?.workoutDuration || '',
        dietaryPreference: user?.dietaryPreference || '',
        
        // Dynamic goal-specific fields
        targetMuscleGain: user?.targetMuscleGain ? user.targetMuscleGain.toString() : '',
        currentStrengthLevel: user?.currentStrengthLevel || ''
      };
      setProfileData(syncedData);
    }
  }, [user]);

  const [fitnessStats, setFitnessStats] = useState({
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    averageWorkoutTimeMinutes: 0,
    totalWorkoutTimeMinutes: 0,
    recentWorkouts: []
  });

  // Function to get total cumulative nutrition data across ALL days
  const getTotalCumulativeNutrition = () => {
    try {
      const nutritionData = JSON.parse(userStorage.getItem('cumulativeNutrition') || '{}');
      
      // Sum up all days
      let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      Object.values(nutritionData).forEach(dayData => {
        if (dayData && typeof dayData === 'object') {
          totalNutrition.calories += dayData.calories || 0;
          totalNutrition.protein += dayData.protein || 0;
          totalNutrition.carbs += dayData.carbs || 0;
          totalNutrition.fat += dayData.fat || 0;
        }
      });
      
      return totalNutrition;
    } catch (error) {
      console.error('Error getting total cumulative nutrition:', error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  const [nutritionStats, setNutritionStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Try the new workout statistics API first
        const workoutRes = await workoutAPI.getWorkoutStatistics();
        if (workoutRes?.statistics) {
          setFitnessStats(workoutRes.statistics);
          return;
        }
      } catch (e) {
        console.log('Workout stats not available, falling back to user stats');
      }

      // Fallback to old user stats API
      try {
        const res = await userAPI.getUserStats();
        const stats = res?.data?.stats || {};
        setFitnessStats({
          totalWorkouts: stats.totalWorkouts ?? 0,
          totalCaloriesBurned: stats.caloriesBurned ?? 0,
          averageWorkoutTimeMinutes: stats.avgWorkout ?? 0,
          totalWorkoutTimeMinutes: 0,
          recentWorkouts: []
        });
      } catch (e) {
        setFitnessStats({
          totalWorkouts: 0,
          totalCaloriesBurned: 0,
          averageWorkoutTimeMinutes: 0,
          totalWorkoutTimeMinutes: 0,
          recentWorkouts: []
        });
      }
    }
    fetchStats();
  }, []);

  // Update nutrition stats whenever component mounts or nutrition data changes
  useEffect(() => {
    const updateNutritionStats = () => {
      const totalData = getTotalCumulativeNutrition();
      setNutritionStats(totalData);
    };

    // Initial load
    updateNutritionStats();

    // Listen for nutrition data updates
    const handleNutritionUpdate = () => {
      updateNutritionStats();
    };

    window.addEventListener('nutritionDataUpdated', handleNutritionUpdate);
    
    // Also listen for storage events and daily tasks updates
    window.addEventListener('storage', handleNutritionUpdate);
    window.addEventListener('dailyTasksUpdated', handleNutritionUpdate);

    return () => {
      window.removeEventListener('nutritionDataUpdated', handleNutritionUpdate);
      window.removeEventListener('storage', handleNutritionUpdate);
      window.removeEventListener('dailyTasksUpdated', handleNutritionUpdate);
    };
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'fitness', label: 'Fitness Profile', icon: Dumbbell },
    { id: 'health', label: 'Health & Diet', icon: Heart },
    { id: 'preferences', label: 'Preferences', icon: Target },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageError(null);
    setImageUploading(true);

    try {
      // Validate image
      const validationResult = validateImageFile(file);
      if (!validationResult.isValid) {
        setImageError(validationResult.error);
        setImageUploading(false);
        return;
      }

      // Compress image (this returns base64 data directly)
      const compressedBase64Data = await compressImage(file, 400, 400, 0.8);
      
      try {
        // Upload to backend
        await dispatch(updateProfilePhoto(compressedBase64Data)).unwrap();
        setProfileImage(compressedBase64Data);
        setProfileImageFile(file);
        setImageError(null);
      } catch (error) {
        console.error('Profile photo upload error:', error);
        setImageError(error || 'Failed to upload profile photo. Please try again.');
        setProfileImage(user?.profilePhoto || null); // Revert to original
      } finally {
        setImageUploading(false);
      }
    } catch (error) {
      console.error('Image processing error:', error);
      setImageError('Failed to process the image. Please try again.');
      setImageUploading(false);
    }
  };

  const triggerImageUpload = () => {
    if (imageUploading) return;
    fileInputRef.current?.click();
  };

  const removeProfileImage = async () => {
    if (imageUploading) return;
    
    setImageUploading(true);
    setImageError(null);

    try {
      await dispatch(deleteProfilePhoto()).unwrap();
      setProfileImage(null);
      setProfileImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Profile photo deletion error:', error);
      setImageError(error || 'Failed to delete profile photo. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Mapping functions to convert display text to backend enums
  const mapActivityLevelEnum = (text) => {
    const mapping = {
      'Sedentary': 'sedentary',
      'Lightly Active': 'lightly-active',
      'Moderately Active': 'moderately-active',
      'Very Active': 'very-active',
      'Extremely Active': 'extremely-active'
    };
    return mapping[text] || 'sedentary';
  };

  const mapGoalEnum = (text) => {
    const mapping = {
      'Lose Weight': 'weight-loss',
      'Gain Weight': 'weight-gain',
      'Build Muscle': 'muscle-gain',
      'Improve Strength': 'strength',
      'Stay Fit / Maintain': 'general-fitness'
    };
    return mapping[text] ? [mapping[text]] : [];
  };

  // === Helper functions to turn enum values back into readable labels ===
  const getDisplayFitnessGoal = (goal) => {
    const mapping = {
      'weight-loss': 'Lose Weight',
      'weight-gain': 'Gain Weight',
      'muscle-gain': 'Build Muscle',
      'strength': 'Improve Strength',
      'general-fitness': 'Stay Fit / Maintain'
    };
    if (Array.isArray(goal)) {
      // If the goal is an array (e.g., coming directly from DB) take the first item
      goal = goal[0];
    }
    return mapping[goal] || 'Not specified';
  };

  const getDisplayActivityLevel = (level) => {
    const mapping = {
      'sedentary': 'Sedentary',
      'lightly-active': 'Lightly Active',
      'moderately-active': 'Moderately Active',
      'very-active': 'Very Active',
      'extremely-active': 'Extremely Active'
    };
    return mapping[level] || 'Not specified';
  };

  // Dynamic goal field renderer based on fitness goal
  const renderDynamicGoalField = () => {
    const currentGoal = profileData.fitnessGoal;
    
    const goalConfigs = {
      'weight-loss': {
        label: 'Goal Weight (kg)',
        field: 'goalWeight',
        placeholder: 'Goal weight in kg',
        type: 'number'
      },
      'weight-gain': {
        label: 'Goal Weight (kg)',
        field: 'goalWeight', 
        placeholder: 'Goal weight in kg',
        type: 'number'
      },
      'muscle-gain': {
        label: 'Target Muscle Gain (kg)',
        field: 'targetMuscleGain',
        placeholder: 'Target muscle gain in kg',
        type: 'number'
      },
      'strength': {
        label: 'Strength Level',
        field: 'currentStrengthLevel',
        placeholder: 'Current strength level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced']
      },
      'general-fitness': {
        label: 'Current Weight (kg)',
        field: 'weight',
        placeholder: 'Current weight in kg',
        type: 'number'
      }
    };

    const config = goalConfigs[currentGoal] || goalConfigs['weight-loss'];
    const fieldValue = profileData[config.field] || '';

    const renderFieldInput = () => {
      if (config.type === 'select') {
        return (
          <select
            value={fieldValue}
            onChange={(e) => handleInputChange(config.field, e.target.value)}
            className="mt-2 w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-[#EADFD0] focus:border-[#EADFD0]"
          >
            <option value="">{config.placeholder}</option>
            {config.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }
      
      return (
        <input
          type={config.type}
          value={fieldValue}
          onChange={(e) => handleInputChange(config.field, e.target.value)}
          className="mt-2 w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-[#EADFD0] focus:border-[#EADFD0]"
          placeholder={config.placeholder}
        />
      );
    };

    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold text-gray-900">{formatGoalWeight(fieldValue) || '--'}</div>
        <div className="text-sm text-gray-600">{config.label}</div>
        {isEditing && renderFieldInput()}
      </div>
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Split the name into firstName and lastName
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = {
        firstName,
        lastName,
        location: profileData.location,
        dateOfBirth: profileData.dateOfBirth,
        height: profileData.height ? parseFloat(profileData.height) : undefined,
        weight: profileData.weight ? parseFloat(profileData.weight) : undefined,
        activityLevel: profileData.activityLevel,
        fitnessGoals: Array.isArray(profileData.fitnessGoal)
          ? profileData.fitnessGoal
          : profileData.fitnessGoal
            ? [profileData.fitnessGoal]
            : [],
        bio: profileData.bio,
        fitnessExperience: profileData.fitnessExperience,
        dietaryPreference: profileData.dietaryPreference,
        workoutFrequency: profileData.workoutFrequency,
        workoutDuration: profileData.workoutDuration,
        preferredWorkouts: Array.isArray(profileData.preferredWorkouts)
          ? profileData.preferredWorkouts.join(',')
          : profileData.preferredWorkouts || '',
        goalWeight: profileData.goalWeight ? parseFloat(profileData.goalWeight) : undefined,
        targetMuscleGain: profileData.targetMuscleGain ? parseFloat(profileData.targetMuscleGain) : undefined,
        currentStrengthLevel: profileData.currentStrengthLevel
      };
      
      await dispatch(updateUserProfile(payload)).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Save profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data from the user object
    const resetData = {
      name: getDisplayName(user),
      email: user?.email || '',
      location: user?.location || '',
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      gender: user?.gender || '',
      height: user?.height ? user.height.toString() : '',
      weight: user?.weight ? user.weight.toString() : '',
      goalWeight: user?.goalWeight ? user.goalWeight.toString() : '',
      fitnessGoal: Array.isArray(user?.fitnessGoals) ? user.fitnessGoals[0] : user?.fitnessGoals || '',
      activityLevel: user?.activityLevel || '',
      bio: user?.bio || '',
      
      // Extended questionnaire data
      fitnessExperience: user?.fitnessExperience || '',
      preferredWorkouts: parseArrayField(user?.preferredWorkouts),
      workoutFrequency: user?.workoutFrequency || '',
      workoutDuration: user?.workoutDuration || '',
      dietaryPreference: user?.dietaryPreference || '',
      
      // Dynamic goal-specific fields
      targetMuscleGain: user?.targetMuscleGain ? user.targetMuscleGain.toString() : '',
      currentStrengthLevel: user?.currentStrengthLevel || ''
    };
    setProfileData(resetData);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Not specified';
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = () => {
    if (!profileData.height || !profileData.weight) return 'N/A';
    const heightInM = parseFloat(profileData.height) / 100;
    const weightInKg = parseFloat(profileData.weight);
    const bmi = weightInKg / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (bmi === 'N/A') return { status: 'Unknown', color: 'gray' };
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { status: 'Underweight', color: 'blue' };
    if (bmiValue < 25) return { status: 'Normal', color: 'green' };
    if (bmiValue < 30) return { status: 'Overweight', color: 'yellow' };
    return { status: 'Obese', color: 'red' };
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* About Me Section - Moved to top for better visibility */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-900" />
          About Me
        </h3>
        {isEditing ? (
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            placeholder="Tell us about yourself, your fitness journey, goals..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
          />
        ) : (
          <p className="text-gray-700 text-base leading-relaxed">
            {profileData.bio || 'Welcome to your fitness journey! 🌟 This is where your story begins. Share your goals, what motivates you, and celebrate every step forward. Remember, every expert was once a beginner - you\'ve got this! 💪'}
          </p>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profileData.name || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{profileData.email}</p>
            </div>

          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : 'Not specified'}
                  {profileData.dateOfBirth && <span className="text-gray-500 ml-2">({calculateAge(profileData.dateOfBirth)} years old)</span>}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              {isEditing ? (
                <select
                  value={profileData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900 capitalize">{profileData.gender || 'Not specified'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                />
              ) : (
                <p className="mt-1 text-gray-900">{profileData.location || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFitnessTab = () => (
    <div className="space-y-6">
      {/* Body Measurements */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{formatHeight(profileData.height)}</div>
            <div className="text-sm text-gray-600">Height</div>
            {isEditing && (
              <input
                type="number"
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="mt-2 w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                placeholder="Height in cm"
              />
            )}
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{formatWeight(profileData.weight)}</div>
            <div className="text-sm text-gray-600">Current Weight</div>
            {isEditing && (
              <input
                type="number"
                value={profileData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="mt-2 w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-[#EADFD0] focus:border-[#EADFD0]"
                placeholder="Weight in kg"
              />
            )}
          </div>
          {/* Dynamic Goal Field */}
          {renderDynamicGoalField()}
        </div>
        
        {/* BMI Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Body Mass Index (BMI)</h4>
              <p className="text-sm text-gray-600">Based on your height and weight</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{calculateBMI()}</div>
              {calculateBMI() !== 'N/A' && (
                <div className={`text-sm font-medium text-${getBMIStatus(calculateBMI()).color}-600`}>
                  {getBMIStatus(calculateBMI()).status}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fitness Goals & Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitness Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Fitness Goal</label>
            {isEditing ? (
              <select
                value={profileData.fitnessGoal}
                onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
              >
                <option value="">Select goal</option>
                <option value="weight-loss">Lose Weight</option>
                <option value="weight-gain">Gain Weight</option>
                <option value="muscle-gain">Build Muscle</option>
                <option value="strength">Improve Strength</option>
                <option value="general-fitness">Stay Fit / Maintain</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{getDisplayFitnessGoal(profileData.fitnessGoal)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            {isEditing ? (
              <select
                value={profileData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightly-active">Lightly Active</option>
                <option value="moderately-active">Moderately Active</option>
                <option value="very-active">Very Active</option>
                <option value="extremely-active">Extremely Active</option>
              </select>
            ) : (
              <p className="text-gray-900 capitalize">{getDisplayActivityLevel(profileData.activityLevel)}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Experience</label>
          {isEditing ? (
            <select
              value={profileData.fitnessExperience}
              onChange={(e) => handleInputChange('fitnessExperience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
            >
              <option value="">Select experience level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          ) : (
            <p className="text-gray-900 capitalize">{profileData.fitnessExperience || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-6">
      {/* Dietary Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Profile</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
            {isEditing ? (
              <select
                value={profileData.dietaryPreference}
                onChange={(e) => handleInputChange('dietaryPreference', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
              >
                <option value="">Select dietary preference</option>
                <option value="No Restrictions">No Restrictions</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Keto">Keto</option>
                <option value="Paleo">Paleo</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Low Carb">Low Carb</option>
                <option value="Gluten Free">Gluten Free</option>
                <option value="Dairy Free">Dairy Free</option>
                <option value="Intermittent Fasting">Intermittent Fasting</option>
                <option value="Pescatarian">Pescatarian</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{profileData.dietaryPreference || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      {/* Workout Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Frequency</label>
            {isEditing ? (
              <select
                value={profileData.workoutFrequency}
                onChange={(e) => handleInputChange('workoutFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
              >
                <option value="">Select frequency</option>
                <option value="2-3">2-3 times per week</option>
                <option value="3-4">3-4 times per week</option>
                <option value="4-5">4-5 times per week</option>
                <option value="5-6">5-6 times per week</option>
                <option value="daily">Daily</option>
              </select>
            ) : (
              <p className="text-gray-900">{formatFrequency(profileData.workoutFrequency)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Duration</label>
            {isEditing ? (
              <select
                value={profileData.workoutDuration}
                onChange={(e) => handleInputChange('workoutDuration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#EADFD0] focus:border-[#EADFD0]"
              >
                <option value="">Select duration</option>
                <option value="15-30">15-30 minutes</option>
                <option value="30-45">30-45 minutes</option>
                <option value="45-60">45-60 minutes</option>
                <option value="60-90">60-90 minutes</option>
                <option value="90+">90+ minutes</option>
              </select>
            ) : (
              <p className="text-gray-900">{formatDuration(profileData.workoutDuration)}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Workout Types</label>
          {isEditing ? (
            <Select
              isMulti
              options={WORKOUT_TYPE_OPTIONS.map(option => ({ value: option, label: option }))}
              value={
                (Array.isArray(profileData.preferredWorkouts)
                  ? profileData.preferredWorkouts
                  : (profileData.preferredWorkouts ? profileData.preferredWorkouts.split(',').map(w => w.trim()) : [])
                ).map(val => ({ value: val, label: val }))
              }
              onChange={selected => handleInputChange('preferredWorkouts', selected.map(opt => opt.value))}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select workout types..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '48px',
                  borderColor: '#EADFD0',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#FFF8ED',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#374151',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#374151',
                  ':hover': {
                    backgroundColor: '#EADFD0',
                    color: '#111827',
                  },
                }),
              }}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profileData.preferredWorkouts || []).length > 0 ? (
                profileData.preferredWorkouts.map((workout, index) => (
                  <span key={index} className="px-3 py-1 bg-[#FFF8ED] text-gray-800 text-sm rounded-full">
                    {workout}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No workout preferences specified</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Fitness Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-[#FFF8ED] rounded-lg">
            <Dumbbell className="w-8 h-8 text-gray-900 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{fitnessStats.totalWorkouts}</div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{fitnessStats.totalCaloriesBurned}</div>
            <div className="text-sm text-gray-600">Workout Calories</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{fitnessStats.averageWorkoutTimeMinutes}</div>
            <div className="text-sm text-gray-600">Avg Workout (min)</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{Math.round((fitnessStats.totalWorkoutTimeMinutes || 0) / 60)}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
        </div>
        
        {/* Total Nutrition Section */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Total Nutrition Progress</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <Utensils className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{nutritionStats.calories.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Calories</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{Math.round(nutritionStats.protein).toLocaleString()}g</div>
              <div className="text-sm text-gray-600">Total Protein</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{Math.round(nutritionStats.carbs).toLocaleString()}g</div>
              <div className="text-sm text-gray-600">Total Carbs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xs font-bold">F</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{Math.round(nutritionStats.fat).toLocaleString()}g</div>
              <div className="text-sm text-gray-600">Total Fat</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Workouts Section */}
      {fitnessStats.recentWorkouts && fitnessStats.recentWorkouts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Workouts</h3>
          <div className="space-y-3">
            {fitnessStats.recentWorkouts.map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F5EFE6] rounded-full flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{workout.workoutName || 'Workout'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(workout.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">{workout.caloriesBurned} cal</p>
                  <p className="text-sm text-gray-500">{workout.durationMinutes} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'fitness':
        return renderFitnessTab();
      case 'health':
        return renderHealthTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'stats':
        return renderStatsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Profile Picture and Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#EADFD0] shadow-lg relative">
                {imageUploading ? (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-gray-900 animate-spin" />
                  </div>
                ) : profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(profileData.name)}
                  </div>
                )}
              </div>
              
              {/* Photo Controls */}
              <div className="absolute bottom-0 right-0 flex gap-1">
                {/* Upload/Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerImageUpload}
                  disabled={imageUploading}
                  className="bg-black text-white rounded-full p-2 shadow-lg border-2 border-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={profileImage ? "Change photo" : "Upload photo"}
                >
                  <Camera className="w-4 h-4 text-white" />
                </motion.button>
                
                {/* Delete Button - only show if there's a photo */}
                {profileImage && !imageUploading && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={removeProfileImage}
                    className="bg-red-500 rounded-full p-2 shadow-lg border-2 border-white hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </motion.button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profileData.name || 'Your Name'}</h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </p>
                  {profileData.location && (
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profileData.location}
                    </p>
                  )}
                  
                  {/* Image Error Display */}
                  {imageError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {imageError}
                      </p>
                    </div>
                  )}
                  
                  {/* Image Upload Success */}
                  {profileImageFile && !imageError && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Photo updated successfully! ({(profileImageFile.size / 1024 / 1024).toFixed(2)}MB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-black transition-all duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6 hover:shadow-lg transition-all duration-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#EADFD0] text-gray-900 bg-[#FFF8ED]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;