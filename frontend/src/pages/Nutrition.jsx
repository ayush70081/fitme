import { useState, useEffect } from 'react';
import { FiBookmark, FiTarget, FiTrendingUp, FiClock } from 'react-icons/fi';
import DayPlan from '../components/NutritionPage_Component/DayPlan';
import RecipeModal from '../components/NutritionPage_Component/RecipeModal';
import AddMealModal from '../components/NutritionPage_Component/AddMealModal';
import DailyMealPlanGenerator from '../components/DailyMealPlanGenerator';
import { useToast } from '../hooks/useToast';
import userStorage from '../utils/userScopedStorage';
import mealPlanPersistence from '../services/mealPlanPersistence';

const Nutrition = () => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [currentPlan, setCurrentPlan] = useState({});
    const [showAddMealModal, setShowAddMealModal] = useState(false);
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
        // Build updated plan deterministically, then persist immediately
        setCurrentPlan(prev => {
            const baseType = mealType.toLowerCase();
            let updatedPlan;

            if (!prev[baseType] || !prev[baseType]?.name) {
                updatedPlan = { ...prev, [baseType]: meal };
            } else {
                let index = 2;
                let newKey = `${baseType}_${index}`;
                while (prev[newKey]?.name) {
                    index += 1;
                    newKey = `${baseType}_${index}`;
                }
                updatedPlan = { ...prev, [newKey]: meal };
            }

            // Persist immediately so refresh keeps manual meals without explicit save
            try { mealPlanPersistence.savePlan(updatedPlan, null, true); } catch {}
            return updatedPlan;
        });
        showToast('success', 'Meal added successfully!');
    };

    const handleDailyPlanGenerated = (dayPlan) => {

        // When AI generates a plan, it replaces the current plan
        // But we should preserve manually added meals if they exist
        setCurrentPlan(dayPlan);
    };

    const handleCloseModal = () => {
        setSelectedRecipe(null);
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
        protein: Math.round(routineModalMeal.nutrition?.protein || 0),
        carbs: Math.round(routineModalMeal.nutrition?.carbs || 0),
        fat: Math.round(routineModalMeal.nutrition?.fat || 0),
        completed: false,
        color: "bg-gray-100",
        addedTime: new Date(),
      };
      // Get current date and tasks from localStorage in {date, tasks} format
      const today = new Date().toISOString().slice(0, 10);
      let parsed = { date: today, tasks: [] };
      try {
        const saved = userStorage.getItem("dailyTasks");
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
      userStorage.setItem("dailyTasks", JSON.stringify(parsed));
      setShowRoutineModal(false);
      setRoutineModalMeal(null);
      setRoutineModalMealType(null);
      setRoutineSelectedTime("07:00");
      showToast('success', 'Meal added to Daily Routine!');
      window.dispatchEvent(new Event('dailyTasksUpdated'));
    };

    // Calculate daily stats
    const getDailyStats = () => {
        let totalCalories = 0;
        Object.values(currentPlan).forEach(meal => {
            if (meal?.name && meal?.nutrition?.calories) {
                totalCalories += meal.nutrition.calories;
            }
        });
        return { totalCalories };
    };

    const { totalCalories } = getDailyStats();

    // Aggregate macros for sidebar summary (display-only)
    const getMacroTotals = () => {
        let p = 0, c = 0, f = 0;
        Object.values(currentPlan).forEach(meal => {
            if (meal?.nutrition) {
                p += Number(meal.nutrition.protein || 0);
                c += Number(meal.nutrition.carbs || 0);
                f += Number(meal.nutrition.fat || 0);
            }
        });
        return { p: Math.round(p), c: Math.round(c), f: Math.round(f) };
    };
    const { p: totalProtein, c: totalCarbs, f: totalFat } = getMacroTotals();

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <header className="mb-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-bold text-gray-900">Smart Meal Planner</h1>
                        <p className="text-sm text-gray-600">Plan a beautiful, simple day of eating with AI.
                        </p>
                    </div>
                </header>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-8">
                <DailyMealPlanGenerator 
                    onPlanGenerated={handleDailyPlanGenerated}
                    currentDayPlan={currentPlan}
                />
                
                <DayPlan 
                    day="Today"
                    meals={currentPlan}
                    onMealClick={handleMealClick}
                    onAddMealClick={handleAddMealClick}
                    onAddToRoutine={handleAddToRoutine}
                />
                    </div>

                    {/* Sidebar summary */}
                    <aside className="lg:sticky lg:top-6 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Today's Overview</h3>
                                <FiTrendingUp className="w-5 h-5 text-gray-900" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Planned meals</span>
                                    <span className="text-sm font-semibold text-gray-900">{Object.values(currentPlan).filter(m => m?.name).length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Estimated calories</span>
                                    <span className="text-sm font-semibold text-gray-900">{totalCalories > 0 ? Math.round(totalCalories) : '—'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <div className="rounded-md bg-gray-50 border border-gray-200 p-2 text-center">
                                        <div className="text-xs text-gray-600">Protein</div>
                                        <div className="text-sm font-semibold text-gray-900">{totalProtein}g</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 border border-gray-200 p-2 text-center">
                                        <div className="text-xs text-gray-600">Carbs</div>
                                        <div className="text-sm font-semibold text-gray-900">{totalCarbs}g</div>
                                    </div>
                                    <div className="rounded-md bg-gray-50 border border-gray-200 p-2 text-center">
                                        <div className="text-xs text-gray-600">Fat</div>
                                        <div className="text-sm font-semibold text-gray-900">{totalFat}g</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">Tips</h3>
                            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                                <li>Keep meals simple and balanced.</li>
                                <li>Prep ingredients once; reuse across meals.</li>
                                <li>Protein with every main meal helps satiety.</li>
                            </ul>
                        </div>
                    </aside>
                </div>

                {/* Modals */}
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

                {showRoutineModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900"><FiClock className="text-gray-900" />Add to Daily Routine</h3>
                      <p className="mb-2 text-gray-700">Select a time for <span className="font-semibold text-gray-900">{routineModalMeal?.name}</span> ({routineModalMealType})</p>
                      <div className="mb-4 flex flex-col items-center">
                        <input
                          type="time"
                          value={routineSelectedTime}
                          onChange={e => setRoutineSelectedTime(e.target.value)}
                          className="w-40 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000] text-lg text-center border-gray-300"
                        />
                        <span className="mt-2 text-gray-500 text-sm">Selected: <span className="font-semibold text-gray-900">{formatTime(routineSelectedTime)}</span></span>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleRoutineModalConfirm}
                          className="flex-1 bg-black text-white py-2 rounded-lg font-semibold shadow transition-all hover:bg-black"
                        >
                          Add to Routine
                        </button>
                        <button
                          onClick={() => setShowRoutineModal(false)}
                          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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

