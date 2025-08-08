import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiSave, FiBook, FiFolder } from 'react-icons/fi';
import { mealPlanAPI, mealPlanUtils } from '../services/mealPlanAPI';
import { useToast } from '../hooks/useToast';
import useMealPlanPersistence from '../hooks/useMealPlanPersistence';
import MealPlanSaveLoad from './MealPlanSaveLoad';

const DailyMealPlanGenerator = ({ onPlanGenerated, currentDayPlan, currentPlan, setCurrentPlan, token }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [quickSaveName, setQuickSaveName] = useState('');
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    cuisine: '',
    maxPrepTime: 30,
    complexity: 'intermediate',
    budget: 'medium',
    mealFocus: 'balanced' // balanced, protein-heavy, low-carb, vegetarian
  });
  const { showToast } = useToast();

  // Use the new persistence hook
  const {
    savePlan,
    loadPlan,
    getSavedPlans,
    getPersistenceStatus
  } = useMealPlanPersistence(currentDayPlan, onPlanGenerated, {
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    autoRestoreEnabled: true,
    showToastMessages: true
  });

  const handleGenerateDailyPlan = async () => {
    setIsGenerating(true);
    try {
      // Get user profile from storage
      const userProfile = mealPlanUtils.getUserProfileFromStorage();
      
      // Create request for single day
      const dailyRequest = {
        ...userProfile,
        budget_range: preferences.budget,
        cooking_skill: preferences.complexity,
        meal_focus: preferences.mealFocus,
        max_prep_time: preferences.maxPrepTime
      };
      
      // Add cuisine preference if selected
      if (preferences.cuisine) {
        dailyRequest.preferred_cuisines = [preferences.cuisine];
      }
      
      console.log('Sending daily request:', dailyRequest);
      
      // Generate daily meal plan
      const response = await mealPlanAPI.generateDailyMealPlan(dailyRequest);
      
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Response data:', response.data);
        
        // Transform to frontend format
        const dailyPlan = mealPlanUtils.transformDailyPlanToFrontendFormat(response.data);
        
        console.log('Transformed daily plan:', dailyPlan);
        
        // Update plan
        onPlanGenerated(dailyPlan);
        
        showToast('success', 'Meal plan generated successfully!');
      } else {
        console.error('API Error:', response.message);
        showToast('error', response.message || 'Failed to generate daily meal plan');
      }
    } catch (error) {
      console.error('Error generating daily meal plan:', error);
      showToast('error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick save handler
  const handleQuickSave = async () => {
    const nameToUse = quickSaveName.trim() || null;
    await savePlan(nameToUse);
    setQuickSaveName('');
    setIsQuickSaveOpen(false);
  };

  // Handle plan loaded from save/load modal
  const handlePlanLoaded = (planData) => {
    onPlanGenerated(planData);
  };

  const hasCurrentDayPlan = currentDayPlan && Object.keys(currentDayPlan).some(mealType => 
    currentDayPlan[mealType]?.name
  );

  // Get persistence status for UI indicators
  const persistenceStatus = getPersistenceStatus();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Daily AI Meal Planner</h2>
          {persistenceStatus.hasAutoSave && (
            <span className="text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded-full">
              Auto-saved
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {/* Save & Load Manager Button */}
          <button
            onClick={() => setShowSaveLoadModal(true)}
            className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-black transition-all shadow-sm"
            title="Manage saved plans"
          >
            <FiFolder className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Meal Plans</span>
            {persistenceStatus.savedPlansCount > 0 && (
              <span className="ml-2 bg-white text-gray-900 text-xs px-2 py-1 rounded-full font-medium">
                {persistenceStatus.savedPlansCount}
              </span>
            )}
          </button>

          {/* Quick Save Button */}
          {hasCurrentDayPlan && (
            <div className="flex items-center gap-2">
              {isQuickSaveOpen && (
                <>
                  <input
                    type="text"
                    value={quickSaveName}
                    onChange={(e) => setQuickSaveName(e.target.value)}
                    placeholder={`Daily Plan - ${new Date().toLocaleDateString()}`}
                    className="w-44 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000] focus:border-transparent text-sm"
                  />
                  <button
                    onClick={() => { setIsQuickSaveOpen(false); setQuickSaveName(''); }}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={() => (isQuickSaveOpen ? handleQuickSave() : setIsQuickSaveOpen(true))}
                className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-black transition-all shadow-sm"
                title="Save current plan"
              >
                <FiSave className="w-4 h-4" />
                <span className="ml-2">{isQuickSaveOpen ? 'Save' : 'Save Plan'}</span>
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-sm text-gray-900 hover:text-black px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            {showAdvancedOptions ? 'Hide Options' : 'Options'}
          </button>
        </div>
      </div>

      {showAdvancedOptions && (
        <div className="mt-2 p-4 bg-[#F5EFE6] rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3">Meal Plan Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Meal Focus
              </label>
              <select
                value={preferences.mealFocus}
                onChange={(e) => setPreferences(prev => ({ ...prev, mealFocus: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#000] focus:border-transparent"
              >
                <option value="balanced">Balanced</option>
                <option value="protein-heavy">High Protein</option>
                <option value="low-carb">Low Carb</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="comfort-food">Comfort Food</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cuisine Type
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) => setPreferences(prev => ({ ...prev, cuisine: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#000] focus:border-transparent"
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
                Max Prep Time
              </label>
              <select
                value={preferences.maxPrepTime}
                onChange={(e) => setPreferences(prev => ({ ...prev, maxPrepTime: parseInt(e.target.value) }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#000] focus:border-transparent"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleGenerateDailyPlan}
          disabled={isGenerating}
          className="flex-1 bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <FiRefreshCw className="animate-spin mr-2 h-5 w-5" />
              Generating Plan...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              🤖 Generate Daily Meals
            </span>
          )}
        </button>
        
        {hasCurrentDayPlan && (
          <button
            onClick={handleGenerateDailyPlan}
            disabled={isGenerating}
            className="bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-black disabled:bg-gray-400 transition-colors duration-200"
          >
            <FiRefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p>
            💡 Generate personalized meals for today. Much more cost-effective than full weekly plans!
            {hasCurrentDayPlan && ' Your plan is auto-saved every 30 seconds.'}
          </p>
        </div>
        
        {persistenceStatus.savedPlansCount > 0 && (
          <div className="text-xs text-gray-500">
            {persistenceStatus.savedPlansCount}/{persistenceStatus.maxPlans} saved plans
          </div>
        )}
      </div>

      {/* Enhanced Save/Load Modal */}
      <MealPlanSaveLoad
        currentPlan={currentDayPlan}
        onPlanLoaded={handlePlanLoaded}
        isVisible={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
      />
    </div>
  );
};

export default DailyMealPlanGenerator;