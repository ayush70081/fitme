import React, { useMemo } from 'react';
import userStorage from '../../utils/userScopedStorage';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const EatenCaloriesChart = () => {
  // Build current week (Monday to Sunday) eaten calories from user-scoped nutrition store
  const data = useMemo(() => {
    let nutrition = {};
    try {
      nutrition = JSON.parse(userStorage.getItem('cumulativeNutrition') || '{}');
    } catch {
      nutrition = {};
    }

    // Get Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
    
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - mondayOffset + i); // Start from Monday
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const eaten = nutrition[key]?.calories || 0;
      return { day: label, value: eaten };
    });

    return days;
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Eaten Calories (Current Week)</h2>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            stroke="#64748b" 
            label={{ 
              value: 'Day of Week', 
              position: 'insideBottom', 
              offset: -5, 
              fill: '#64748b' 
            }}
          />
          <YAxis stroke="#64748b" label={{ value: 'kcal', angle: -90, position: 'outsideLeft', offset: 8, fill: '#64748b' }} />
          <Tooltip formatter={(value) => [`${value} kcal`, 'Eaten']} />
          <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EatenCaloriesChart;


