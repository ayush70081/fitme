import { useState, useEffect } from 'react';
import { FiX, FiBookmark } from 'react-icons/fi';
import { getSavedMeals, deleteSavedMeal } from '../../utils/savedMeals';
import MealCard from './MealCard';

const SavedMealsModal = ({ isOpen, onClose, onSelectMeal }) => {
    const [savedMeals, setSavedMeals] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSavedMeals(getSavedMeals());
        }
    }, [isOpen]);

    const handleDeleteMeal = (mealId) => {
        try {
            const updatedMeals = deleteSavedMeal(mealId);
            setSavedMeals(updatedMeals);
        } catch (error) {
            alert('Error deleting meal. Please try again.');
        }
    };

    const handleSelectMeal = (meal, mealType) => {
        // Remove the saved meal specific properties
        const cleanMeal = {
            name: meal.name,
            ingredients: meal.ingredients,
            recipe: meal.recipe,
            nutrition: meal.nutrition,
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            calories: meal.calories
        };
        onSelectMeal(cleanMeal);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-2">
                        <FiBookmark className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-900">Saved Meals</h2>
                        <span className="text-sm text-gray-500">({savedMeals.length} meals)</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {savedMeals.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiBookmark className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No saved meals yet</h3>
                            <p className="text-gray-500">Save your favorite meals to reuse them later</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedMeals.map((meal) => (
                                <MealCard
                                    key={meal.id}
                                    meal={meal}
                                    mealType="Saved Meal"
                                    onMealClick={handleSelectMeal}
                                    showSaveButton={false}
                                    showDeleteButton={true}
                                    onDeleteMeal={handleDeleteMeal}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Click on any meal to add it to your current day
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedMealsModal;