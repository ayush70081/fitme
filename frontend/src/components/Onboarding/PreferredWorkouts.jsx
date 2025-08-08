import React from 'react';
import { motion } from 'framer-motion';

const PreferredWorkouts = ({ nextStep, prevStep, handleChange, values }) => {
  const workoutTypes = [
    'Strength Training',
    'Cardio',
    'Yoga',
    'Pilates',
    'HIIT',
    'Running',
    'Swimming',
    'Cycling',
    'Boxing',
    'Dancing',
    'Calisthenics',
    'CrossFit'
  ];

  const handleWorkoutSelection = (workout) => {
    const currentWorkouts = values.preferredWorkouts || [];
    let updatedWorkouts;
    
    if (currentWorkouts.includes(workout)) {
      updatedWorkouts = currentWorkouts.filter(w => w !== workout);
    } else {
      updatedWorkouts = [...currentWorkouts, workout];
    }
    
    values.updateData({ preferredWorkouts: updatedWorkouts });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">What types of workouts do you enjoy?</h2>
        <p className="text-gray-600 mt-2">Select all that apply. We'll customize your recommendations.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {workoutTypes.map((workout) => (
          <button
            key={workout}
            onClick={() => handleWorkoutSelection(workout)}
            className={`p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
              (values.preferredWorkouts || []).includes(workout)
                ? 'bg-gray-50 border-black text-black'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-black'
            }`}
          >
            {workout}
          </button>
        ))}
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
          disabled={!values.preferredWorkouts || values.preferredWorkouts.length === 0}
          className="w-1/2 bg-black text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default PreferredWorkouts; 