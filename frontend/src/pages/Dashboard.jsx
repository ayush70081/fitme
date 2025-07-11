// src/pages/Dashboard.jsx
import CalorieOverview from '../components/Dash_Components/CalorieOverview';
import DailyRoutine from '../components/Dash_Components/DailyRoutine';
import FitnessGrowthChart from '../components/Dash_Components/FitnessGrowthChart';
import FoodOverview from '../components/Dash_Components/FoodOverview';
import StepProgressCard from '../components/Dash_Components/StepProgressCard';
import WorkoutOverviewCard from '../components/Dash_Components/WorkoutOverviewCard';
import { useEffect, useState } from 'react';
import { userAPI, workoutAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [workoutStats, setWorkoutStats] = useState({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await userAPI.getUserStats();
        setStats(res?.data?.stats || {});
      } catch (e) {
        setStats({});
      }
    }

    async function fetchWorkoutStats() {
      try {
        const res = await workoutAPI.getWorkoutStatistics();
        setWorkoutStats(res?.statistics || {});
      } catch (e) {
        console.error('Failed to fetch workout statistics:', e);
        setWorkoutStats({});
      }
    }

    fetchStats();
    fetchWorkoutStats();
  }, []);

  return (
    <div className="min-h-screen w-full bg-white p-2">

      {/* Main 2-column layout */}
      <div className="flex flex-col rounded-2xl gap-3 lg:flex-row h-full w-full">
        {/* Left column - 30%, light pink background */}
        <div className="w-full space-y-2 rounded-2xl lg:w-[30%] bg-white shadow p-3 ">
          {/* <h1 className="text-2xl font-bold p-2 mb-0">Today's Meal</h1>   */}
          <FoodOverview />
          {/* <h1 className="text-2xl font-bold p-2 mb-0">Measures</h1>   */}
          <CalorieOverview caloriesBurned={workoutStats.totalCaloriesBurned ?? stats.caloriesBurned ?? 0} />
        </div>
        

        {/* Right column - 70%, light blue background */}
        <div className="w-full rounded-2xl lg:w-[30%] bg-green-100 shadow p-3 ">
          <DailyRoutine />
        </div>
        <div className="w-full rounded-2xl lg:w-[40%] bg-white shadow p-3 ">
          <div className="flex flex-row gap-4 mb-3">
            <StepProgressCard currentStreak={stats.currentStreak ?? 0} longestStreak={stats.longestStreak ?? 0} />
            <WorkoutOverviewCard 
              totalWorkouts={workoutStats.totalWorkouts ?? stats.totalWorkouts ?? 0} 
              avgWorkout={workoutStats.averageWorkoutTimeMinutes ?? stats.avgWorkout ?? 0}
              totalCaloriesBurned={workoutStats.totalCaloriesBurned ?? 0}
            />
          </div>

          <FitnessGrowthChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
