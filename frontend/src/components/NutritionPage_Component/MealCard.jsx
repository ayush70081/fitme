import { useState } from "react";
import { FiBookmark, FiTrash2 } from 'react-icons/fi';

const MealCard = ({ meal, mealType, onMealClick, onAddToRoutine, onDeleteMeal, showDeleteButton = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteMeal = (e) => {
    e.stopPropagation();
    if (onDeleteMeal && mealType) {
      onDeleteMeal(mealType);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${
        isHovered ? "-translate-y-0.5 shadow-md" : ""
      } ${!meal?.name ? "border-2 border-dashed border-gray-200" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => meal?.name && onMealClick(meal, mealType)}
    >
      {/* No overlay button now; delete is inline in header for better layout */}
      <div className="p-4 h-[260px] flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600 capitalize">
            {mealType.split('_')[0]}
            {mealType.includes('_') && ` ${mealType.split('_')[1]}`}
          </h3>
          <div className="flex items-center gap-2">
            {meal?.name && onAddToRoutine && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToRoutine(meal, mealType); }}
                className="p-1 px-3 text-[11px] font-semibold rounded-full bg-black text-white shadow hover:bg-black transition-colors duration-200 whitespace-nowrap"
                title="Add this meal to your Daily Routine"
              >
                + Add to Routine
              </button>
            )}
            {meal?.name && onDeleteMeal && (
              <button
                onClick={handleDeleteMeal}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-gray-400 hover:text-red-600 p-1"
                title="Remove this meal"
                aria-label="Delete meal"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main content (clamped for uniform height) */}
        <div className="mt-1.5 flex-1 min-h-0 flex flex-col">
          <h4
            className={`text-xl font-bold break-words line-clamp-2 ${
              meal?.name ? "text-gray-900" : "text-gray-400 italic"
            }`}
          >
            {meal?.name || "No meal planned"}
          </h4>

          {meal?.ingredients ? (
            <p className="mt-2 text-gray-700 text-sm line-clamp-2">
              {meal.ingredients.slice(0, 5).join(", ")}
              {meal.ingredients.length > 5 ? "…" : ""}
            </p>
          ) : (
            <p className="mt-2 text-gray-400 italic">Click to add details</p>
          )}

          {/* Footer section pinned to bottom for consistency */}
          <div className="mt-auto pt-3">
            {meal?.nutrition && (
              <div className="flex flex-wrap items-center gap-1.5">
                {(meal?.calories || meal?.nutrition?.calories) && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-900 rounded">{Math.round(meal?.nutrition?.calories || meal?.calories || 0)} kcal</span>
                )}
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-900 rounded">P: {Math.round(meal.nutrition.protein)}g</span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-900 rounded">C: {Math.round(meal.nutrition.carbs)}g</span>
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-900 rounded">F: {Math.round(meal.nutrition.fat)}g</span>
              </div>
            )}
            {(meal?.prepTime || meal?.cookTime) && (
              <div className="mt-2 flex gap-3 text-xs text-gray-500">
                {meal.prepTime && <span className="whitespace-nowrap">⏱️ Prep: {meal.prepTime}min</span>}
                {meal.cookTime && <span className="whitespace-nowrap">🔥 Cook: {meal.cookTime}min</span>}
              </div>
            )}
          </div>
        </div>
      </div>
      {meal?.name && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
      )}
    </div>
  );
};

export default MealCard;
