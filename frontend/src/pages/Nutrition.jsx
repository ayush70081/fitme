import { useState, useEffect } from 'react';
import { FiBookmark, FiTarget, FiTrendingUp } from 'react-icons/fi';
import DayPlan from '../components/NutritionPage_Component/DayPlan';
import RecipeModal from '../components/NutritionPage_Component/RecipeModal';
import AddMealModal from '../components/NutritionPage_Component/AddMealModal';
import SavedMealsModal from '../components/NutritionPage_Component/SavedMealsModal';
import DailyMealPlanGenerator from '../components/DailyMealPlanGenerator';

const Nutrition = () => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [currentPlan, setCurrentPlan] = useState({});
    const [showAddMealModal, setShowAddMealModal] = useState(false);
    const [showSavedMealsModal, setShowSavedMealsModal] = useState(false);
    const [selectedMealTypeForSaved, setSelectedMealTypeForSaved] = useState(null);

    const handleMealClick = (day, mealType, meal) => {
        if (!meal?.name) return;
        setSelectedRecipe({ mealType, meal });
    };

    const handleAddMealClick = () => {
        setShowAddMealModal(true);
    };

    const handleSaveMeal = (meal, mealType) => {
        setCurrentPlan(prev => ({
            ...prev,
            [mealType]: meal
        }));
    };

    const handleDailyPlanGenerated = (dayPlan) => {
        setCurrentPlan(dayPlan);
    };

    const handleCloseModal = () => {
        setSelectedRecipe(null);
    };

    const handleShowSavedMeals = (mealType = null) => {
        setSelectedMealTypeForSaved(mealType);
        setShowSavedMealsModal(true);
    };

    const handleSelectSavedMeal = (meal) => {
        if (selectedMealTypeForSaved) {
            // Add to specific meal type
            setCurrentPlan(prev => ({
                ...prev,
                    [selectedMealTypeForSaved]: meal
            }));
        } else {
            // Let user choose meal type
            setShowAddMealModal(true);
            // Store the selected meal for the AddMealModal
            setSelectedRecipe({ meal });
        }
    };

    // Calculate daily stats
    const getDailyStats = () => {
        let totalMeals = 0;
        let totalCalories = 0;
            
        Object.values(currentPlan).forEach(meal => {
            if (meal?.name) {
                totalMeals++;
                if (meal?.nutrition?.calories) {
                    totalCalories += meal.nutrition.calories;
                }
            }
        });

        return { totalMeals, totalCalories };
    };

    const { totalMeals, totalCalories } = getDailyStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Modern Header */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                🍽️ Smart Meal Planner
                            </h1>
                            <p className="text-lg text-gray-600">
                                AI-powered daily meal planning made simple and affordable
                            </p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <FiTarget className="w-5 h-5 text-green-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Meals</p>
                                        <p className="text-lg font-semibold text-gray-900">{totalMeals}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {totalCalories > 0 && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <FiTrendingUp className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Daily Cal</p>
                                            <p className="text-lg font-semibold text-gray-900">{Math.round(totalCalories)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Quick Actions */}
                <div className="mb-8 flex flex-wrap gap-3">
                    <button
                        onClick={() => handleShowSavedMeals()}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                    >
                        <FiBookmark className="w-4 h-4 mr-2" />
                        Saved Meals
                    </button>
                </div>

                {/* Daily AI Meal Plan Generator */}
                <DailyMealPlanGenerator 
                    onPlanGenerated={handleDailyPlanGenerated}
                    currentDayPlan={currentPlan}
                />
                
                {/* Daily Plan */}
                <DayPlan 
                    day="Today"
                    meals={currentPlan}
                    onMealClick={handleMealClick}
                    onAddMealClick={handleAddMealClick}
                />
                
                {selectedRecipe && (
                    <RecipeModal 
                        mealType={selectedRecipe.mealType}
                        meal={selectedRecipe.meal}
                        onClose={handleCloseModal}
                    />
                )}
                
                <AddMealModal 
                    isOpen={showAddMealModal}
                    onClose={() => setShowAddMealModal(false)}
                    onSave={handleSaveMeal}
                />

                <SavedMealsModal
                    isOpen={showSavedMealsModal}
                    onClose={() => setShowSavedMealsModal(false)}
                    onSelectMeal={handleSelectSavedMeal}
                />
            </div>
        </div>
    );
};

export default Nutrition;