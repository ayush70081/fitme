import React, { useState, useEffect } from 'react';
import { FiSave, FiFolder, FiTrash2, FiClock, FiUsers, FiX, FiDownload, FiUpload, FiCloud, FiWifi, FiWifiOff } from 'react-icons/fi';
import mealPlanPersistence from '../services/mealPlanPersistence';
import { useToast } from '../hooks/useToast';

const MealPlanSaveLoad = ({ currentPlan, onPlanLoaded, isVisible, onClose }) => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [customPlanName, setCustomPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isVisible) {
      loadSavedPlans();
    }
  }, [isVisible]);

  const loadSavedPlans = () => {
    const plans = mealPlanPersistence.getSavedPlans();
    setSavedPlans(plans);
  };

  const handleSavePlan = async () => {
    if (!currentPlan || Object.keys(currentPlan).length === 0) {
      showToast('error', 'No meal plan to save');
      return;
    }

    setIsLoading(true);
    try {
      const planName = customPlanName.trim() || null;
      const result = await mealPlanPersistence.savePlan(currentPlan, planName);
      
      if (result.success) {
        showToast('success', result.message);
        setCustomPlanName('');
        setShowSaveModal(false);
        loadSavedPlans(); // Refresh the list
      } else {
        showToast('error', result.message);
      }
    } catch (error) {
      showToast('error', 'Failed to save plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPlan = async (planId) => {
    setIsLoading(true);
    try {
      const result = await mealPlanPersistence.loadPlan(planId);
      
      if (result.success) {
        onPlanLoaded(result.data);
        showToast('success', `Loaded: ${result.metadata.name}`);
        setShowLoadModal(false);
        onClose();
      } else {
        showToast('error', result.message);
      }
    } catch (error) {
      showToast('error', 'Failed to load plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!confirm(`Delete "${planName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await mealPlanPersistence.deletePlan(planId);
      
      if (result.success) {
        showToast('success', 'Plan deleted');
        loadSavedPlans(); // Refresh the list
      } else {
        showToast('error', result.message);
      }
    } catch (error) {
      showToast('error', 'Failed to delete plan');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasCurrentPlan = currentPlan && Object.keys(currentPlan).some(key => 
    currentPlan[key]?.name && !key.includes('Total')
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                🍽️ Meal Plan Manager
              </h2>
              <p className="text-gray-600">Save and manage your daily meal plans</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!hasCurrentPlan || isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Save Current Plan
            </button>
            
            <button
              onClick={() => setShowLoadModal(true)}
              disabled={savedPlans.length === 0 || isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <FiFolder className="w-4 h-4 mr-2" />
              Load Saved Plan
            </button>

            <div className="flex items-center text-sm text-gray-600 ml-auto">
              <FiCloud className="w-4 h-4 mr-1" />
              {savedPlans.some(p => p.synced) ? (
                <span className="flex items-center text-green-600">
                  <FiWifi className="w-4 h-4 mr-1" />
                  Synced
                </span>
              ) : (
                <span className="flex items-center text-orange-600">
                  <FiWifiOff className="w-4 h-4 mr-1" />
                  Local Only
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Saved Plans List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Saved Plans ({savedPlans.length}/5)
          </h3>
          
          {savedPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiFolder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No saved plans yet</p>
              <p className="text-sm">Save your current meal plan to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {plan.name}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FiClock className="w-4 h-4 mr-1" />
                        {formatDate(plan.savedAt)}
                        {plan.synced && (
                          <span className="ml-2 flex items-center text-green-600">
                            <FiCloud className="w-3 h-3 mr-1" />
                            Synced
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoadPlan(plan.id)}
                        disabled={isLoading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Load this plan"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete this plan"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Plan Summary */}
                  {plan.summary && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="w-4 h-4 mr-1" />
                          {plan.summary.mealCount} meals
                        </div>
                        {plan.summary.hasNutrition && (
                          <div className="text-orange-600 font-medium">
                            {plan.summary.totalCalories} cal
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {plan.summary.mealTypes.map((mealType) => (
                          <span
                            key={mealType}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize"
                          >
                            {mealType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Save Meal Plan</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name (optional)
                </label>
                <input
                  type="text"
                  value={customPlanName}
                  onChange={(e) => setCustomPlanName(e.target.value)}
                  placeholder={`Daily Plan - ${new Date().toLocaleDateString()}`}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave blank for automatic naming
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Load Modal */}
        {showLoadModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Load Meal Plan</h3>
              
              <div className="mb-4 max-h-60 overflow-y-auto">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLoadPlan(plan.id)}
                  >
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(plan.savedAt)}
                      {plan.summary && (
                        <span className="ml-2">
                          • {plan.summary.mealCount} meals
                          {plan.summary.hasNutrition && ` • ${plan.summary.totalCalories} cal`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowLoadModal(false)}
                disabled={isLoading}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanSaveLoad; 