import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const Location = ({ nextStep, prevStep, handleChange, values }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-4">
        <MapPin className="h-10 w-10 text-black mx-auto mb-2" />
        <h2 className="text-xl font-semibold text-gray-900">Your Location</h2>
        <p className="text-gray-600 mt-1">Please enter your city and country.</p>
      </div>
      <div className="mb-6">
        <input
          type="text"
          name="location"
          value={values.location}
          onChange={handleChange('location')}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200"
          placeholder="City, Country"
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!values.location}
          className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default Location; 