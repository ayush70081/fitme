import { useState } from 'react';

const AddMealModal = ({ isOpen, onClose, onSave }) => {
    const [mealName, setMealName] = useState('');
    const [mealType, setMealType] = useState('Snack');
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState('');
    const [calories, setCalories] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name: mealName,
            ingredients: ingredients.split('\n').filter(i => i.trim() !== ''),
            recipe: recipe,
            calories: calories || '--'
        }, mealType);
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setMealName('');
        setMealType('Snack');
        setIngredients('');
        setRecipe('');
        setCalories('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-green-50 bg-opacity-50 flex items-center justify-center m-2 p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={mealType}
                                onChange={(e) => setMealType(e.target.value)}
                                required
                            >
                                <option value="Snack">Snack</option>
                                <option value="Brunch">Brunch</option>
                                <option value="Dessert">Dessert</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="mealName">
                                Meal Name
                            </label>
                            <input
                                id="mealName"
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="calories">
                                Calories (optional)
                            </label>
                            <input
                                id="calories"
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={calories}
                                onChange={(e) => setCalories(e.target.value)}
                                placeholder="Estimated calories"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="ingredients">
                                Ingredients (one per line)
                            </label>
                            <textarea
                                id="ingredients"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="recipe">
                                Recipe Instructions
                            </label>
                            <textarea
                                id="recipe"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={recipe}
                                onChange={(e) => setRecipe(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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