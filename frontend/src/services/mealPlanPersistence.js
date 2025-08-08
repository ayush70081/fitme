/**
 * Unified Meal Plan Persistence Service
 * Handles saving/loading meal plans with hybrid localStorage + backend storage
 */

import { mealPlanAPI } from './mealPlanAPI';

const STORAGE_KEYS = {
  CURRENT_PLAN: 'current_meal_plan',
  SAVED_PLANS: 'saved_meal_plans',
  AUTO_SAVE: 'auto_saved_plan',
  SYNC_STATUS: 'plans_sync_status'
};

class MealPlanPersistence {
  constructor() {
    this.syncInProgress = false;
    this.maxLocalPlans = 5; // Limit local storage
    this.autoSaveInterval = null;
  }

  /**
   * Save the current daily meal plan
   * @param {Object} plan - The meal plan object
   * @param {string} planName - Optional custom name for the plan
   * @param {boolean} autoSave - Whether this is an auto-save
   */
  async savePlan(plan, planName = null, autoSave = false) {
    try {
      // Generate plan metadata
      const timestamp = new Date().toISOString();
      const savedPlan = {
        id: `plan_${Date.now()}`,
        name: planName || `Daily Plan - ${new Date().toLocaleDateString()}`,
        meals: plan,
        savedAt: timestamp,
        isAutoSave: autoSave,
        synced: false,
        // Add nutritional summary for quick view
        summary: this.generatePlanSummary(plan)
      };

      if (autoSave) {
        // Auto-save to special slot
        localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(savedPlan));
      } else {
        // Save to regular saved plans
        await this.addToSavedPlans(savedPlan);
      }

      // Always update current plan (store only meals for consistency)
      localStorage.setItem(STORAGE_KEYS.CURRENT_PLAN, JSON.stringify(savedPlan.meals));

      // Attempt backend sync (non-blocking)
      this.syncToBackend(savedPlan).catch(error => {
        console.warn('Backend sync failed, plan saved locally:', error.message);
      });

      return {
        success: true,
        message: autoSave ? 'Plan auto-saved' : 'Plan saved successfully',
        planId: savedPlan.id
      };

    } catch (error) {
      console.error('Error saving plan:', error);
      return {
        success: false,
        message: 'Failed to save plan'
      };
    }
  }

  /**
   * Load a specific saved plan
   * @param {string} planId - The plan ID to load
   */
  async loadPlan(planId = null) {
    try {
      let plan = null;
      if (planId) {
        // Load specific plan from localStorage
        plan = await this.getSavedPlan(planId);
      } else {
        // Load most recent plan (current or auto-saved)
        plan = this.getCurrentPlan() || this.getAutoSavedPlan();
      }
      // If not found locally, fetch from backend
      if (!plan) {
        const token = localStorage.getItem('fitme_token');
        if (token) {
          const res = await fetch('/api/mealplan/saved', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            plan = {
              id: data.data.id || 'backend',
              name: 'Loaded from backend',
              meals: data.data.meals,
              savedAt: data.data.created_at || new Date().toISOString(),
              isRestored: true
            };
            // Update localStorage for future loads
            localStorage.setItem('current_meal_plan', JSON.stringify(plan.meals));
          }
        }
      }
      if (plan) {
        // Determine meals shape (plan may already be just meals)
        const mealsOnly = plan?.meals ? plan.meals : plan;
        // Update current plan
        localStorage.setItem('current_meal_plan', JSON.stringify(mealsOnly));
        return {
          success: true,
          message: 'Plan loaded successfully',
          data: mealsOnly,
          metadata: {
            name: plan.name || 'Current Plan',
            savedAt: plan.savedAt || new Date().toISOString(),
            summary: plan.summary
          }
        };
      }
      return {
        success: false,
        message: 'No saved plan found'
      };
    } catch (error) {
      console.error('Error loading plan:', error);
      return {
        success: false,
        message: 'Failed to load plan'
      };
    }
  }

  /**
   * Get all saved plans for the user
   */
  getSavedPlans() {
    try {
      const localPlans = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PLANS) || '[]');
      
      // Sort by saved date (newest first)
      return localPlans.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    } catch (error) {
      console.error('Error getting saved plans:', error);
      return [];
    }
  }

  /**
   * Delete a saved plan
   */
  async deletePlan(planId) {
    try {
      const savedPlans = this.getSavedPlans();
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      
      localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(updatedPlans));
      
      // TODO: Also delete from backend
      
      return {
        success: true,
        message: 'Plan deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return {
        success: false,
        message: 'Failed to delete plan'
      };
    }
  }

  /**
   * Auto-save current plan (called periodically)
   */
  enableAutoSave(plan) {
    if (plan && Object.keys(plan).length > 0) {
      this.savePlan(plan, null, true);
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(getCurrentPlan, intervalMs = 30000) {
    this.stopAutoSave(); // Clear existing interval
    
    this.autoSaveInterval = setInterval(() => {
      const currentPlan = getCurrentPlan();
      if (currentPlan && Object.keys(currentPlan).length > 0) {
        this.enableAutoSave(currentPlan);
      }
    }, intervalMs);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Restore plan on page load
   */
  restorePlan() {
    // Always try to restore the latest generated plan from localStorage first
    let plan = null;
    const currentPlanMeals = localStorage.getItem('current_meal_plan');
    if (currentPlanMeals) {
      try {
        const parsed = JSON.parse(currentPlanMeals);
        const mealsOnly = parsed && typeof parsed === 'object' && parsed.meals && typeof parsed.meals === 'object'
          ? parsed.meals
          : parsed;
        plan = {
          id: 'current',
          name: 'Latest Generated Plan',
          meals: mealsOnly,
          savedAt: new Date().toISOString(),
          isRestored: true
        };
      } catch {
        // If parsing fails, clear the invalid entry
        localStorage.removeItem('current_meal_plan');
      }
    }
    // Fallback to previous logic if not found
    if (!plan) {
      plan = this.getCurrentPlan();
    }
    if (!plan) {
      plan = this.getAutoSavedPlan();
    }
    if (!plan) {
      const savedPlans = this.getSavedPlans();
      if (savedPlans.length > 0) {
        plan = savedPlans[0]; // Most recent
      }
    }
    if (plan) {
      return {
        success: true,
        data: plan.meals,
        metadata: {
          name: plan.name,
          savedAt: plan.savedAt,
          isRestored: true
        }
      };
    }
    return {
      success: false,
      message: 'No plan to restore'
    };
  }

  /**
   * Clear all saved data
   */
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.stopAutoSave();
  }

  // Private methods

  getCurrentPlan() {
    try {
      const plan = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAN);
      return plan ? JSON.parse(plan) : null;
    } catch (error) {
      return null;
    }
  }

  getAutoSavedPlan() {
    try {
      const plan = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
      return plan ? JSON.parse(plan) : null;
    } catch (error) {
      return null;
    }
  }

  async getSavedPlan(planId) {
    const savedPlans = this.getSavedPlans();
    return savedPlans.find(plan => plan.id === planId) || null;
  }

  async addToSavedPlans(plan) {
    const savedPlans = this.getSavedPlans();
    
    // Remove existing plan with same ID if any
    const filteredPlans = savedPlans.filter(p => p.id !== plan.id);
    
    // Add new plan
    filteredPlans.unshift(plan);
    
    // Limit to max plans
    const limitedPlans = filteredPlans.slice(0, this.maxLocalPlans);
    
    localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(limitedPlans));
  }

  generatePlanSummary(plan) {
    const meals = Object.keys(plan).filter(key => 
      plan[key] && plan[key].name && !key.includes('Total')
    );
    
    let totalCalories = 0;
    if (plan.dailyTotals && plan.dailyTotals.calories) {
      totalCalories = Math.round(plan.dailyTotals.calories);
    }

    return {
      mealCount: meals.length,
      totalCalories,
      mealTypes: meals,
      hasNutrition: totalCalories > 0
    };
  }

  async syncToBackend(plan) {
    if (this.syncInProgress) return;
    
    try {
      this.syncInProgress = true;
      const token = localStorage.getItem('fitme_token');
      
      if (!token) {
        throw new Error('No authentication token');
      }

      // Convert to backend format
      const backendPlan = {
        id: plan.id,
        user_id: 'current_user', // Will be set by backend
        meals: this.convertToBackendFormat(plan.meals),
        created_at: plan.savedAt,
        preferences: {}
      };

      // Try to save to backend
      const baseUrlRaw = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';
      const baseUrl = (baseUrlRaw || '').replace(/\/$/, '');
      const apiUrl = baseUrl.includes('/api') ? `${baseUrl}/mealplan/save` : `${baseUrl}/api/mealplan/save`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backendPlan)
      });

      if (response.ok) {
        // Mark as synced
        plan.synced = true;
        this.updateSyncStatus(plan.id, true);
      }

    } catch (error) {
      console.warn('Backend sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  convertToBackendFormat(meals) {
    // Convert frontend meal format to backend format
    return {
      breakfast: meals.breakfast || null,
      lunch: meals.lunch || null,
      dinner: meals.dinner || null,
      snack: meals.snack || null,
      total_calories: meals.dailyTotals?.calories || 0,
      total_protein: meals.dailyTotals?.protein || 0,
      total_carbs: meals.dailyTotals?.carbs || 0,
      total_fat: meals.dailyTotals?.fat || 0
    };
  }

  updateSyncStatus(planId, synced) {
    try {
      const savedPlans = this.getSavedPlans();
      const updatedPlans = savedPlans.map(plan => 
        plan.id === planId ? { ...plan, synced } : plan
      );
      localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  }
}

// Create singleton instance
export const mealPlanPersistence = new MealPlanPersistence();

// Export class for testing
export { MealPlanPersistence };

export default mealPlanPersistence; 