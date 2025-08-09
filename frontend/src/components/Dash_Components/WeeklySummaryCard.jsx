import React from 'react';
import { Dumbbell, Clock, Flame } from 'lucide-react';

const Stat = ({ label, value, delta, variant = 'workouts' }) => {
  const isPositive = delta > 0;
  const isZero = delta === 0;

  const variantStyles = {
    workouts: {
      tile: 'bg-blue-50',
      iconWrap: 'bg-blue-100 text-blue-600',
    },
    minutes: {
      tile: 'bg-indigo-50',
      iconWrap: 'bg-indigo-100 text-indigo-600',
    },
    calories: {
      tile: 'bg-rose-50',
      iconWrap: 'bg-rose-100 text-rose-600',
    },
  };
  const styles = variantStyles[variant] || variantStyles.workouts;

  const Icon = variant === 'workouts' ? Dumbbell : variant === 'minutes' ? Clock : Flame;

  return (
    <div className={`flex items-center gap-3 ${styles.tile} rounded-xl p-3 w-full`}> 
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${styles.iconWrap}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <span className="text-xs text-gray-600 font-medium">{label}</span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-gray-900">{value}</span>
          <span className={`text-xs font-semibold ${isZero ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isZero ? '—' : isPositive ? `+${delta}` : `${delta}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function WeeklySummaryCard({ summary }) {
  const safeSummary = summary || {
    thisWeek: { workouts: 0, minutes: 0, calories: 0 },
    lastWeek: { workouts: 0, minutes: 0, calories: 0 },
    delta: { workouts: 0, minutes: 0, calories: 0 },
    daily: []
  };

  const thisWeek = safeSummary.thisWeek || { workouts: 0, minutes: 0, calories: 0 };
  const delta = safeSummary.delta || { workouts: 0, minutes: 0, calories: 0 };

  return (
    <div className="w-full rounded-2xl p-4 shadow-sm bg-emerald-50 ring-1 ring-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/60 text-gray-600">
          This week vs last
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Workouts" value={thisWeek.workouts} delta={delta.workouts} variant="workouts" />
        <Stat label="Minutes" value={thisWeek.minutes} delta={delta.minutes} variant="minutes" />
        <Stat label="Calories" value={thisWeek.calories} delta={delta.calories} variant="calories" />
      </div>
    </div>
  );
}


