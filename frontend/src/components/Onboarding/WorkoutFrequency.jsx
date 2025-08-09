import React, { useMemo } from 'react';
import { WORKOUT_FREQUENCY_OPTIONS, WORKOUT_DURATION_OPTIONS } from '../../constants/preferences';
import { motion } from 'framer-motion';

const WorkoutFrequency = ({ nextStep, prevStep, handleChange, values }) => {
  const freqError = useMemo(() => {
    if (!values.workoutFrequency) return 'Please select workout frequency';
    return '';
  }, [values.workoutFrequency]);
  const durationError = useMemo(() => {
    if (!values.workoutDuration) return 'Please select workout duration';
    return '';
  }, [values.workoutDuration]);
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
            className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${freqError ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg`}
          >
            <option value="">Select workout frequency</option>
            {WORKOUT_FREQUENCY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {freqError && <p className="mt-1 text-xs text-red-600">{freqError}</p>}
        </div>
        <div className="mt-6">
          <label htmlFor="workoutDuration" className="block text-sm font-medium text-gray-700 mb-2">
            Preferred workout duration (minutes)
          </label>
          <select
            id="workoutDuration"
            onChange={handleChange('workoutDuration')}
            defaultValue={values.workoutDuration}
            className={`mt-1 block w-full pl-3 pr-10 py-3 text-base border ${durationError ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg`}
          >
            <option value="">Select duration</option>
            {WORKOUT_DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {durationError && <p className="mt-1 text-xs text-red-600">{durationError}</p>}
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
          disabled={Boolean(freqError) || Boolean(durationError)}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default WorkoutFrequency; 