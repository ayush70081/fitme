import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Birthday = ({ nextStep, prevStep, handleChange, values }) => {
  const error = useMemo(() => {
    const v = values.birthday;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Please enter a valid date (YYYY-MM-DD)';
    const date = new Date(v);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear() - ((today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) ? 1 : 0);
    if (age < 13 || age > 120) return 'Age must be between 13 and 120 years';
    return '';
  }, [values.birthday]);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What is your date of birth?</h2>
        <p className="text-gray-600 mt-2">This helps us accurately calculate your age.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 sr-only">Birthday</label>
          {/* Use native date input for better compatibility */}
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={values.birthday}
            onChange={(e) => {
              handleChange('birthday')(e);
            }}
            max={new Date().toISOString().split('T')[0]}
            min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
            className={`mt-1 block w-full px-4 py-3 text-base border ${error ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent sm:text-sm rounded-lg`}
          />
          <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD or use the date picker</p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
          disabled={Boolean(error)}
          className="w-1/2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default Birthday; 