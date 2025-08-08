// src/pages/Progress.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  Zap, 
  Award,
  Clock,
  Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI } from '../services/api';
import userStorage from '../utils/userScopedStorage';

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('workouts');
  const { user } = useAuth();
  const [workoutStats, setWorkoutStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState({ weight: [], calories: [], workouts: [] });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stats = await workoutAPI.getWorkoutStatistics();
        if (isMounted) setWorkoutStats(stats.statistics || stats);
      } catch (e) {
        // Fail silently; UI will show zeros
        if (isMounted) setWorkoutStats(null);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Build dynamic weekly data from user history (workouts) and user-scoped nutrition (eaten)
  const rebuildWeeklyData = useCallback(() => {
    const history = Array.isArray(user?.workoutHistory) ? user.workoutHistory : [];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const formatDay = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });
    const ymdKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Workouts map (burned)
    const workoutMap = days.reduce((acc, d) => {
      acc[ymdKey(d)] = { burned: 0, workouts: 0 };
      return acc;
    }, {});

    history.forEach((w) => {
      if (!w.completedAt) return;
      const d = new Date(w.completedAt);
      d.setHours(0, 0, 0, 0);
      const key = ymdKey(d);
      if (workoutMap[key]) {
        workoutMap[key].workouts += 1;
        workoutMap[key].burned += parseInt(w.caloriesBurned || 0, 10);
      }
    });

    // Nutrition map (eaten) from user-scoped cumulativeNutrition
    let nutrition = {};
    try {
      nutrition = JSON.parse(userStorage.getItem('cumulativeNutrition') || '{}');
    } catch {
      nutrition = {};
    }

    const weightArray = days.map((d) => ({
      day: formatDay(d),
      value: user?.weight ?? 0,
      target: user?.goalWeight ?? null,
    }));

    // Use eaten calories for the chart (aligns with nutrition progress)
    const caloriesArray = days.map((d) => {
      const key = ymdKey(d);
      const eaten = nutrition[key]?.calories || 0;
      return { day: formatDay(d), value: eaten };
    });

    const workoutsArray = days.map((d) => {
      const key = ymdKey(d);
      return { day: formatDay(d), value: workoutMap[key]?.workouts || 0 };
    });

    setWeeklyData({ weight: weightArray, calories: caloriesArray, workouts: workoutsArray });
  }, [user]);

  useEffect(() => {
    rebuildWeeklyData();
  }, [rebuildWeeklyData]);

  // Refresh when nutrition data updates (add to routine, etc.)
  useEffect(() => {
    const handler = () => rebuildWeeklyData();
    window.addEventListener('nutritionDataUpdated', handler);
    window.addEventListener('dailyTasksUpdated', handler);
    window.addEventListener('workoutStatsUpdated', handler);
    return () => {
      window.removeEventListener('nutritionDataUpdated', handler);
      window.removeEventListener('dailyTasksUpdated', handler);
      window.removeEventListener('workoutStatsUpdated', handler);
    };
  }, [rebuildWeeklyData]);

  // weeklyData is built dynamically above from user history

  const monthlyProgress = {
    currentWeight: user?.weight ?? 0,
    targetWeight: user?.goalWeight ?? 0,
    startWeight: user?.weight ?? 0,
    caloriesBurned: workoutStats?.totalCaloriesBurned ?? 0,
    workoutsCompleted: workoutStats?.totalWorkouts ?? 0,
    averageWorkoutTime: workoutStats?.averageWorkoutTimeMinutes ?? 0,
    longestStreak: user?.longestStreak ?? 0
  };

  // Goals (dynamic)
  const fitnessGoal = Array.isArray(user?.fitnessGoals) && user.fitnessGoals.length > 0 ? user.fitnessGoals[0] : null;
  const workoutHistory = Array.isArray(user?.workoutHistory) ? user.workoutHistory : [];

  const getMonthlyWorkoutCount = () => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return workoutHistory.filter(w => {
      const d = new Date(w.completedAt);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  };

  const monthlyWorkouts = getMonthlyWorkoutCount();

  const midByFreq = {
    '2-3': 2.5,
    '3-4': 3.5,
    '4-5': 4.5,
    '5-6': 5.5,
    'daily': 7
  };
  // Approx weeks in a month
  const weeks = 4;
  const workoutsPerWeek = midByFreq[user?.workoutFrequency || '3-4'] || 3.5;
  const monthlyWorkoutTarget = Math.round(workoutsPerWeek * weeks);
  const monthlyWorkoutProgress = monthlyWorkoutTarget > 0 ? Math.min(100, Math.round((monthlyWorkouts / monthlyWorkoutTarget) * 100)) : 0;

  const bodyMeasurements = [
    { part: 'Chest', current: 42, previous: 43, unit: 'in' },
    { part: 'Waist', current: 34, previous: 36, unit: 'in' },
    { part: 'Arms', current: 15, previous: 14.5, unit: 'in' },
    { part: 'Thighs', current: 24, previous: 25, unit: 'in' }
  ];

  const performanceMetrics = [
    { 
      name: 'Strength Progress', 
      current: 85, 
      target: 100, 
      unit: '%',
      trend: 'up',
      change: '+12%'
    },
    { 
      name: 'Cardio Endurance', 
      current: 78, 
      target: 90, 
      unit: '%',
      trend: 'up',
      change: '+8%'
    },
    { 
      name: 'Flexibility', 
      current: 65, 
      target: 80, 
      unit: '%',
      trend: 'up',
      change: '+5%'
    },
    { 
      name: 'Overall Fitness', 
      current: 76, 
      target: 90, 
      unit: '%',
      trend: 'up',
      change: '+10%'
    }
  ];

  // Removed Achievements, Personal Bests, and Workout Consistency sections

  // Animation variants
  const pageVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, when: 'beforeChildren', staggerChildren: 0.12 } }
  };
  const sectionVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.7, type: 'spring', stiffness: 60 }
    })
  };
  const cardContainerVariant = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 }
    }
  };
  const cardVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 80 } }
  };
  const hoverCard = {
    hover: { y: -6, scale: 1.03, boxShadow: '0 8px 32px 0 rgba(236,72,153,0.12)' }
  };

  // Animated Progress Bar
  const AnimatedProgressBar = ({ value, max, color }) => (
    <motion.div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className={color + " h-2 rounded-full"}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
        transition={{ duration: 1.2, type: 'spring', stiffness: 60 }}
      />
    </motion.div>
  );

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={0}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
              <p className="text-gray-600 mt-2">Monitor your fitness journey and celebrate your achievements.</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div
          variants={cardContainerVariant}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              icon: <Target className="w-6 h-6 text-blue-600" />,
              bg: 'bg-blue-100',
              cardBg: 'bg-blue-50',
              value: `${monthlyProgress.currentWeight} lbs`,
              label: 'Current Weight',
              note: (monthlyProgress.targetWeight && monthlyProgress.currentWeight)
                ? `${Math.sign(monthlyProgress.targetWeight - monthlyProgress.currentWeight) >= 0 ? '' : '+'}${(monthlyProgress.currentWeight - monthlyProgress.targetWeight).toFixed(1)} lbs from goal`
                : '—'
            },
            {
              icon: <Flame className="w-6 h-6 text-orange-600" />,
              bg: 'bg-orange-100',
              cardBg: 'bg-orange-50',
              value: monthlyProgress.caloriesBurned,
              label: 'Calories Burned',
              note: '—'
            },
            {
              icon: <Activity className="w-6 h-6 text-green-600" />,
              bg: 'bg-green-100',
              cardBg: 'bg-green-50',
              value: monthlyProgress.workoutsCompleted,
              label: 'Workouts Completed',
              note: '—'
            },
            {
              icon: <Clock className="w-6 h-6 text-purple-600" />,
              bg: 'bg-purple-100',
              cardBg: 'bg-purple-50',
              value: `${monthlyProgress.averageWorkoutTime} min`,
              label: 'Avg Workout Time',
              note: '—'
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover="hover"
              animate="visible"
              initial="hidden"
              variants={{ ...cardVariant, ...hoverCard }}
              className={`rounded-xl shadow-sm p-4 cursor-pointer transition-all border border-gray-100 ${card.cardBg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${card.bg} rounded-lg`}>{card.icon}</div>
                {card.note && <span className="text-xs text-gray-500">{card.note}</span>}
              </div>
              <p className="text-xl font-bold text-gray-900 leading-tight">{card.value}</p>
              <p className="text-xs text-gray-600">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={1}
          className="grid grid-cols-1 gap-6"
        >
          {/* Weight Progress Chart */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={2}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedMetric === 'weight' && 'Weight Progress'}
                  {selectedMetric === 'calories' && 'Calories (Eaten) Progress'}
                  {selectedMetric === 'workouts' && 'Workouts Progress'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedMetric === 'weight' && 'Your weight journey over time'}
                  {selectedMetric === 'calories' && 'Calories eaten per day'}
                  {selectedMetric === 'workouts' && 'Workouts completed per day'}
                </p>
              </div>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="weight">Weight</option>
                <option value="calories">Calories</option>
                <option value="workouts">Workouts</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyData[selectedMetric]} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  stroke="#8884d8"
                  tickMargin={12}
                  label={{ value: 'Day', position: 'insideBottom', offset: -20, fill: '#64748b' }}
                />
                <YAxis
                  stroke="#8884d8"
                  allowDecimals={selectedMetric !== 'workouts'}
                  width={selectedMetric === 'workouts' ? 80 : 70}
                  label={{
                    value: selectedMetric === 'weight' ? 'Weight (lbs)' : selectedMetric === 'calories' ? 'Calories (kcal)' : 'Workouts (count)',
                    angle: -90,
                    position: 'outsideLeft',
                    offset: 8,
                    fill: '#64748b'
                  }}
                />
                <Tooltip formatter={(value) => {
                  if (selectedMetric === 'calories') return [`${value} kcal`, 'Value'];
                  if (selectedMetric === 'workouts') return [value, 'Workouts'];
                  return [`${value} lbs`, 'Weight'];
                }} />
                <Line type="monotone" dataKey="value" name={selectedMetric}
                  stroke={selectedMetric === 'calories' ? '#f97316' : selectedMetric === 'workouts' ? '#22c55e' : '#ec4899'}
                  strokeWidth={3}
                  dot={{ r: 5, fill: selectedMetric === 'calories' ? '#f97316' : selectedMetric === 'workouts' ? '#22c55e' : '#ec4899', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1200}
                />
                {selectedMetric === 'weight' && (
                  <Line type="monotone" dataKey="target" name="target" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} animationDuration={1200} />
                )}
              </LineChart>
            </ResponsiveContainer>
            {/* Removed static stats row and progress bar */}
          </motion.div>

          {/* Performance Metrics section removed as requested */}
        </motion.div>

        {/* Weekly Activity and Body Measurements sections removed as requested */}

        {/* Goals Progress */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={7}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
            <h3 className="text-xl font-semibold text-gray-900">Goals Progress</h3>
              <p className="text-sm text-gray-600">Personalized progress based on your profile</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weight/Goal tile */}
            <div className="p-4 rounded-lg border border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-md"><Target className="w-4 h-4 text-blue-600" /></div>
                  <h4 className="text-sm font-semibold text-gray-900">Weight Goal</h4>
                </div>
                <span className="text-xs text-gray-500 capitalize">{fitnessGoal || 'general-fitness'}</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">{monthlyProgress.currentWeight} lbs {monthlyProgress.targetWeight ? `→ ${monthlyProgress.targetWeight} lbs` : ''}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, monthlyProgress.targetWeight && monthlyProgress.startWeight ? Math.round(((monthlyProgress.startWeight - monthlyProgress.currentWeight) / (monthlyProgress.startWeight - monthlyProgress.targetWeight)) * 100) : 0))}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{monthlyProgress.targetWeight ? `${Math.abs(monthlyProgress.currentWeight - monthlyProgress.targetWeight).toFixed(1)} lbs from target` : 'Set a goal weight to track progress'}</div>
            </div>

            {/* Monthly workouts tile */}
            <div className="p-4 rounded-lg border border-gray-200 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-md"><Activity className="w-4 h-4 text-green-600" /></div>
                  <h4 className="text-sm font-semibold text-gray-900">Monthly Workouts</h4>
                </div>
                <span className="text-xs text-gray-500">Target: {monthlyWorkoutTarget}</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">{monthlyWorkouts} completed</div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${monthlyWorkoutProgress}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">{monthlyWorkoutProgress}% complete (based on your frequency)</div>
            </div>

            {/* Streak tile */}
            <div className="p-4 rounded-lg border border-gray-200 bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-md"><Zap className="w-4 h-4 text-orange-600" /></div>
                  <h4 className="text-sm font-semibold text-gray-900">Streak</h4>
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-2">Current: {user?.currentStreak ?? 0} days • Longest: {user?.longestStreak ?? 0} days</div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, Math.round(((user?.currentStreak ?? 0) / Math.max(1, user?.longestStreak ?? 1)) * 100))}%` }} />
              </div>
              <div className="mt-1 text-xs text-gray-500">Compare current streak to your best</div>
            </div>
          </div>
        </motion.div>

        {/* Sections removed: Achievements, Personal Bests, Workout Consistency */}
      </div>
    </motion.div>
  );
};

export default Progress;