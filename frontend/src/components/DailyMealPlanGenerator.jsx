import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiSave, FiBook, FiFolder, FiSettings, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi';
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
    <div className="bg-white rounded-xl border border-[#EADFD0] shadow-sm">
      {/* Compact Header */}
      <div className="bg-[#F5EFE6] px-4 py-3 border-b border-[#EADFD0] rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiZap className="w-5 h-5 text-gray-900" />
            <h3 className="text-base font-semibold text-gray-900">AI Meal Planner</h3>
          </div>
          

        </div>
      </div>

      {/* Compact Content */}
      <div className="p-4 space-y-3">
        {/* Main Action Row */}
        <div className="flex gap-2">
          {/* Generate Button */}
          <button
            onClick={handleGenerateDailyPlan}
            disabled={isGenerating}
            className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <FiRefreshCw className="animate-spin w-4 h-4" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FiZap className="w-4 h-4" />
                <span>Generate Daily Meals</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <button
            onClick={() => setShowSaveLoadModal(true)}
            className="bg-[#F5EFE6] border border-[#EADFD0] text-gray-700 px-3 py-3 rounded-lg hover:bg-[#EADFD0] transition-all flex items-center gap-1"
            title="Meal Plans"
          >
            <FiFolder className="w-4 h-4" />
            {persistenceStatus.savedPlansCount > 0 && (
              <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[16px] text-center">
                {persistenceStatus.savedPlansCount}
              </span>
            )}
          </button>

          {hasCurrentDayPlan && (
            <button
              onClick={() => setIsQuickSaveOpen(!isQuickSaveOpen)}
              className="bg-[#F5EFE6] border border-[#EADFD0] text-gray-700 px-3 py-3 rounded-lg hover:bg-[#EADFD0] transition-all"
              title="Save Plan"
            >
              <FiSave className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="bg-[#F5EFE6] border border-[#EADFD0] text-gray-700 px-3 py-3 rounded-lg hover:bg-[#EADFD0] transition-all"
            title="Options"
          >
            <FiSettings className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Save Input */}
        {isQuickSaveOpen && (
          <div className="bg-[#F5EFE6] border border-[#EADFD0] rounded-lg p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={quickSaveName}
                onChange={(e) => setQuickSaveName(e.target.value)}
                placeholder={`Daily Plan - ${new Date().toLocaleDateString()}`}
                className="flex-1 px-3 py-2 border border-[#EADFD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent bg-white text-sm"
              />
              <button
                onClick={handleQuickSave}
                className="bg-black text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={() => { setIsQuickSaveOpen(false); setQuickSaveName(''); }}
                className="px-3 py-2 text-gray-700 hover:bg-[#EADFD0] rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Compact Options */}
        {showAdvancedOptions && (
          <div className="bg-[#F5EFE6] border border-[#EADFD0] rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Focus
                </label>
                <select
                  value={preferences.mealFocus}
                  onChange={(e) => setPreferences(prev => ({ ...prev, mealFocus: e.target.value }))}
                  className="w-full p-2 border border-[#EADFD0] rounded-lg focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent bg-white text-xs"
                >
                  <option value="balanced">Balanced</option>
                  <option value="protein-heavy">High Protein</option>
                  <option value="low-carb">Low Carb</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="comfort-food">Comfort Food</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cuisine
                </label>
                <select
                  value={preferences.cuisine}
                  onChange={(e) => setPreferences(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="w-full p-2 border border-[#EADFD0] rounded-lg focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent bg-white text-xs"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Prep Time
                </label>
                <select
                  value={preferences.maxPrepTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxPrepTime: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-[#EADFD0] rounded-lg focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent bg-white text-xs"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Compact Footer (no copy text) */}
        <div className="pt-2 border-t border-[#EADFD0]"></div>
      </div>

      {/* Modal */}
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