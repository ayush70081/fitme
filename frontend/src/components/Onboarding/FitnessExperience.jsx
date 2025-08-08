import React from 'react';
import { motion } from 'framer-motion';

const FitnessExperience = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What's your fitness experience?</h2>
        <p className="text-gray-600 mt-2">This helps us customize your workout plans.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="fitnessExperience" className="block text-sm font-medium text-gray-700 sr-only">Fitness Experience</label>
          <select
            id="fitnessExperience"
            onChange={handleChange('fitnessExperience')}
            defaultValue={values.fitnessExperience}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm rounded-lg"
          >
            <option value="">Select your experience level</option>
            <option value="beginner">Beginner (0-6 months)</option>
            <option value="intermediate">Intermediate (6 months - 2 years)</option>
            <option value="advanced">Advanced (2-5 years)</option>
            <option value="expert">Expert (5+ years)</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={prevStep}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!values.fitnessExperience}
          className="w-1/2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default FitnessExperience; 