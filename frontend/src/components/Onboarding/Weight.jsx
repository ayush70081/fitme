import React from 'react';
import { motion } from 'framer-motion';

const Weight = ({ nextStep, prevStep, handleChange, values }) => {
  // Define goal-specific configurations
  const getGoalConfig = (goal) => {
    const configs = {
      // Weight-related goals
      'lose': {
        title: 'What are your weight goals?',
        subtitle: 'Let\'s get specific to create the best plan for you.',
        fields: [
          {
            key: 'currentWeight',
            label: 'Current Weight (in kg)',
            placeholder: 'Enter your current weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          },
          {
            key: 'goalWeight',
            label: 'Goal Weight (in kg)',
            placeholder: 'Enter your goal weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          }
        ]
      },
      'gain': {
        title: 'What are your weight goals?',
        subtitle: 'Let\'s get specific to create the best plan for you.',
        fields: [
          {
            key: 'currentWeight',
            label: 'Current Weight (in kg)',
            placeholder: 'Enter your current weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          },
          {
            key: 'goalWeight',
            label: 'Goal Weight (in kg)',
            placeholder: 'Enter your goal weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          }
        ]
      },
      'muscle': {
        title: 'What are your muscle building goals?',
        subtitle: 'Tell us about your current physique and target.',
        fields: [
          {
            key: 'currentWeight',
            label: 'Current Weight (in kg)',
            placeholder: 'Enter your current weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          },
          {
            key: 'targetMuscleGain',
            label: 'Target Muscle Gain (in kg)',
            placeholder: 'Enter desired muscle gain (max 50kg)',
            type: 'number',
            required: false,
            min: 0,
            max: 50
          }
        ]
      },
      'strength': {
        title: 'What are your strength goals?',
        subtitle: 'Tell us about your current fitness level.',
        fields: [
          {
            key: 'currentWeight',
            label: 'Current Weight (in kg)',
            placeholder: 'Enter your current weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          },
          {
            key: 'currentStrengthLevel',
            label: 'Current Strength Level',
            placeholder: 'Beginner, Intermediate, Advanced',
            type: 'select',
            options: ['Beginner', 'Intermediate', 'Advanced'],
            required: false
          }
        ]
      },
      'maintain': {
        title: 'What is your current weight?',
        subtitle: 'We\'ll help you maintain your current healthy fitness level.',
        fields: [
          {
            key: 'currentWeight',
            label: 'Current Weight (in kg)',
            placeholder: 'Enter your current weight',
            type: 'number',
            required: true,
            min: 20,
            max: 500
          }
        ]
      }
    };

    // Default configuration for goals not specifically defined
    return configs[goal] || configs['lose'];
  };

  const config = getGoalConfig(values.goal);
  
  // Check if all required fields are filled
  const canContinue = config.fields
    .filter(field => field.required)
    .every(field => values[field.key]);

  const renderField = (field) => {
    const value = values[field.key] || '';
    
    if (field.type === 'select') {
      return (
        <select
          id={field.key}
          onChange={handleChange(field.key)}
          value={value}
          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg"
        >
          <option value="">{field.placeholder}</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    
    return (
      <input
        type={field.type}
        id={field.key}
        onChange={handleChange(field.key)}
        defaultValue={value}
        min={field.min}
        max={field.max}
        className="mt-1 block w-full px-4 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent sm:text-sm rounded-lg"
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
        <p className="text-gray-600 mt-2">{config.subtitle}</p>
      </div>
      <div className="space-y-6">
        {config.fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
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
          disabled={!canContinue}
          className="w-1/2 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
};

export default Weight; 