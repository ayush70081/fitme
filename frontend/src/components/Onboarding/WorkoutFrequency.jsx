import React from 'react';
import { motion } from 'framer-motion';

const WorkoutFrequency = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">How often do you want to workout?</h2>
        <p className="text-gray-600 mt-2">This helps us plan your weekly schedule.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="workoutFrequency" className="block text-sm font-medium text-gray-700 sr-only">Workout Frequency</label>
          <select
            id="workoutFrequency"
            onChange={handleChange('workoutFrequency')}
            defaultValue={values.workoutFrequency}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg"
          >
            <option value="">Select workout frequency</option>
            <option value="2-3">2-3 times per week</option>
            <option value="3-4">3-4 times per week</option>
            <option value="4-5">4-5 times per week</option>
            <option value="5-6">5-6 times per week</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div className="mt-6">
          <label htmlFor="workoutDuration" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred workout duration (minutes)
          </label>
          <select
            id="workoutDuration"
            onChange={handleChange('workoutDuration')}
            defaultValue={values.workoutDuration}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg"
          >
            <option value="">Select duration</option>
            <option value="15-30">15-30 minutes</option>
            <option value="30-45">30-45 minutes</option>
            <option value="45-60">45-60 minutes</option>
            <option value="60-90">60-90 minutes</option>
            <option value="90+">90+ minutes</option>
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
          disabled={!values.workoutFrequency || !values.workoutDuration}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default WorkoutFrequency; 