import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch } from '../../hooks/redux';
import { updateUserProfile } from '../../store/authSlice';

const Summary = ({ prevStep, values }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { 
    goal, gender, birthday, height, currentWeight, goalWeight, location,
    fitnessExperience, preferredWorkouts,
    dietaryPreference
  } = values;

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDifference = today.getMonth() - birthDateObj.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(birthday);

  // Mifflin-St Jeor Equation for BMR
  const calculateBMR = () => {
    if (!currentWeight || !height || !age) return 0;
    if (gender === 'male') {
      return 10 * currentWeight + 6.25 * height - 5 * age + 5;
    }
    return 10 * currentWeight + 6.25 * height - 5 * age - 161;
  };

  const calculateTDEE = () => calculateBMR();
  
  const calculateNutrients = () => {
    let calories = calculateTDEE();
    if (goal === 'lose') {
        calories -= 500; // 1lb per week deficit
    } else if (goal === 'gain') {
        calories += 500; // 1lb per week surplus
    }

    const protein = Math.round((calories * 0.3) / 4);
    const carbs = Math.round((calories * 0.4) / 4);
    const fat = Math.round((calories * 0.3) / 9);
    
    return { calories: Math.round(calories), protein, carbs, fat };
  };

  const nutrients = calculateNutrients();

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Get goal-specific required fields
      const getRequiredFieldsForGoal = (goalType) => {
        const baseRequiredFields = {
          goal: goal,
          gender: gender,
          birthday: birthday,
          height: height,
          currentWeight: currentWeight,
          location: location
        };

        // Add goal-specific required fields
        const goalSpecificFields = {
          'lose': { goalWeight: goalWeight },
          'gain': { goalWeight: goalWeight },
          'muscle': {}, // Current weight is sufficient for muscle building
          'strength': {},
          'maintain': {} // No additional required fields for maintain
        };

        return {
          ...baseRequiredFields,
          ...(goalSpecificFields[goalType] || {})
        };
      };

      const requiredFields = getRequiredFieldsForGoal(goal);

      // Map onboarding data to backend profile format
      const getProfileDataForGoal = (goalType) => {
        const baseProfileData = {
          // Keep the previously saved name (do not overwrite it with placeholders)
          firstName: user?.firstName,
          lastName: user?.lastName,
          dateOfBirth: birthday,
          gender: gender,
          height: parseFloat(height) || 0,
          weight: parseFloat(currentWeight) || 0,
          fitnessGoals: [mapGoal(goal)],
          location: location || '',
          
          // Extended questionnaire data
          fitnessExperience: fitnessExperience || '',
          preferredWorkouts: Array.isArray(preferredWorkouts) ? preferredWorkouts.join(',') : '',
          dietaryPreference: dietaryPreference || ''
        };

        // Ensure required fields have valid values
        if (!baseProfileData.dateOfBirth) {
          throw new Error('Date of birth is required');
        }
        if (!baseProfileData.gender) {
          throw new Error('Gender is required');
        }
        if (!baseProfileData.height || baseProfileData.height === 0) {
          throw new Error('Height is required');
        }
        if (!baseProfileData.weight || baseProfileData.weight === 0) {
          throw new Error('Weight is required');
        }
        
        // Validate goal-specific fields
        if (values.targetMuscleGain && parseFloat(values.targetMuscleGain) > 50) {
          throw new Error('Target muscle gain cannot exceed 50kg');
        }

        // Add goal-specific fields
        const goalSpecificData = {};
        
        if (['lose', 'gain'].includes(goalType) && goalWeight) {
          goalSpecificData.goalWeight = parseFloat(goalWeight) || 0;
        }
        
        // Add other goal-specific dynamic fields from the values object
        if (values.targetMuscleGain) goalSpecificData.targetMuscleGain = parseFloat(values.targetMuscleGain);
        if (values.currentStrengthLevel) goalSpecificData.currentStrengthLevel = values.currentStrengthLevel;

        return {
          ...baseProfileData,
          ...goalSpecificData
        };
      };

      const profileData = getProfileDataForGoal(goal);

      console.log('=== PROFILE SUBMISSION DEBUG ===');
      console.log('Selected goal:', goal);
      console.log('Mapped goal:', mapGoal(goal));
      console.log('Profile data being sent:', JSON.stringify(profileData, null, 2));
      console.log('Full form values:', JSON.stringify(values, null, 2));
      // No required fields check after removal of certain fields

      // Update profile on backend
      const result = await dispatch(updateUserProfile(profileData)).unwrap();
      console.log('Profile update result:', result);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Log each validation error in a readable table (backend now returns value & kind)
      if (error.response?.data?.errors?.length) {
        // eslint-disable-next-line no-console
        console.table(error.response.data.errors);
      }
      
      // Show detailed error message for debugging
      let errorMessage = 'Failed to save profile';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        errorMessage += `\n\nValidation errors:\n${validationErrors}`;
      }
      
      alert(`${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to map frontend values to backend enum values
  const mapGoal = (goal) => {
    const mapping = {
      'lose': 'weight-loss',
      'gain': 'weight-gain',
      'muscle': 'muscle-gain',
      'strength': 'strength',
      'maintain': 'general-fitness'
    };
    return mapping[goal] || 'general-fitness';
  };

  const detailItem = (label, value, unit = '') => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value} {unit}</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Summary</h2>
        <p className="text-gray-600 mt-2">Here is a summary of your profile and daily goals.</p>
      </div>
      
      <div className="space-y-4 mb-8">
        {detailItem("Goal", values.goal)}
        {detailItem("Current Weight", values.currentWeight, 'kg')}
        
        {/* Dynamic goal-specific fields */}
        {(['lose', 'gain'].includes(values.goal) && values.goalWeight) && 
          detailItem("Goal Weight", values.goalWeight, 'kg')}
        {values.targetMuscleGain && 
          detailItem("Target Muscle Gain", values.targetMuscleGain, 'kg')}
        {values.currentStrengthLevel && 
          detailItem("Strength Level", values.currentStrengthLevel)}
        
        {detailItem("Height", values.height, 'cm')}
        {detailItem("Gender", values.gender)}
        {detailItem("Age", age)}
        {detailItem("Fitness Experience", values.fitnessExperience)}
        {detailItem("Dietary Preference", values.dietaryPreference)}
        {detailItem("Preferred Workouts", (values.preferredWorkouts || []).join(', '))}
        {detailItem("Location", values.location)}
      </div>

      <div className="bg-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-center mb-4 text-pink-800">Your Daily Goals</h3>
        <div className="flex justify-around text-center">
            <div>
                <p className="text-2xl font-bold text-pink-600">{nutrients.calories}</p>
                <p className="text-sm text-gray-600">Calories</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-pink-600">{nutrients.protein}g</p>
                <p className="text-sm text-gray-600">Protein</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-pink-600">{nutrients.carbs}g</p>
                <p className="text-sm text-gray-600">Carbs</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-pink-600">{nutrients.fat}g</p>
                <p className="text-sm text-gray-600">Fat</p>
            </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? 'Saving...' : 'Finish & Go to Dashboard'}
        </button>
      </div>
    </motion.div>
  );
};

export default Summary; 