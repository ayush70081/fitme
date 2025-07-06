import React from 'react';
import { motion } from 'framer-motion';

const Goal = ({ nextStep, handleChange, values }) => {
  const fitnessGoals = [
    {
      id: 'lose',
      label: 'Lose Weight',
      icon: '🏃‍♂️',
      description: 'Burn calories and reduce body weight',
      category: 'Weight Management'
    },
    {
      id: 'gain',
      label: 'Gain Weight',
      icon: '🍗',
      description: 'Build mass and increase body weight',
      category: 'Weight Management'
    },
    {
      id: 'muscle',
      label: 'Build Muscle',
      icon: '💪',
      description: 'Increase muscle mass and size',
      category: 'Strength & Muscle'
    },
    {
      id: 'strength',
      label: 'Improve Strength',
      icon: '🏋️‍♂️',
      description: 'Increase power and lifting capacity',
      category: 'Strength & Muscle'
    },
    {
      id: 'maintain',
      label: 'Stay Fit / Maintain',
      icon: '⚖️',
      description: 'Maintain current fitness and health',
      category: 'General Fitness'
    }
  ];

  const categories = [...new Set(fitnessGoals.map(goal => goal.category))];

  const handleGoalSelect = (goalId) => {
    handleChange('goal')({ target: { value: goalId } });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">What is your primary fitness goal?</h2>
        <p className="text-gray-600 mt-1 text-sm">Select the goal that best describes what you want to achieve.</p>
      </div>

      {/* Horizontal layout for all screen sizes */}
      <div className="grid grid-cols-5 gap-3">
        {fitnessGoals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGoalSelect(goal.id)}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              values.goal === goal.id
                ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200 shadow-md'
                : 'border-gray-200 hover:border-pink-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{goal.icon}</div>
              <h4 className="font-medium text-gray-900 text-xs leading-tight">{goal.label}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={nextStep}
          disabled={!values.goal}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2.5 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
        {values.goal && (
          <p className="text-center text-xs text-gray-600 mt-2">
            Selected: {fitnessGoals.find(g => g.id === values.goal)?.label}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default Goal; 