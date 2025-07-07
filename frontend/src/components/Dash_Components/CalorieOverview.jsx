import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

const ProgressBar = ({ label, value, max, suffix }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex-1 text-center">
      <h4 className="text-xs font-medium text-gray-700">{label}</h4>
      <div className="h-1 w-full bg-gray-300 rounded-full my-1">
        <div
          className="h-1 bg-black rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500">{`${max - value}${suffix} left`}</p>
    </div>
  );
};

const CalorieOverview = ({ caloriesBurned = 0 }) => {
  // Get today's nutrition progress from cumulative data
  const getTodaysNutrition = () => {
    try {
      const nutritionData = JSON.parse(localStorage.getItem('cumulativeNutrition') || '{}');
      const today = new Date().toISOString().slice(0, 10);
      
      if (nutritionData[today]) {
        return {
          calories: nutritionData[today].calories || 0,
          protein: nutritionData[today].protein || 0,
          carbs: nutritionData[today].carbs || 0,
          fat: nutritionData[today].fat || 0
        };
      }
      
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    } catch (error) {
      console.error('Error getting today\'s nutrition:', error);
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
  };

  const [todaysNutrition, setTodaysNutrition] = useState(getTodaysNutrition());

  // Listen for nutrition updates
  useEffect(() => {
    const updateTodaysNutrition = () => {
      setTodaysNutrition(getTodaysNutrition());
    };

    // Initial load
    updateTodaysNutrition();

    // Listen for nutrition data updates
    window.addEventListener('nutritionDataUpdated', updateTodaysNutrition);
    window.addEventListener('storage', updateTodaysNutrition);
    window.addEventListener('dailyTasksUpdated', updateTodaysNutrition);

    return () => {
      window.removeEventListener('nutritionDataUpdated', updateTodaysNutrition);
      window.removeEventListener('storage', updateTodaysNutrition);
      window.removeEventListener('dailyTasksUpdated', updateTodaysNutrition);
    };
  }, []);

  const eaten = todaysNutrition.calories;
  const burned = caloriesBurned;
  const total = 2200; // Daily calorie goal (could be made configurable)
  const left = total - eaten + burned;

  const carbs = todaysNutrition.carbs;
  const protein = todaysNutrition.protein;
  const fat = todaysNutrition.fat;

  const radius = 60;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.min((left / total) * circumference, circumference);

  return (
    <div className="w-full bg-white rounded-2xl shadow-md font-sans p-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-black mb-2">Calories</h2>

      {/* Subcard */}
      <div className="bg-pink-200 rounded-2xl p-4 space-y-3">
        {/* Circular progress bar */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 150 150"
              className="transform -rotate-90"
            >
              <circle
                stroke="#E5E7EB"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx="75"
                cy="75"
              />
              <circle
                stroke="#ec4899"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="75"
                cy="75"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold">{left}</p>
              <p className="text-xs text-gray-700">kcal left</p>
            </div>
          </div>
        </div>

        {/* Eaten & Burned */}
        <div className="flex justify-evenly text-sm gap-8">
  {/* Eaten */}
  <div className="border-l-4 border-black pl-3">
    <p className="font-medium text-gray-700 text-left">Eaten</p>
    <div className="flex items-center justify-center font-semibold text-black text-sm mt-1">
      <Flame className="w-4 h-4 mr-1" /> {eaten}
      <span className="ml-1 text-xs text-gray-600">kcal</span>
    </div>
  </div>

  {/* Burned */}
  <div className="border-l-4 border-black pl-3">
    <p className="font-medium text-gray-700 text-left">Burned</p>
    <div className="flex items-center justify-center font-semibold text-black text-sm mt-1">
      <Flame className="w-4 h-4 mr-1" /> {burned}
      <span className="ml-1 text-xs text-gray-600">kcal</span>
    </div>
  </div>
</div>


        {/* Divider */}
        <div className="border-t border-white" />

        {/* Macros Progress */}
        <div className="flex gap-3">
          <ProgressBar label="Carbs" value={Math.round(carbs)} max={275} suffix="g" />
          <ProgressBar label="Protein" value={Math.round(protein)} max={110} suffix="g" />
          <ProgressBar label="Fat" value={Math.round(fat)} max={73} suffix="g" />
        </div>
      </div>
    </div>
  );
};

export default CalorieOverview;
