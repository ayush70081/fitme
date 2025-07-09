// src/pages/Progress.jsx

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  Activity, 
  Zap, 
  Award,
  Clock,
  Flame,
  Trophy,
  Check
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LabelList } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('weight');

  // Mock data for charts
  const weeklyData = {
    weight: [
      { day: 'Mon', value: 175, target: 170 },
      { day: 'Tue', value: 174.5, target: 170 },
      { day: 'Wed', value: 174, target: 170 },
      { day: 'Thu', value: 173.5, target: 170 },
      { day: 'Fri', value: 173, target: 170 },
      { day: 'Sat', value: 172.8, target: 170 },
      { day: 'Sun', value: 172.5, target: 170 }
    ],
    calories: [
      { day: 'Mon', value: 450, target: 500 },
      { day: 'Tue', value: 520, target: 500 },
      { day: 'Wed', value: 480, target: 500 },
      { day: 'Thu', value: 510, target: 500 },
      { day: 'Fri', value: 470, target: 500 },
      { day: 'Sat', value: 530, target: 500 },
      { day: 'Sun', value: 490, target: 500 }
    ],
    workouts: [
      { day: 'Mon', value: 1, target: 1 },
      { day: 'Tue', value: 1, target: 1 },
      { day: 'Wed', value: 0, target: 1 },
      { day: 'Thu', value: 1, target: 1 },
      { day: 'Fri', value: 1, target: 1 },
      { day: 'Sat', value: 1, target: 1 },
      { day: 'Sun', value: 0, target: 1 }
    ]
  };

  const monthlyProgress = {
    currentWeight: 172.5,
    targetWeight: 170,
    startWeight: 180,
    caloriesBurned: 12450,
    workoutsCompleted: 24,
    averageWorkoutTime: 45,
    longestStreak: 12
  };

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

  const achievements = [
    { icon: <Award className="w-6 h-6 text-yellow-500" />, title: 'First Week Complete', date: '2024-07-20' },
    { icon: <Zap className="w-6 h-6 text-green-500" />, title: '10 Workouts Done', date: '2024-07-25' },
    { icon: <Flame className="w-6 h-6 text-orange-500" />, title: '5,000 Calories Burned', date: '2024-07-28' },
    { icon: <TrendingUp className="w-6 h-6 text-blue-500" />, title: '5 lbs Lost', date: '2024-08-01' },
    { icon: <Trophy className="w-6 h-6 text-indigo-500" />, title: 'New Squat PR', date: '2024-08-03' },
    { icon: <Calendar className="w-6 h-6 text-red-500" />, title: '1 Month Streak', date: '2024-08-05' }
  ];

  const personalBests = [
    { exercise: 'Bench Press', value: '185 lbs', icon: <Activity className="w-5 h-5 text-pink-600" /> },
    { exercise: 'Squat', value: '225 lbs', icon: <Activity className="w-5 h-5 text-blue-600" /> },
    { exercise: '1-Mile Run', value: '7:30 min', icon: <Activity className="w-5 h-5 text-green-600" /> },
    { exercise: 'Plank', value: '3:15 min', icon: <Activity className="w-5 h-5 text-orange-600" /> }
  ];

  const workoutDates = [
    '2024-08-01', '2024-08-02', '2024-08-04', '2024-08-05', '2024-08-06', '2024-08-08',
    '2024-08-11', '2024-08-12', '2024-08-14', '2024-08-16', '2024-08-18', '2024-08-19',
    '2024-08-20', '2024-08-21', '2024-08-22', '2024-08-24', '2024-08-26', '2024-08-28',
    '2024-08-29', '2024-08-30'
  ];

  const CalendarView = ({ workedOutDates }) => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Parse workout dates to year, month, day tuples
    const workedOutSet = new Set(
      workedOutDates.map(d => {
        const date = new Date(d);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );

    const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
      if (i < firstDay) return null;
      const day = i - firstDay + 1;
      const date = new Date(year, month, day);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return {
        day,
        isWorkedOut: workedOutSet.has(key)
      };
    });

    return (
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-7 gap-2 text-center p-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={index} className="font-bold text-xs text-gray-500">{day}</div>)}
          {calendarDays.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.02 * i }}
              className={`flex items-center justify-center rounded-full mx-auto w-10 h-10 text-sm font-semibold ${
                day ? (day.isWorkedOut ? 'bg-pink-500 text-white shadow' : 'bg-gray-100 text-gray-700') : 'bg-transparent'
              }`}
            >
              {day ? (
                day.isWorkedOut ? <Check className="w-5 h-5 mx-auto" /> : day.day
              ) : ''}
            </motion.div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pink-500 text-white"><Check className="w-4 h-4" /></span>
          = Workout Day
        </div>
      </div>
    );
  };

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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: <Target className="w-6 h-6 text-blue-600" />,
              bg: 'bg-blue-100',
              value: `${monthlyProgress.currentWeight} lbs`,
              label: 'Current Weight',
              trend: <TrendingUp className="w-4 h-4" />,
              trendText: '-2.5 lbs',
              trendColor: 'text-green-600',
              progress: (
                <AnimatedProgressBar value={monthlyProgress.startWeight - monthlyProgress.currentWeight} max={monthlyProgress.startWeight - monthlyProgress.targetWeight} color="bg-blue-500" />
              )
            },
            {
              icon: <Flame className="w-6 h-6 text-orange-600" />,
              bg: 'bg-orange-100',
              value: monthlyProgress.caloriesBurned,
              label: 'Calories Burned',
              trend: <TrendingUp className="w-4 h-4" />,
              trendText: '+15%',
              trendColor: 'text-green-600',
              progress: <AnimatedProgressBar value={75} max={100} color="bg-orange-500" />
            },
            {
              icon: <Activity className="w-6 h-6 text-green-600" />,
              bg: 'bg-green-100',
              value: monthlyProgress.workoutsCompleted,
              label: 'Workouts Completed',
              trend: <TrendingUp className="w-4 h-4" />,
              trendText: '+8',
              trendColor: 'text-green-600',
              progress: <AnimatedProgressBar value={80} max={100} color="bg-green-500" />
            },
            {
              icon: <Clock className="w-6 h-6 text-purple-600" />,
              bg: 'bg-purple-100',
              value: `${monthlyProgress.averageWorkoutTime} min`,
              label: 'Avg Workout Time',
              trend: <TrendingUp className="w-4 h-4" />,
              trendText: '+5 min',
              trendColor: 'text-green-600',
              progress: <AnimatedProgressBar value={60} max={100} color="bg-purple-500" />
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariant}
              whileHover="hover"
              animate="visible"
              initial="hidden"
              variants={{ ...cardVariant, ...hoverCard }}
              className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${card.bg} rounded-lg`}>{card.icon}</div>
                <span className={`${card.trendColor} text-sm font-medium flex items-center gap-1`}>{card.trend}{card.trendText}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-600">{card.label}</p>
              <div className="mt-2">{card.progress}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div 
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={1}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
                <h3 className="text-xl font-semibold text-gray-900">Weight Progress</h3>
                <p className="text-sm text-gray-600">Your weight journey over time</p>
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
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyData[selectedMetric]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={3} dot={{ r: 5, fill: '#ec4899', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} animationDuration={1200} />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
            {/* Stats Row */}
            <div className="flex flex-wrap justify-between items-center gap-4 mt-12 mb-2">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Current</span>
                <span className="text-lg font-bold text-pink-600 bg-pink-50 rounded px-3 py-1">{monthlyProgress.currentWeight} lbs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Start</span>
                <span className="text-lg font-bold text-blue-600 bg-blue-50 rounded px-3 py-1">{monthlyProgress.startWeight} lbs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Target</span>
                <span className="text-lg font-bold text-green-600 bg-green-50 rounded px-3 py-1">{monthlyProgress.targetWeight} lbs</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Lost</span>
                <span className="text-lg font-bold text-orange-600 bg-orange-50 rounded px-3 py-1">{(monthlyProgress.startWeight - monthlyProgress.currentWeight).toFixed(1)} lbs</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-500 h-2 rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, ((monthlyProgress.startWeight - monthlyProgress.currentWeight) / (monthlyProgress.startWeight - monthlyProgress.targetWeight)) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={3}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Performance Metrics</h3>
              <p className="text-sm text-gray-600">Track your fitness improvements</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => {
                // Color and gradient for each metric
                const colors = [
                  { bg: 'from-pink-100 to-pink-200', circle: '#ec4899', text: 'text-pink-600' },
                  { bg: 'from-indigo-100 to-indigo-200', circle: '#6366f1', text: 'text-indigo-600' },
                  { bg: 'from-blue-100 to-blue-200', circle: '#3b82f6', text: 'text-blue-600' },
                  { bg: 'from-orange-100 to-orange-200', circle: '#f59e42', text: 'text-orange-600' },
                ];
                const color = colors[index % colors.length];
                // SVG Circular Progress
                const radius = 36;
                const stroke = 7;
                const normalizedRadius = radius - stroke / 2;
                const circumference = normalizedRadius * 2 * Math.PI;
                const percent = Math.round((metric.current / metric.target) * 100);
                const strokeDashoffset = circumference - (percent / 100) * circumference;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1 * index, duration: 0.7, type: 'spring', stiffness: 80 }}
                    whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(99,102,241,0.10)' }}
                    className={`rounded-2xl shadow bg-gradient-to-br ${color.bg} p-6 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer transition-all`}
                  >
                    <div className="mb-2 relative flex items-center justify-center">
                      <svg width={radius * 2} height={radius * 2}>
                        <circle
                          cx={radius}
                          cy={radius}
                          r={normalizedRadius}
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth={stroke}
                        />
                        <motion.circle
                          cx={radius}
                          cy={radius}
                          r={normalizedRadius}
                          fill="none"
                          stroke={color.circle}
                          strokeWidth={stroke}
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.2, type: 'spring', stiffness: 60 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={`absolute text-xl font-bold ${color.text}`}>{metric.current}{metric.unit}</span>
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mt-2 text-center">{metric.name}</h4>
                    <p className="text-xs text-gray-600 text-center mb-2">{metric.current}/{metric.target}{metric.unit}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-80 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}> <TrendingUp className="w-4 h-4" /> {metric.change}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Body Measurements & Weekly Activity */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={4}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Body Measurements */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={5}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Body Measurements</h3>
              <p className="text-sm text-gray-600">Track your body composition changes</p>
            </div>
            <div className="space-y-4">
              {bodyMeasurements.map((measurement, index) => {
                const change = measurement.current - measurement.previous;
                const isImprovement = (measurement.part === 'Waist' || measurement.part === 'Thighs') ? change < 0 : change > 0;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{measurement.part}</p>
                      <p className="text-sm text-gray-600">Current: {measurement.current} {measurement.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{measurement.current} {measurement.unit}</p>
                      <p className={`text-sm font-medium flex items-center gap-1 ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                        {isImprovement ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change > 0 ? '+' : ''}{change} {measurement.unit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Activity Chart */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={6}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Weekly Activity</h3>
              <p className="text-sm text-gray-600">Your daily workout completion</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyData.workouts} margin={{ top: 20, right: 30, left: 20, bottom: 30 }} barCategoryGap={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#6366f1" fontSize={14} label={{ value: 'Day', position: 'insideBottom', offset: -15, fill: '#6366f1', fontSize: 16 }} />
                <YAxis stroke="#6366f1" allowDecimals={false} domain={[0, 1]} ticks={[0, 1]} fontSize={14} label={{ value: 'Workouts', angle: -90, position: 'insideLeft', offset: 10, fill: '#6366f1', fontSize: 16 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" radius={[8, 8, 8, 8]} barSize={36} animationDuration={1200} >
                  <LabelList dataKey="value" position="top" fill="#1e293b" fontSize={16} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-pink-600" />
                <span className="font-medium text-gray-900">Achievement Unlocked!</span>
              </div>
              <p className="text-sm text-gray-600">You completed 5 workouts this week! Keep up the great work!</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Goals Progress */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={7}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Goals Progress</h3>
            <p className="text-sm text-gray-600">Track your progress towards your fitness goals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Weight Loss</h4>
              <p className="text-3xl font-bold text-blue-600 mb-1">7.5 lbs</p>
              <p className="text-sm text-gray-600 mb-3">Lost of 10 lbs goal</p>
              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">75% Complete</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Monthly Workouts</h4>
              <p className="text-3xl font-bold text-green-600 mb-1">24</p>
              <p className="text-sm text-gray-600 mb-3">of 30 workout goal</p>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">80% Complete</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Streak Goal</h4>
              <p className="text-3xl font-bold text-orange-600 mb-1">12</p>
              <p className="text-sm text-gray-600 mb-3">of 21 day streak</p>
              <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                <div className="bg-orange-500 h-3 rounded-full" style={{ width: '57%' }}></div>
              </div>
              <p className="text-xs text-gray-600 mt-2">57% Complete</p>
            </div>
          </div>
        </motion.div>

        {/* New Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={8}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Achievements</h3>
            <p className="text-sm text-gray-600 mb-6">Your recent milestones and accomplishments.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {achievements.map((ach, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 * i, duration: 0.6, type: 'spring', stiffness: 80 }}
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    className="p-3 rounded-full bg-white mb-2 shadow-sm"
                  >{ach.icon}</motion.div>
                  <p className="font-semibold text-sm text-gray-800">{ach.title}</p>
                  <p className="text-xs text-gray-500">{ach.date}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Personal Bests */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={9}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Bests</h3>
            <p className="text-sm text-gray-600 mb-6">Your top performances.</p>
            <div className="space-y-4">
              {personalBests.map((pr, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 * i, duration: 0.6, type: 'spring', stiffness: 80 }}
                  whileHover={{ scale: 1.06, backgroundColor: '#f3f4f6' }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 cursor-pointer transition-all"
                >
                  <motion.div whileHover={{ scale: 1.2, rotate: 8 }} className="flex items-center gap-4">{pr.icon}<p className="font-medium text-gray-800">{pr.exercise}</p></motion.div>
                  <p className="font-bold text-lg text-indigo-600">{pr.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Consistency Calendar */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          custom={10}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <div className="flex-grow flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Workout Consistency</h3>
              <p className="text-sm text-gray-600 mb-6">Your activity for the current month.</p>
              <CalendarView workedOutDates={workoutDates} />
            </div>
            <div className="flex-shrink-0 md:w-48 flex flex-col justify-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Streaks</h3>
              <p className="text-sm text-gray-600 mb-6">Keep the momentum going!</p>
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.08 }} className="bg-green-50 p-4 rounded-xl text-center cursor-pointer">
                  <p className="font-bold text-3xl text-green-600">5</p>
                  <p className="text-sm text-green-700">Current Streak</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 80 }} whileHover={{ scale: 1.08 }} className="bg-indigo-50 p-4 rounded-xl text-center cursor-pointer">
                  <p className="font-bold text-3xl text-indigo-600">12</p>
                  <p className="text-sm text-indigo-700">Longest Streak</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Progress;