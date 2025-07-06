// Utility functions for managing saved daily meal plans

const SAVED_DAILY_PLANS_KEY = 'fitness_tracker_saved_daily_plans';

export const getSavedDailyPlans = () => {
    try {
        const saved = localStorage.getItem(SAVED_DAILY_PLANS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved daily plans:', error);
        return [];
    }
};

export const saveDailyPlan = (dailyPlan) => {
    try {
        const savedPlans = getSavedDailyPlans();
        
        // Create a daily plan object
        const planToSave = {
            ...dailyPlan,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            savedAt: new Date().toISOString()
        };
        
        // Add to the beginning of the array (most recent first)
        savedPlans.unshift(planToSave);
        
        // Keep only the last 20 plans to avoid storage bloat
        const trimmedPlans = savedPlans.slice(0, 20);
        
        localStorage.setItem(SAVED_DAILY_PLANS_KEY, JSON.stringify(trimmedPlans));
        return planToSave;
    } catch (error) {
        console.error('Error saving daily plan:', error);
        throw error;
    }
};

export const deleteSavedDailyPlan = (planId) => {
    try {
        const savedPlans = getSavedDailyPlans();
        const filteredPlans = savedPlans.filter(plan => plan.id !== planId);
        localStorage.setItem(SAVED_DAILY_PLANS_KEY, JSON.stringify(filteredPlans));
        return filteredPlans;
    } catch (error) {
        console.error('Error deleting saved daily plan:', error);
        throw error;
    }
};

export const clearAllSavedDailyPlans = () => {
    try {
        localStorage.removeItem(SAVED_DAILY_PLANS_KEY);
    } catch (error) {
        console.error('Error clearing saved daily plans:', error);
        throw error;
    }
};