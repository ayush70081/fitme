import { useState } from "react";
import { FiBookmark, FiTrash2 } from 'react-icons/fi';

const MealCard = ({ meal, mealType, onMealClick, onAddToRoutine, showDeleteButton = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteMeal = (e) => {
    e.stopPropagation();
    if (onDeleteMeal && meal?.id) {
      onDeleteMeal(meal.id);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
        isHovered ? "transform -translate-y-1 shadow-lg" : ""
      } ${!meal?.name ? "border-2 border-dashed border-gray-200" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => meal?.name && onMealClick(meal, mealType)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{mealType}</h3>
          <div className="flex items-center gap-2">
            {(meal?.calories || meal?.nutrition?.calories) && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {Math.round(meal?.nutrition?.calories || meal?.calories || 0)} kcal
              </span>
            )}
            {meal?.name && onAddToRoutine && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToRoutine(meal, mealType); }}
                className="p-1 px-3 text-xs font-semibold rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white shadow hover:from-blue-500 hover:to-green-400 transition-colors duration-200"
                title="Add this meal to your Daily Routine"
              >
                + Add to Routine
              </button>
            )}
            {showDeleteButton && meal?.id && (
              <button
                onClick={handleDeleteMeal}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete saved meal"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <h4
            className={`text-xl font-bold ${
              meal?.name ? "text-gray-900" : "text-gray-400 italic"
            }`}
          >
            {meal?.name || "No meal planned"}
          </h4>
          {meal?.ingredients ? (
            <div>
              <p className="mt-2 text-gray-600 line-clamp-2">
                {meal.ingredients.slice(0, 3).join(", ")}
                {meal.ingredients.length > 3 ? "..." : ""}
              </p>
              {meal.instructions && meal.instructions.length > 0 && (
                <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
                  {meal.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              )}
              {meal?.nutrition && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    P: {Math.round(meal.nutrition.protein)}g
                  </span>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    C: {Math.round(meal.nutrition.carbs)}g
                  </span>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    F: {Math.round(meal.nutrition.fat)}g
                  </span>
                </div>
              )}
              {(meal?.prepTime || meal?.cookTime) && (
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  {meal.prepTime && <span>⏱️ Prep: {meal.prepTime}min</span>}
                  {meal.cookTime && <span>🔥 Cook: {meal.cookTime}min</span>}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2 text-gray-400 italic">Click to add details</p>
          )}
        </div>
      </div>
      {meal?.name && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      )}
    </div>
  );
};

export default MealCard;
