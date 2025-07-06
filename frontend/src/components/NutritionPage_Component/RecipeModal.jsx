const RecipeModal = ({ day, mealType, meal, onClose }) => {
    if (!meal || !meal.name) return null;

    // Safely handle ingredients - could be array or string
    const getIngredients = () => {
        if (!meal.ingredients) return ['No ingredients listed'];
        if (Array.isArray(meal.ingredients)) return meal.ingredients;
        if (typeof meal.ingredients === 'string') {
            return meal.ingredients.split('\n').filter(item => item.trim());
        }
        return ['No ingredients listed'];
    };

    // Safely handle recipe - could be string or array
    const getRecipeSteps = () => {
        if (!meal.recipe) return ['No recipe instructions available'];
        if (typeof meal.recipe === 'string') {
            // Split by numbered steps or periods
            const steps = meal.recipe.split(/\d+\.\s*|\.\s+/).filter(step => step.trim());
            return steps.length > 0 ? steps : [meal.recipe];
        }
        if (Array.isArray(meal.recipe)) return meal.recipe;
        return ['No recipe instructions available'];
    };

    const ingredients = getIngredients();
    const recipeSteps = getRecipeSteps();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{meal.name || 'Unnamed Meal'}</h2>
                            <p className="text-gray-600">{day} • {mealType}</p>
                            {(meal.nutrition?.calories || meal.calories) && (
                                <p className="text-sm text-blue-600 mt-1">
                                    {Math.round(meal.nutrition?.calories || meal.calories)} calories
                                </p>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Nutrition Info */}
                    {meal.nutrition && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Nutrition Information</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{Math.round(meal.nutrition.calories || 0)}</div>
                                    <div className="text-sm text-gray-600">Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{Math.round(meal.nutrition.protein || 0)}g</div>
                                    <div className="text-sm text-gray-600">Protein</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{Math.round(meal.nutrition.carbs || 0)}g</div>
                                    <div className="text-sm text-gray-600">Carbs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{Math.round(meal.nutrition.fat || 0)}g</div>
                                    <div className="text-sm text-gray-600">Fat</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timing Info */}
                    {(meal.prepTime || meal.cookTime) && (
                        <div className="mb-6 flex gap-4 text-sm text-gray-600">
                            {meal.prepTime && (
                                <span className="flex items-center">
                                    ⏱️ Prep: {meal.prepTime} min
                                </span>
                            )}
                            {meal.cookTime && (
                                <span className="flex items-center">
                                    🔥 Cook: {meal.cookTime} min
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Ingredients */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredients</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {ingredients.map((ingredient, index) => (
                                <li key={index} className="text-gray-700">{ingredient}</li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Recipe Steps */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Instructions</h3>
                        <div className="space-y-3">
                            {recipeSteps.map((step, index) => (
                                step.trim() && (
                                    <div key={index} className="flex gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <p className="text-gray-700 flex-1">{step.trim()}</p>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeModal;