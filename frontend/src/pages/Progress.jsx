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
  const [selectedMetric, setSelectedMetric] = useState('calories');
  const [selectedIntakeMetric, setSelectedIntakeMetric] = useState('calories'); // calories | protein | carbs | fat
  const { user } = useAuth();
  const [workoutStats, setWorkoutStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState({ calories: [], workouts: [] });
  const [periodData, setPeriodData] = useState({ calories: [], workouts: [], eatenCalories: [], eatenProtein: [], eatenCarbs: [], eatenFat: [] });

  const exportSvgAsPng = (svgElement, fileName) => {
    try {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }
      const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      const image = new Image();
      const width = parseInt(svgElement.getAttribute('width') || (svgElement.viewBox && svgElement.viewBox.baseVal.width) || 1200, 10);
      const height = parseInt(svgElement.getAttribute('height') || (svgElement.viewBox && svgElement.viewBox.baseVal.height) || 600, 10);
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = png;
        link.click();
      };
      image.src = svgData;
    } catch (err) {
      console.error('Export failed', err);
    }
  };

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

  // Build dynamic data for different time periods
  const buildPeriodData = useCallback((period) => {
    const history = Array.isArray(user?.workoutHistory) ? user.workoutHistory : [];
    let days = [];
    let formatLabel;
    let ymdKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    switch (period) {
      case 'week':
        days = Array.from({ length: 7 }, (_, i) => {
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
          const d = new Date(today);
          d.setDate(today.getDate() - mondayOffset + i);
          d.setHours(0, 0, 0, 0);
          return d;
        });
        formatLabel = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });
        break;
      
      case 'month':
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        // Get first day of month and find the Monday of that week
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        // Find the Monday of the week containing the first day of the month
        const firstMonday = new Date(firstDayOfMonth);
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
        firstMonday.setDate(firstDayOfMonth.getDate() - mondayOffset);
        
        // Generate weeks that contain days of this month
        days = [];
        let currentWeekStart = new Date(firstMonday);
        let weekNumber = 1;
        
        while (currentWeekStart <= lastDayOfMonth) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(currentWeekStart.getDate() + 6);
          
          // Check if this week contains any days from the current month
          if (weekEnd >= firstDayOfMonth && currentWeekStart <= lastDayOfMonth) {
            days.push(new Date(currentWeekStart));
            weekNumber++;
          }
          
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        
        formatLabel = (d, index) => {
          if (period === 'month') {
            const weekStart = new Date(d);
            const weekEnd = new Date(d);
            weekEnd.setDate(weekStart.getDate() + 6);
            
            // Adjust start and end dates to only show days within the current month
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            
            const actualStart = weekStart < firstDayOfMonth ? firstDayOfMonth : weekStart;
            const actualEnd = weekEnd > lastDayOfMonth ? lastDayOfMonth : weekEnd;
            
            const startDay = actualStart.getDate();
            const endDay = actualEnd.getDate();
            const monthName = actualStart.toLocaleDateString(undefined, { month: 'short' });
            
            // Handle case where week spans across months
            if (actualStart.getMonth() !== actualEnd.getMonth()) {
              const endMonthName = actualEnd.toLocaleDateString(undefined, { month: 'short' });
              return `${monthName} ${startDay} - ${endMonthName} ${endDay}`;
            }
            
            return `${monthName} ${startDay}-${endDay}`;
          }
          return d.toLocaleDateString(undefined, { weekday: 'short' });
        };
        ymdKey = (d) => {
          const weekStart = new Date(d);
          const weekEnd = new Date(d);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `${year}-${String(month + 1).padStart(2, '0')}-W${weekStart.getTime()}`;
        };
        break;
      
      case 'quarter':
        days = Array.from({ length: 4 }, (_, i) => {
          const d = new Date(new Date().getFullYear(), i * 3, 1); // First month of each quarter
          d.setHours(0, 0, 0, 0);
          return d;
        });
        formatLabel = (d) => `Q${Math.floor(d.getMonth() / 3) + 1}`;
        ymdKey = (d) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
        break;
      
      case 'year':
        days = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(new Date().getFullYear(), i, 1);
          d.setHours(0, 0, 0, 0);
          return d;
        });
        formatLabel = (d) => d.toLocaleDateString(undefined, { month: 'short' });
        ymdKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        break;
      
      default:
        return { calories: [], workouts: [], eatenCalories: [], eatenProtein: [], eatenCarbs: [], eatenFat: [] };
    }

    // Workouts map (burned)
    const workoutMap = days.reduce((acc, d) => {
      acc[ymdKey(d)] = { burned: 0, workouts: 0 };
      return acc;
    }, {});

    history.forEach((w) => {
      if (!w.completedAt) return;
      const d = new Date(w.completedAt);
      d.setHours(0, 0, 0, 0);
      let key;
      
      if (period === 'quarter') {
        key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      } else if (period === 'year') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = ymdKey(d);
      }
      
      if (workoutMap[key]) {
        workoutMap[key].workouts += 1;
        workoutMap[key].burned += parseInt(w.caloriesBurned || 0, 10);
      }
    });



    // Use BURNED calories for the chart (from workout history)
    const caloriesArray = days.map((d, i) => {
      let key;
      if (period === 'quarter') {
        key = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
      } else if (period === 'year') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'month') {
        // For month view, aggregate weekly data
        const weekStart = new Date(d);
        const weekEnd = new Date(d);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const relevantWorkouts = history.filter(w => {
          if (!w.completedAt) return false;
          const workoutDate = new Date(w.completedAt);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        const totalBurned = relevantWorkouts.reduce((sum, w) => sum + parseInt(w.caloriesBurned || 0, 10), 0);
        return { day: formatLabel(d, i), value: totalBurned };
      } else {
        key = ymdKey(d);
      }
      
      if (period !== 'month') {
        return { day: formatLabel(d, i), value: workoutMap[key]?.burned || 0 };
      }
    }).filter(Boolean); // Remove undefined values

    const workoutsArray = days.map((d, i) => {
      if (period === 'month') {
        // For month view, aggregate weekly data
        const weekStart = new Date(d);
        const weekEnd = new Date(d);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const relevantWorkouts = history.filter(w => {
          if (!w.completedAt) return false;
          const workoutDate = new Date(w.completedAt);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        return { day: formatLabel(d, i), value: relevantWorkouts.length };
      } else {
        const key = ymdKey(d);
        return { day: formatLabel(d, i), value: workoutMap[key]?.workouts || 0 };
      }
    });

    // Nutrition (from storage)
    let nutrition = {};
    try {
      nutrition = JSON.parse(userStorage.getItem('cumulativeNutrition') || '{}');
    } catch {
      nutrition = {};
    }

    const aggregateNutrition = (date, keyBuilder) => {
      // Returns totals for calories, protein, carbs, fat for given period bucket
      if (period === 'quarter') {
        const relevantDays = Object.keys(nutrition).filter(nk => {
          const nd = new Date(nk);
          const q = Math.floor(nd.getMonth() / 3) + 1;
          return nd.getFullYear() === date.getFullYear() && q === (Math.floor(date.getMonth() / 3) + 1);
        });
        return relevantDays.reduce((acc, k) => {
          const v = nutrition[k] || {};
          acc.calories += v.calories || 0;
          acc.protein += v.protein || 0;
          acc.carbs += v.carbs || 0;
          acc.fat += v.fat || 0;
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      }

      if (period === 'year') {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const relevantDays = Object.keys(nutrition).filter(nk => nk.startsWith(key));
        const totals = relevantDays.reduce((acc, k) => {
          const v = nutrition[k] || {};
          acc.calories += v.calories || 0;
          acc.protein += v.protein || 0;
          acc.carbs += v.carbs || 0;
          acc.fat += v.fat || 0;
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
        const denom = Math.max(1, relevantDays.length);
        return {
          calories: Math.round(totals.calories / denom),
          protein: Math.round(totals.protein / denom),
          carbs: Math.round(totals.carbs / denom),
          fat: Math.round(totals.fat / denom),
        };
      }

      if (period === 'month') {
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekStart.getDate() + 6);
        const relevantDays = Object.keys(nutrition).filter(nk => {
          const nd = new Date(nk);
          return nd >= weekStart && nd <= weekEnd;
        });
        return relevantDays.reduce((acc, k) => {
          const v = nutrition[k] || {};
          acc.calories += v.calories || 0;
          acc.protein += v.protein || 0;
          acc.carbs += v.carbs || 0;
          acc.fat += v.fat || 0;
          return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      }

      // week/day
      const key = ymdKey(date);
      const v = nutrition[key] || {};
      return {
        calories: v.calories || 0,
        protein: v.protein || 0,
        carbs: v.carbs || 0,
        fat: v.fat || 0,
      };
    };

    const eatenCaloriesArray = days.map((d, i) => {
      const totals = aggregateNutrition(d);
      return { day: formatLabel(d, i), value: totals.calories };
    });
    const eatenProteinArray = days.map((d, i) => {
      const totals = aggregateNutrition(d);
      return { day: formatLabel(d, i), value: totals.protein };
    });
    const eatenCarbsArray = days.map((d, i) => {
      const totals = aggregateNutrition(d);
      return { day: formatLabel(d, i), value: totals.carbs };
    });
    const eatenFatArray = days.map((d, i) => {
      const totals = aggregateNutrition(d);
      return { day: formatLabel(d, i), value: totals.fat };
    });

    return {
      calories: caloriesArray,
      workouts: workoutsArray,
      eatenCalories: eatenCaloriesArray,
      eatenProtein: eatenProteinArray,
      eatenCarbs: eatenCarbsArray,
      eatenFat: eatenFatArray,
    };
  }, [user]);

  // Build dynamic weekly data from user history (workouts and burned calories)
  const rebuildWeeklyData = useCallback(() => {
    const weekData = buildPeriodData('week');
    setWeeklyData(weekData);
  }, [buildPeriodData]);

  // Build data for selected period
  const rebuildPeriodData = useCallback(() => {
    const data = buildPeriodData(selectedPeriod);
    setPeriodData(data);
  }, [buildPeriodData, selectedPeriod]);

  useEffect(() => {
    rebuildWeeklyData();
  }, [rebuildWeeklyData]);

  useEffect(() => {
    rebuildPeriodData();
  }, [rebuildPeriodData]);

  // Refresh when workout-related events fire
  useEffect(() => {
    const handler = () => {
      rebuildWeeklyData();
      rebuildPeriodData();
    };
    window.addEventListener('dailyTasksUpdated', handler);
    window.addEventListener('workoutStatsUpdated', handler);
    return () => {
      window.removeEventListener('dailyTasksUpdated', handler);
      window.removeEventListener('workoutStatsUpdated', handler);
    };
  }, [rebuildWeeklyData, rebuildPeriodData]);

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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return workoutHistory.filter(w => {
      if (!w.completedAt) return false;
      const completedAt = new Date(w.completedAt);
      return completedAt >= startOfMonth && completedAt <= endOfMonth;
    }).length;
  };

  const monthlyWorkouts = getMonthlyWorkoutCount();
  const monthlyWorkoutTarget = user?.workoutFrequency ? parseInt(user.workoutFrequency) * 4 : 12; // Assume 4 weeks per month
  const monthlyWorkoutProgress = monthlyWorkoutTarget > 0 ? Math.round((monthlyWorkouts / monthlyWorkoutTarget) * 100) : 0;

  // Animation variants
  const pageVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const sectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5 }
    })
  };

  const cardContainerVariant = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const hoverCard = {
    hover: { y: -5, transition: { duration: 0.2 } }
  };

  const ProgressBar = ({ value, max, color }) => (
    <motion.div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className={color + " h-2 rounded-full"}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }}
        transition={{ duration: 1.2, type: 'spring', stiffness: 60 }}
      />
    </motion.div>
  );

  const intakeColor = (metric) => {
    switch (metric) {
      case 'protein': return '#ef4444';
      case 'carbs': return '#f59e0b';
      case 'fat': return '#a855f7';
      default: return '#10b981'; // calories
    }
  };

  const intakeYAxisLabel = selectedIntakeMetric === 'calories' ? 'Calories (kcal)' : `${selectedIntakeMetric.charAt(0).toUpperCase() + selectedIntakeMetric.slice(1)} (g)`;
  const intakeDataKey = selectedIntakeMetric === 'calories' ? 'eatenCalories' : selectedIntakeMetric === 'protein' ? 'eatenProtein' : selectedIntakeMetric === 'carbs' ? 'eatenCarbs' : 'eatenFat';
  const intakeTitle = selectedIntakeMetric === 'calories' ? 'Eaten Calories Progress' : `Eaten ${selectedIntakeMetric.charAt(0).toUpperCase() + selectedIntakeMetric.slice(1)} Progress`;
  const intakeSubtitle = selectedPeriod === 'month'
    ? (selectedIntakeMetric === 'calories' ? 'Track your weekly calorie intake' : `Track your weekly ${selectedIntakeMetric} intake`)
    : (selectedIntakeMetric === 'calories' ? 'Track your daily calorie intake over time' : `Track your daily ${selectedIntakeMetric} intake over time`);

  return (
    <motion.div
      variants={pageVariant}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 sm:p-6"
      style={{ backgroundColor: '#FAF7F2' }}
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
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
              value: `${monthlyProgress.currentWeight} kg`,
              label: 'Current Weight',
              note: (monthlyProgress.targetWeight && monthlyProgress.currentWeight)
                ? `${Math.sign(monthlyProgress.targetWeight - monthlyProgress.currentWeight) >= 0 ? '' : '+'}${(monthlyProgress.currentWeight - monthlyProgress.targetWeight).toFixed(1)} kg from goal`
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
                  {selectedMetric === 'calories' && 'Calories Burned Progress'}
                  {selectedMetric === 'workouts' && 'Workouts Progress'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedMetric === 'calories' && selectedPeriod === 'month' ? 'Calories burned per week' : 'Calories burned per day'}
                  {selectedMetric === 'workouts' && selectedPeriod === 'month' ? 'Workouts completed per week' : 'Workouts completed per day'}
                </p>
              </div>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="calories">Calories Burned</option>
                <option value="workouts">Workouts</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={periodData[selectedMetric]} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  stroke="#8884d8"
                  tickMargin={12}
                  label={{ 
                    value: selectedPeriod === 'quarter' ? 'Quarter' : selectedPeriod === 'year' ? 'Month' : selectedPeriod === 'month' ? 'Week' : 'Day', 
                    position: 'insideBottom', 
                    offset: -20, 
                    fill: '#64748b' 
                  }}
                />
                <YAxis
                  stroke="#8884d8"
                  allowDecimals={selectedMetric !== 'workouts'}
                  width={selectedMetric === 'workouts' ? 80 : 70}
                  label={{
                    value: selectedMetric === 'calories' ? 'Calories (kcal)' : 'Workouts (count)',
                    angle: -90,
                    position: 'outsideLeft',
                    offset: 8,
                    fill: '#64748b'
                  }}
                />
                <Tooltip 
                  labelFormatter={(label) => {
                    if (selectedPeriod === 'quarter') {
                      const map = { Q1: 'Jan-Mar', Q2: 'Apr-Jun', Q3: 'Jul-Sep', Q4: 'Oct-Dec' };
                      const range = map[label] || null;
                      return range ? `${label} (${range})` : label;
                    }
                    if (selectedPeriod === 'month' && label.includes('-')) {
                      // Show full week range in tooltip
                      return `Week: ${label}`;
                    }
                    return label;
                  }}
                  formatter={(value, name) => {
                  if (selectedMetric === 'calories') return [`${value} kcal`, 'Calories Burned'];
                  if (selectedMetric === 'workouts') return [value, 'Workouts'];
                  return [value, name];
                }} />
                <Line type="monotone" dataKey="value" name={selectedMetric}
                  stroke={selectedMetric === 'calories' ? '#f97316' : '#22c55e'}
                  strokeWidth={3}
                  dot={{ r: 5, fill: selectedMetric === 'calories' ? '#f97316' : '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Eaten Intake Chart (Calories / Protein / Carbs / Fat) */}
          <motion.div
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            custom={3}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{intakeTitle}</h3>
                <p className="text-sm text-gray-600">{intakeSubtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedIntakeMetric}
                  onChange={(e) => setSelectedIntakeMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="calories">Calories</option>
                  <option value="protein">Protein</option>
                  <option value="carbs">Carbs</option>
                  <option value="fat">Fat</option>
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={periodData[intakeDataKey]} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  stroke="#8884d8"
                  tickMargin={12}
                  label={{ 
                    value: selectedPeriod === 'quarter' ? 'Quarter' : selectedPeriod === 'year' ? 'Month' : selectedPeriod === 'month' ? 'Week' : 'Day', 
                    position: 'insideBottom', 
                    offset: -20, 
                    fill: '#64748b' 
                  }}
                />
                <YAxis
                  stroke="#8884d8"
                  allowDecimals={true}
                  width={80}
                  label={{
                    value: intakeYAxisLabel,
                    angle: -90,
                    position: 'outsideLeft',
                    offset: 8,
                    fill: '#64748b'
                  }}
                />
                <Tooltip 
                  labelFormatter={(label) => {
                    if (selectedPeriod === 'quarter') {
                      const map = { Q1: 'Jan-Mar', Q2: 'Apr-Jun', Q3: 'Jul-Sep', Q4: 'Oct-Dec' };
                      const range = map[label] || null;
                      return range ? `${label} (${range})` : label;
                    }
                    if (selectedPeriod === 'month' && label.includes('-')) {
                      // Show full week range in tooltip
                      return `Week: ${label}`;
                    }
                    return label;
                  }}
                  formatter={(value) => [
                    selectedIntakeMetric === 'calories' ? `${value} kcal` : `${value} g`,
                    selectedIntakeMetric.charAt(0).toUpperCase() + selectedIntakeMetric.slice(1)
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  name={selectedIntakeMetric}
                  stroke={intakeColor(selectedIntakeMetric)}
                  strokeWidth={3}
                  dot={{ r: 5, fill: intakeColor(selectedIntakeMetric), stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>


      </div>
    </motion.div>
  );
};

export default Progress;