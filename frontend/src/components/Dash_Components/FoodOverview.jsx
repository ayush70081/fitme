import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FoodOverview = () => {
    const navigate = useNavigate();

    const meals = [
        {
            type: 'Breakfast',
            description: 'Milk and Bread',
        },
        {
            type: 'Lunch',
            description: 'Dal-roti with salad',
        },
        {
            type: 'Dinner',
            description: 'Paneer tikka with fulka roti',
        },
    ];

    const handleNavigate = (mealType) => {
        navigate('/dashboard/nutrition', { state: { meal: mealType } });
    };

    return (
        <div className="w-full bg-white rounded-2xl shadow-md font-sans pb-4">
            {/* Header */}
            <h2 className="text-lg font-semibold text-black px-4 pt-4">Today's Meals</h2>

            {/* Combined subcard */}
            <div className="bg-green-100 rounded-2xl mx-4 mt-2 divide-y divide-green-200">
                {meals.map((meal) => (
                    <div
                        key={meal.type}
                        onClick={() => handleNavigate(meal.type)}
                        className="flex justify-between items-start px-4 py-3 cursor-pointer hover:bg-green-200 transition-colors rounded-2xl"
                    >
                        <div>
                            <h3 className="text-md font-semibold text-black">{meal.type}</h3>
                            <p className="text-sm text-gray-700">{meal.description}</p>
                        </div>
                        <ArrowRight className="text-green-600 mt-1" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FoodOverview;
