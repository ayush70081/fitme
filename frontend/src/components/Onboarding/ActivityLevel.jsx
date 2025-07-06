import React from 'react';
import { motion } from 'framer-motion';

const ActivityLevel = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What is your activity level?</h2>
        <p className="text-gray-600 mt-2">This helps us accurately calculate your daily calorie needs.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 sr-only">Activity Level</label>
          <select
            id="activityLevel"
            onChange={handleChange('activityLevel')}
            defaultValue={values.activityLevel}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg"
          >
            <option value="">Select your activity level</option>
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Lightly active (light exercise/sports 1-3 days/week)</option>
            <option value="moderate">Moderately active (moderate exercise/sports 3-5 days/week)</option>
            <option value="very">Very active (hard exercise/sports 6-7 days a week)</option>
            <option value="extra">Extra active (very hard exercise/sports & physical job)</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!values.activityLevel}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default ActivityLevel; 