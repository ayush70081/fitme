import { useState, useEffect } from 'react';
import { FiBookmark, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi';
import DayPlan from '../components/NutritionPage_Component/DayPlan';
import RecipeModal from '../components/NutritionPage_Component/RecipeModal';
import AddMealModal from '../components/NutritionPage_Component/AddMealModal';
import SavedMealsModal from '../components/NutritionPage_Component/SavedMealsModal';
import DailyMealPlanGenerator from '../components/DailyMealPlanGenerator';
import { useToast } from '../hooks/useToast';

const Nutrition = () => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [currentPlan, setCurrentPlan] = useState({});
    const [showAddMealModal, setShowAddMealModal] = useState(false);
    const [showSavedMealsModal, setShowSavedMealsModal] = useState(false);
    const [selectedMealTypeForSaved, setSelectedMealTypeForSaved] = useState(null);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [routineModalMeal, setRoutineModalMeal] = useState(null);
    const [routineModalMealType, setRoutineModalMealType] = useState(null);
    const [routineSelectedTime, setRoutineSelectedTime] = useState("07:00");
    const { showToast } = useToast();

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

    // Add to Routine logic
    const handleAddToRoutine = (meal, mealType) => {
      setRoutineModalMeal(meal);
      setRoutineModalMealType(mealType);
      setRoutineSelectedTime("07:00");
      setShowRoutineModal(true);
    };

    // Helper to format time as h:mm AM/PM
    const formatTime = (time24) => {
      if (!time24) return '';
      const [hourStr, minuteStr] = time24.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = minuteStr;
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minute} ${ampm}`;
    };

    const handleRoutineModalConfirm = () => {
      if (!routineModalMeal || !routineSelectedTime) return;
      // Prepare the task object
      const task = {
        time: formatTime(routineSelectedTime),
        category: routineModalMealType.charAt(0).toUpperCase() + routineModalMealType.slice(1),
        name: routineModalMeal.name,
        calories: Math.round(routineModalMeal.nutrition?.calories || routineModalMeal.calories || 0),
        completed: false,
        color: "bg-blue-100",
        addedTime: new Date(),
      };
      // Get current date and tasks from localStorage in {date, tasks} format
      const today = new Date().toISOString().slice(0, 10);
      let parsed = { date: today, tasks: [] };
      try {
        const saved = localStorage.getItem("dailyTasks");
        if (saved) {
          parsed = JSON.parse(saved);
          if (parsed.date !== today) {
            parsed = { date: today, tasks: [] };
          }
        }
      } catch {
        parsed = { date: today, tasks: [] };
      }
      // Remove any existing task at the same time
      parsed.tasks = parsed.tasks.filter(t => t.time !== task.time);
      // Add new task
      parsed.tasks.push(task);
      localStorage.setItem("dailyTasks", JSON.stringify(parsed));
      setShowRoutineModal(false);
      setRoutineModalMeal(null);
      setRoutineModalMealType(null);
      setRoutineSelectedTime("07:00");
      showToast('success', 'Meal added to Daily Routine!');
      window.dispatchEvent(new Event('storage'));
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
                    onAddToRoutine={handleAddToRoutine}
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

                {/* Routine Modal */}
                {showRoutineModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[6px]">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in border-2" style={{ borderColor: '#db2777' }}>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#db2777' }}><FiClock style={{ color: '#ec4899' }} />Add to Daily Routine</h3>
                      <p className="mb-2 text-gray-600">Select a time for <span className="font-semibold" style={{ color: '#db2777' }}>{routineModalMeal?.name}</span> ({routineModalMealType})</p>
                      <div className="mb-4 flex flex-col items-center">
                        <input
                          type="time"
                          value={routineSelectedTime}
                          onChange={e => setRoutineSelectedTime(e.target.value)}
                          className="w-40 p-2 border-2 rounded-lg focus:outline-none focus:ring-2 text-lg text-center"
                          style={{ borderColor: '#db2777', boxShadow: '0 0 0 2px #fbcfe8' }}
                        />
                        <span className="mt-2 text-gray-500 text-sm">Selected: <span className="font-semibold">{formatTime(routineSelectedTime)}</span></span>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleRoutineModalConfirm}
                          className="flex-1 text-white py-2 rounded-lg font-semibold shadow transition-all"
                          style={{ backgroundColor: '#ec4899' }}
                        >
                          Add to Routine
                        </button>
                        <button
                          onClick={() => setShowRoutineModal(false)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </div>
    );
};

export default Nutrition;