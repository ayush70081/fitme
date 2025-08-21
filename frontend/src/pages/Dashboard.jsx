// src/pages/Dashboard.jsx
import CalorieOverview from '../components/Dash_Components/CalorieOverview';
import DailyRoutine from '../components/Dash_Components/DailyRoutine';
import EatenCaloriesChart from '../components/Dash_Components/EatenCaloriesChart';
import FoodOverview from '../components/Dash_Components/FoodOverview';
import WorkoutOverviewCard from '../components/Dash_Components/WorkoutOverviewCard';
import { useEffect, useState } from 'react';
import WeeklySummaryCard from '../components/Dash_Components/WeeklySummaryCard';
import { userAPI, workoutAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [workoutStats, setWorkoutStats] = useState({});
  const [weeklySummary, setWeeklySummary] = useState(null);

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

    async function fetchWeekly() {
      try {
        const res = await workoutAPI.getWeeklySummary();
        setWeeklySummary(res);
      } catch (e) {
        console.error('Failed to fetch weekly summary:', e);
        setWeeklySummary(null);
      }
    }

    fetchStats();
    fetchWorkoutStats();
    fetchWeekly();
  }, []);

  return (
    <div className="min-h-screen w-full p-4" style={{ backgroundColor: '#FAF7F2' }}>
      {/* Main layout */}
      <div className="flex flex-col gap-4 lg:flex-row min-h-[calc(100vh-2rem)] w-full">
        {/* Left column */}
        <div className="w-full lg:w-[30%] space-y-4">
          <FoodOverview />
          <CalorieOverview caloriesBurned={workoutStats.totalCaloriesBurned ?? stats.caloriesBurned ?? 0} />
        </div>

        {/* Middle column */}
        <div className="w-full lg:w-[30%] flex">
          <DailyRoutine />
        </div>

        {/* Right column */}
        <div className="w-full lg:w-[40%] space-y-4">
          <WorkoutOverviewCard
            totalWorkouts={workoutStats.totalWorkouts ?? stats.totalWorkouts ?? 0}
            avgWorkout={workoutStats.averageWorkoutTimeMinutes ?? stats.avgWorkout ?? 0}
            totalCaloriesBurned={workoutStats.totalCaloriesBurned ?? 0}
          />

          <WeeklySummaryCard summary={weeklySummary} />

          <EatenCaloriesChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
