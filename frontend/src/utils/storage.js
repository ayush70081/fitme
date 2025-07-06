export const saveMealPlans = (plans) => {
    try {
        const item = {
            data: plans,
            expiry: new Date().getTime() + 12 * 60 * 60 * 1000 // 12 hours from now
        };
        localStorage.setItem('mealPlans', JSON.stringify(item));
    } catch (error) {
        console.error('Error saving meal plans:', error);
    }
};

export const loadMealPlans = () => {
    try {
        const itemStr = localStorage.getItem('mealPlans');
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        const now = new Date().getTime();
        
        if (now > item.expiry) {
            localStorage.removeItem('mealPlans');
            return null;
        }
        
        return item.data;
    } catch (error) {
        console.error('Error loading meal plans:', error);
        return null;
    }
};

export const mergePlans = (staticPlans, savedPlans) => {
    if (!savedPlans) return JSON.parse(JSON.stringify(staticPlans));
    
    // Create a deep copy of static plans
    const merged = JSON.parse(JSON.stringify(staticPlans));
    
    // Override with saved plans where they exist
    for (const day in savedPlans) {
        if (savedPlans[day]) {
            merged[day] = merged[day] || {};
            for (const mealType in savedPlans[day]) {
                if (savedPlans[day][mealType]) {
                    merged[day][mealType] = savedPlans[day][mealType];
                }
            }
        }
    }
    
    return merged;
};