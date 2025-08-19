import React, { useState, useEffect } from 'react';
import { FiTrash2, FiClock, FiUsers, FiX, FiDownload, FiFolder } from 'react-icons/fi';
import mealPlanPersistence from '../services/mealPlanPersistence';
import { useToast } from '../hooks/useToast';

const MealPlanSaveLoad = ({ currentPlan, onPlanLoaded, isVisible, onClose }) => {
  const [savedPlans, setSavedPlans] = useState([]);
  
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

  

  // Load plan function retained for potential future use (invoked via list items)
  const handleLoadPlan = async (planId) => {
    setIsLoading(true);
    try {
      const result = await mealPlanPersistence.loadPlan(planId);
      if (result.success) {
        onPlanLoaded(result.data);
        showToast('success', `Loaded: ${result.metadata.name}`);
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
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
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
    <div className="fixed inset-0 bg-[#F5EFE6]/40 backdrop-blur-[6px] backdrop-saturate-150 flex items-center justify-center p-4 z-50">
      <div className="bg-[#FFF8ED]/90 backdrop-blur-lg rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-[#EADFD0]/60">
        {/* Header */}
        <div className="p-4 border-b bg-[#FFF1E0]/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Meal Plans</h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/60 hover:bg-white text-gray-700 shadow"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Removed action buttons for a cleaner UI */}

        {/* Saved Plans List */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Saved Plans</h3>
            <span className="text-xs text-gray-500">{savedPlans.length} saved</span>
          </div>
          
          {savedPlans.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiFolder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No saved plans yet</p>
              <p className="text-sm">Save your current meal plan to get started!</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-[#FFFDF7]/80 backdrop-blur border border-[#F2E8D8]/70 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  {/* Plan Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">
                        {typeof plan.name === 'string' ? plan.name : 'Untitled Plan'}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FiClock className="w-4 h-4 mr-1 opacity-70" />
                        {formatDate(plan.savedAt)}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoadPlan(plan.id)}
                        disabled={isLoading}
                        className="p-2 text-gray-900 hover:bg-[#FFF7EF] rounded-lg transition-colors"
                        title="Load this plan"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id, typeof plan.name === 'string' ? plan.name : 'Untitled Plan')}
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
                        <div className="flex items-center text-gray-700">
                          <FiUsers className="w-4 h-4 mr-1 opacity-70" />
                          {typeof plan.summary.mealCount === 'number' ? plan.summary.mealCount : 0} meals
                        </div>
                        {plan.summary.hasNutrition && typeof plan.summary.totalCalories === 'number' && (
                          <div className="text-gray-900 font-medium">
                            {plan.summary.totalCalories} cal
                          </div>
                        )}
                      </div>
                      {Array.isArray(plan.summary.mealTypes) && plan.summary.mealTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {plan.summary.mealTypes.map((mealType) => (
                            <span
                              key={mealType}
                              className="px-2 py-1 bg-[#FFF5E6]/80 border border-[#F2E2C4]/70 text-gray-800 text-xs rounded-full capitalize"
                            >
                              {mealType}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Modal removed as per requirement */}

        {/* Load Modal removed as per requirement */}
      </div>
    </div>
  );
};

export default MealPlanSaveLoad; 
