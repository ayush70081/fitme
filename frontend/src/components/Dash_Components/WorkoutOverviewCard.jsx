import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Workouts from '../../pages/Workouts';

const WorkoutOverviewCard = ({ totalWorkouts = 0, avgWorkout = 0, totalCaloriesBurned = 0 }) => {
  const navigate = useNavigate();
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const handleNavigate = () => {
    navigate('/dashboard/workouts');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      {/* Header Row: Workouts + Start Now */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-black">Workouts</h2>
        <div
          onClick={handleNavigate}
          className="flex items-center text-sm font-semibold text-pink-600 hover:text-pink-800 cursor-pointer"
        >
          Start Now <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>

      {/* Dynamic Stats */}
      <div className="bg-pink-100 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <p className="text-gray-700 font-medium">Total Workouts</p>
          <p className="text-black font-semibold text-right">{totalWorkouts}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-gray-700 font-medium">Avg Workout (min)</p>
          <p className="text-black font-semibold">{avgWorkout}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-gray-700 font-medium">Total Calories</p>
          <p className="text-black font-semibold">{totalCaloriesBurned}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkoutOverviewCard;
