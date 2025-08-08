import React from 'react';
import { motion } from 'framer-motion';

const Height = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What is your height?</h2>
        <p className="text-gray-600 mt-2">This helps us customize your plan.</p>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (in cm)</label>
          <input
            type="number"
            id="height"
            onChange={handleChange('height')}
            defaultValue={values.height}
            className="mt-1 block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm rounded-lg"
            placeholder="Enter your height in cm"
          />
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
          disabled={!values.height}
          className="w-1/2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default Height; 