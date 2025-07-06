import MealCard from './MealCard';
import { FiPlus } from 'react-icons/fi';

const DayPlan = ({ day, meals, onMealClick, onAddMealClick, onAddToRoutine }) => {
    // Only show meals that actually have data (name exists)
    const actualMeals = Object.entries(meals).filter(([mealType, meal]) => meal && meal.name);
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{day}</h2>
                <p className="text-blue-100 text-sm">
                    {actualMeals.length > 0 ? `${actualMeals.length} meal${actualMeals.length > 1 ? 's' : ''} planned` : 'Ready for planning'}
                </p>
            </div>
            
            <div className="p-6">
                {actualMeals.length === 0 ? (
                    // Enhanced empty state
                    <div className="text-center py-16">
                        <div className="relative mx-auto mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-sm">🍽️</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No meals planned for {day}</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Start planning your {day} meals! Use AI to generate a complete daily plan or add meals manually.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onClick={() => onAddMealClick(day)}
                                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                <FiPlus className="w-4 h-4 mr-2" />
                                Add Manual Meal
                            </button>
                        </div>
                    </div>
                ) : (
                    // Enhanced meal cards grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {actualMeals.map(([mealType, meal]) => (
                            <MealCard 
                                key={mealType} 
                                mealType={mealType} 
                                meal={meal} 
                                onMealClick={(meal, type) => onMealClick(day, type, meal)}
                                onAddToRoutine={onAddToRoutine ? (meal, type) => onAddToRoutine(meal, type) : undefined}
                            />
                        ))}
                        
                        {/* Add meal button - only show if less than 6 meals */}
                        {actualMeals.length < 6 && (
                            <button 
                                onClick={() => onAddMealClick(day)}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group min-h-[200px]"
                            >
                                <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-3 transition-colors">
                                    <FiPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-gray-500 group-hover:text-blue-600 font-medium transition-colors">Add Another Meal</span>
                                <span className="text-xs text-gray-400 mt-1">Snack, dessert, etc.</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayPlan;
