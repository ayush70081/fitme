import { ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mealPlanPersistence from '../../services/mealPlanPersistence';

const canonicalTypes = ['Breakfast', 'Lunch', 'Dinner'];

const FoodOverview = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    try {
      const restored = mealPlanPersistence.restorePlan();
      if (restored?.success && restored?.data) {
        setPlan(restored.data);
      } else {
        // Fallback to current plan if restore didn't find any
        const current = mealPlanPersistence.getCurrentPlan?.();
        if (current) setPlan(current);
      }
    } catch {
      setPlan(null);
    }

    // Listen for Nutrition page updates (e.g., after adding meals)
    const handler = () => {
      try {
        const restored = mealPlanPersistence.restorePlan();
        if (restored?.success && restored?.data) setPlan(restored.data);
      } catch {}
    };
    window.addEventListener('mealPlanUpdated', handler);
    return () => window.removeEventListener('mealPlanUpdated', handler);
  }, []);

  const meals = useMemo(() => {
    const entries = [];
    const p = plan || {};
    // Prefer canonical keys; also look for suffixed variants like lunch_2
    canonicalTypes.forEach((t) => {
      const key = t.toLowerCase();
      const base = p[key];
      let name = base?.name || '';
      if (!name) {
        // search for suffixed variants
        const altKey = Object.keys(p).find(k => k.startsWith(key + '_') && p[k]?.name);
        if (altKey) name = p[altKey].name;
      }
      entries.push({ type: t, description: name || 'Not planned yet' });
    });
    return entries;
  }, [plan]);

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
