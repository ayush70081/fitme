import React, { useState } from 'react';
import { mealPlanAPI, mealPlanUtils } from '../services/mealPlanAPI';
import { useToast } from '../hooks/useToast';

const MealPlanGenerator = ({ onPlanGenerated, currentPlans }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [preferences, setPreferences] = useState({
    cuisine: '',
    maxPrepTime: 30,
    complexity: 'intermediate',
    budget: 'medium'
  });
  const { showToast } = useToast();

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      // Get user profile from storage
      const userProfile = mealPlanUtils.getUserProfileFromStorage();
      
      // Add preferences to user profile
      const enhancedProfile = {
        ...userProfile,
        budget_range: preferences.budget,
        cooking_skill: preferences.complexity
      };
      
      // Add cuisine preference if selected
      if (preferences.cuisine) {
        enhancedProfile.preferred_cuisines = [preferences.cuisine];
      }
      
      // Generate meal plan
      const response = await mealPlanAPI.generateMealPlan(enhancedProfile, preferences);
      
      if (response.success) {
        // Transform to frontend format
        const transformedPlan = mealPlanUtils.transformToFrontendFormat(response.data);
        
        // Call the callback to update the parent component
        onPlanGenerated(transformedPlan.plans);
        
        showToast('success', 'Meal plan generated successfully!');
      } else {
        showToast('error', response.message || 'Failed to generate meal plan');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      showToast('error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    try {
      // Get user profile and regenerate
      const userProfile = mealPlanUtils.getUserProfileFromStorage();
      const enhancedProfile = {
        ...userProfile,
        budget_range: preferences.budget,
        cooking_skill: preferences.complexity
      };
      
      if (preferences.cuisine) {
        enhancedProfile.preferred_cuisines = [preferences.cuisine];
      }
      
      const response = await mealPlanAPI.generateMealPlan(enhancedProfile, { ...preferences, regenerate: true });
      
      if (response.success) {
        const transformedPlan = mealPlanUtils.transformToFrontendFormat(response.data);
        onPlanGenerated(transformedPlan.plans);
        showToast('success', 'New meal plan generated successfully!');
      } else {
        showToast('error', response.message || 'Failed to regenerate meal plan');
      }
    } catch (error) {
      console.error('Error regenerating meal plan:', error);
      showToast('error', 'Failed to regenerate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasExistingPlan = currentPlans && Object.keys(currentPlans).some(day => 
    currentPlans[day]?.breakfast?.name || currentPlans[day]?.lunch?.name || currentPlans[day]?.dinner?.name
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">AI Meal Plan Generator</h2>
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvancedOptions ? 'Hide Options' : 'Show Options'}
        </button>
      </div>

      {showAdvancedOptions && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cuisine Type
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) => setPreferences(prev => ({ ...prev, cuisine: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Cuisine</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="american">American</option>
                <option value="indian">Indian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Max Prep Time (minutes)
              </label>
              <select
                value={preferences.maxPrepTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxPrepTime: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cooking Complexity
              </label>
              <select
                value={preferences.complexity}
                onChange={(e) => setPreferences(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Budget Range
              </label>
              <select
                value={preferences.budget}
                onChange={(e) => setPreferences(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Budget-friendly</option>
                <option value="medium">Moderate</option>
                <option value="high">Premium</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!hasExistingPlan ? (
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              '🤖 Generate AI Meal Plan'
            )}
          </button>
        ) : (
          <button
            onClick={handleRegeneratePlan}
            disabled={isGenerating}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Regenerating...
              </span>
            ) : (
              '🔄 Generate New Plan'
            )}
          </button>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          💡 The AI will create a personalized 7-day meal plan based on your profile, dietary preferences, and goals.
          {hasExistingPlan && ' Click "Generate New Plan" to create a completely new meal plan.'}
        </p>
      </div>
    </div>
  );
};

export default MealPlanGenerator;