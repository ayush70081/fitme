import MealCard from './MealCard';
import { FiPlus } from 'react-icons/fi';

const DayPlan = ({ day, meals, onMealClick, onAddMealClick, onAddToRoutine }) => {

    
    // Filter out non-meal properties (like dailyTotals) and only show meals that actually have data (name exists)
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'brunch', 'dessert', 'other'];
    // Build a sorted list so base types come first, then suffixed ones, preserving insertion order for extras
    const actualMeals = Object.entries(meals).filter(([mealType, meal]) => {
        // Skip non-meal properties
        if (mealType === 'dailyTotals') return false;
        // Only include meals that have actual data (name exists)
        if (!meal || !meal.name) return false;
        // Include all meals that have a name
        return true;
    }).sort(([aType],[bType]) => {
        const aBase = aType.split('_')[0];
        const bBase = bType.split('_')[0];
        const aIndex = validMealTypes.indexOf(aBase);
        const bIndex = validMealTypes.indexOf(bBase);
        
        // If both are valid types, sort by their order in validMealTypes
        if (aIndex !== -1 && bIndex !== -1) {
            if (aIndex !== bIndex) return aIndex - bIndex;
            // If same base type, suffixed versions come after non-suffixed
            const aIsSuffixed = aType.includes('_');
            const bIsSuffixed = bType.includes('_');
            if (aIsSuffixed !== bIsSuffixed) return aIsSuffixed ? 1 : -1;
        }
        // If only one is a valid type, it comes first
        else if (aIndex !== -1) return -1;
        else if (bIndex !== -1) return 1;
        
        // For other types, maintain their original order
        return 0;
    });
    

    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#F5EFE6] border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{day}</h2>
                <p className="text-gray-600 text-sm">
                    {actualMeals.length > 0 ? `${actualMeals.length} meal${actualMeals.length > 1 ? 's' : ''} planned` : 'Ready for planning'}
                </p>
            </div>
            <div className="p-5">
                {actualMeals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="relative mx-auto mb-6">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#F5EFE6] border border-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm"></span>
                            </div>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No meals planned for {day}</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                            Start planning your {day} meals! Use AI to generate a complete daily plan or add meals manually.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button 
                                onClick={() => onAddMealClick(day)}
                                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm"
                            >
                                <FiPlus className="w-4 h-4 mr-2" />
                                Add Manual Meal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Scrollable track */}
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                            {actualMeals.map(([mealType, meal]) => (
                                <div key={mealType} className="snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[32%]">
                                    <MealCard 
                                        mealType={mealType} 
                                        meal={meal} 
                                        onMealClick={(meal, type) => onMealClick(day, type, meal)}
                                        onAddToRoutine={onAddToRoutine ? (meal, type) => onAddToRoutine(meal, type) : undefined}
                                    />
                                </div>
                            ))}
                            {/* Add meal tile */}
                            <button 
                                onClick={() => onAddMealClick(day)}
                                className="snap-start shrink-0 w-[85%] sm:w-[60%] lg:w-[32%] flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 min-h-[180px]"
                            >
                                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center mb-2 transition-colors">
                                    <FiPlus className="w-5 h-5 text-gray-500 hover:text-gray-900 transition-colors" />
                                </div>
                                <span className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">Add Another Meal</span>
                                <span className="text-xs text-gray-400 mt-1">Snack, dessert, etc.</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayPlan;
