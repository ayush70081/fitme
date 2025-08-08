import { useState } from 'react';

const AddMealModal = ({ isOpen, onClose, onSave }) => {
    const [mealName, setMealName] = useState('');
    const [mealType, setMealType] = useState('breakfast');
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: mealName,
            ingredients: ingredients.split('\n').filter(i => i.trim() !== ''),
            recipe: recipe.split('\n').filter(i => i.trim() !== ''), // Convert to array like AI meals
            instructions: recipe.split('\n').filter(i => i.trim() !== ''), // Also add as instructions
            nutrition: { 
                calories: Number(calories) || 0,
                protein: Number(protein) || 0,
                carbs: Number(carbs) || 0,
                fat: Number(fat) || 0
            },
            prepTime: 15, // Default prep time
            description: '',
            cuisineType: '',
            difficulty: 'easy',
            portionSize: 'serves 1'
        }, mealType);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setMealName('');
        setMealType('breakfast');
        setIngredients('');
        setRecipe('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#F5EFE6]/40 backdrop-blur-sm flex items-center justify-center m-2 p-4 z-50">
            <div className="bg-[#FFF8ED] rounded-xl max-w-md w-full border border-[#EADFD0]">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Add New Meal</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="mealType">
                                Meal Type
                            </label>
                            <select
                                id="mealType"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                required
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                                <option value="brunch">Brunch</option>
                                <option value="dessert">Dessert</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="mealName">
                                Meal Name
                            </label>
                            <input
                                id="mealName"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Nutrition Info (optional)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <input
                                        id="calories"
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                        value={calories}
                                        onChange={(e) => setCalories(e.target.value)}
                                        placeholder="Calories"
                                    />
                                </div>
                                <div>
                                    <input
                                        id="protein"
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                        value={protein}
                                        onChange={(e) => setProtein(e.target.value)}
                                        placeholder="Protein (g)"
                                    />
                                </div>
                                <div>
                                    <input
                                        id="carbs"
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                        value={carbs}
                                        onChange={(e) => setCarbs(e.target.value)}
                                        placeholder="Carbs (g)"
                                    />
                                </div>
                                <div>
                                    <input
                                        id="fat"
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                        value={fat}
                                        onChange={(e) => setFat(e.target.value)}
                                        placeholder="Fat (g)"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="ingredients">
                                Ingredients (one per line)
                            </label>
                            <textarea
                                id="ingredients"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="recipe">
                                Recipe Instructions
                            </label>
                            <textarea
                                id="recipe"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                                value={recipe}
                                onChange={(e) => setRecipe(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Add Meal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMealModal;