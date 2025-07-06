import React from 'react';
import { motion } from 'framer-motion';

const DietaryPreferences = ({ nextStep, prevStep, handleChange, values }) => {
  const dietTypes = [
    'No Restrictions',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Paleo',
    'Mediterranean',
    'Low Carb',
    'Gluten Free',
    'Dairy Free',
    'Intermittent Fasting',
    'Pescatarian',
    'Other'
  ];

  const handleDietSelection = (diet) => {
    values.updateData({ dietaryPreference: diet });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tell us about your diet</h2>
        <p className="text-gray-600 mt-2">This helps us recommend suitable meal plans.</p>
      </div>
      
      <div className="space-y-8">
        {/* Dietary Preference */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dietary Preference</h3>
          <div className="grid grid-cols-2 gap-3">
            {dietTypes.map((diet) => (
              <button
                key={diet}
                onClick={() => handleDietSelection(diet)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                  values.dietaryPreference === diet
                    ? 'bg-pink-50 border-pink-500 text-pink-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {diet}
              </button>
            ))}
          </div>
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
          disabled={!values.dietaryPreference}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default DietaryPreferences; 