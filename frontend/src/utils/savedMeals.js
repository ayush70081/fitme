// Utility functions for managing saved meals

const SAVED_MEALS_KEY = 'fitness_tracker_saved_meals';

export const getSavedMeals = () => {
    try {
        const saved = localStorage.getItem(SAVED_MEALS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved meals:', error);
        return [];
    }
};

export const saveMeal = (meal) => {
    try {
        const savedMeals = getSavedMeals();
        
        // Create a unique ID for the meal
        const mealToSave = {
            ...meal,
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            savedAt: new Date().toISOString(),
            savedName: meal.name || 'Unnamed Meal'
        };
        
        // Check if meal already exists (by name)
        const existingIndex = savedMeals.findIndex(saved => saved.name === meal.name);
        
        if (existingIndex >= 0) {
            // Update existing meal
            savedMeals[existingIndex] = mealToSave;
        } else {
            // Add new meal
            savedMeals.push(mealToSave);
        }
        
        localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(savedMeals));
        return mealToSave;
    } catch (error) {
        console.error('Error saving meal:', error);
        throw error;
    }
};

export const deleteSavedMeal = (mealId) => {
    try {
        const savedMeals = getSavedMeals();
        const filteredMeals = savedMeals.filter(meal => meal.id !== mealId);
        localStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(filteredMeals));
        return filteredMeals;
    } catch (error) {
        console.error('Error deleting saved meal:', error);
        throw error;
    }
};

export const clearAllSavedMeals = () => {
    try {
        localStorage.removeItem(SAVED_MEALS_KEY);
    } catch (error) {
        console.error('Error clearing saved meals:', error);
        throw error;
    }
};