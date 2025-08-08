import { useEffect, useRef, useCallback } from 'react';
import mealPlanPersistence from '../services/mealPlanPersistence';
import { useToast } from './useToast';

/**
 * Hook for managing meal plan persistence with auto-save and restore
 * @param {Object} currentPlan - The current meal plan state
 * @param {Function} setPlan - Function to update the meal plan state
 * @param {Object} options - Configuration options
 */
export const useMealPlanPersistence = (currentPlan, setPlan, options = {}) => {
  const {
    autoSaveEnabled = true,
    autoSaveInterval = 30000, // 30 seconds
    autoRestoreEnabled = true,
    showToastMessages = true
  } = options;

  const { showToast } = useToast();
  const autoSaveRef = useRef(null);
  const lastSavedRef = useRef(null);
  const isRestoringRef = useRef(false);

  // Function to get current plan (for auto-save callback)
  const getCurrentPlan = useCallback(() => currentPlan, [currentPlan]);

  // Auto-restore on component mount
  useEffect(() => {
    if (!autoRestoreEnabled || isRestoringRef.current) return;

    const restorePlan = async () => {
      isRestoringRef.current = true;
      
      try {
        const result = mealPlanPersistence.restorePlan();
        
        if (result.success && result.data) {
          // If there is already a non-empty plan in memory, don't clobber it
          try {
            const existingPlan = getCurrentPlan();
            const hasExistingMeals = !!existingPlan && Object.values(existingPlan).some(m => m && m.name);
            if (hasExistingMeals) {
              return; // skip restore to avoid overwriting user changes
            }
          } catch {}

          setPlan(result.data);
          
          if (showToastMessages && result.metadata?.isRestored) {
            showToast('info', `Restored: ${result.metadata.name}`);
          }
        }
      } catch (error) {
        console.error('Error restoring plan:', error);
      } finally {
        isRestoringRef.current = false;
      }
    };

    // Small delay to ensure component is fully mounted
    const timer = setTimeout(restorePlan, 100);
    return () => clearTimeout(timer);
  }, [autoRestoreEnabled, setPlan, showToast, showToastMessages]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Start auto-save timer
    mealPlanPersistence.startAutoSave(getCurrentPlan, autoSaveInterval);

    // Cleanup on unmount
    return () => {
      mealPlanPersistence.stopAutoSave();
    };
  }, [autoSaveEnabled, autoSaveInterval, getCurrentPlan]);

  // Manual save function
  const savePlan = useCallback(async (planName = null) => {
    try {
      if (!currentPlan || Object.keys(currentPlan).length === 0) {
        if (showToastMessages) {
          showToast('error', 'No meal plan to save');
        }
        return { success: false, message: 'No meal plan to save' };
      }

      const result = await mealPlanPersistence.savePlan(currentPlan, planName);
      
      if (showToastMessages) {
        showToast(result.success ? 'success' : 'error', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error saving plan:', error);
      const errorResult = { success: false, message: 'Failed to save plan' };
      
      if (showToastMessages) {
        showToast('error', errorResult.message);
      }
      
      return errorResult;
    }
  }, [currentPlan, showToast, showToastMessages]);

  // Manual load function
  const loadPlan = useCallback(async (planId = null) => {
    try {
      const result = await mealPlanPersistence.loadPlan(planId);
      
      if (result.success && result.data) {
        setPlan(result.data);
        
        if (showToastMessages) {
          showToast('success', result.message);
        }
      } else if (showToastMessages) {
        showToast('error', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error loading plan:', error);
      const errorResult = { success: false, message: 'Failed to load plan' };
      
      if (showToastMessages) {
        showToast('error', errorResult.message);
      }
      
      return errorResult;
    }
  }, [setPlan, showToast, showToastMessages]);

  // Get saved plans
  const getSavedPlans = useCallback(() => {
    return mealPlanPersistence.getSavedPlans();
  }, []);

  // Delete plan
  const deletePlan = useCallback(async (planId) => {
    try {
      const result = await mealPlanPersistence.deletePlan(planId);
      
      if (showToastMessages) {
        showToast(result.success ? 'success' : 'error', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting plan:', error);
      const errorResult = { success: false, message: 'Failed to delete plan' };
      
      if (showToastMessages) {
        showToast('error', errorResult.message);
      }
      
      return errorResult;
    }
  }, [showToast, showToastMessages]);

  // Clear all data
  const clearAllData = useCallback(() => {
    mealPlanPersistence.clearAllData();
    setPlan({});
    
    if (showToastMessages) {
      showToast('info', 'All meal plan data cleared');
    }
  }, [setPlan, showToast, showToastMessages]);

  // Force save current plan immediately
  const forceSave = useCallback(async () => {
    if (currentPlan && Object.keys(currentPlan).length > 0) {
      return await mealPlanPersistence.savePlan(currentPlan, null, true);
    }
    return { success: false, message: 'No plan to save' };
  }, [currentPlan]);

  // Check if there's a plan that needs saving
  const hasUnsavedChanges = useCallback(() => {
    if (!currentPlan || Object.keys(currentPlan).length === 0) {
      return false;
    }

    const currentPlanString = JSON.stringify(currentPlan);
    const lastSavedString = lastSavedRef.current;
    
    return currentPlanString !== lastSavedString;
  }, [currentPlan]);

  // Update last saved reference when plan changes
  useEffect(() => {
    if (currentPlan && Object.keys(currentPlan).length > 0) {
      // Debounce updates to avoid excessive saves
      const timer = setTimeout(() => {
        lastSavedRef.current = JSON.stringify(currentPlan);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentPlan]);

  // Window beforeunload handler to save before page close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges()) {
        // Try to save before leaving
        forceSave();
        
        // Show browser warning
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, forceSave]);

  // Provide persistence status
  const getPersistenceStatus = useCallback(() => {
    const savedPlans = mealPlanPersistence.getSavedPlans();
    const currentPlanData = mealPlanPersistence.getCurrentPlan();
    const autoSavedPlan = mealPlanPersistence.getAutoSavedPlan();
    
    return {
      hasCurrentPlan: !!currentPlanData,
      hasAutoSave: !!autoSavedPlan,
      savedPlansCount: savedPlans.length,
      maxPlans: mealPlanPersistence.maxLocalPlans,
      autoSaveEnabled,
      lastAutoSave: autoSavedPlan?.savedAt || null,
      syncedPlans: savedPlans.filter(p => p.synced).length
    };
  }, [autoSaveEnabled]);

  return {
    // Core functions
    savePlan,
    loadPlan,
    getSavedPlans,
    deletePlan,
    clearAllData,
    
    // Advanced functions
    forceSave,
    hasUnsavedChanges,
    getPersistenceStatus,
    
    // Status
    autoSaveEnabled,
    autoRestoreEnabled
  };
};

export default useMealPlanPersistence; 