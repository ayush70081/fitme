import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { workoutAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../hooks/redux';
import { getCurrentUser } from '../store/authSlice';
import WorkoutPlanGenerator from '../components/WorkoutPlanGenerator';
import ExerciseDetailModal from '../components/ExerciseDetailModal';

// Timer Hook
const useTimer = (initialTime = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);
  
  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setTime(0);
    setIsRunning(false);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return { time, isRunning, start, pause, reset, formatTime };
};

// Enhanced Exercise Card Component with Timer and Progress
const ExerciseCard = React.memo(({ exercise, onComplete, isCompleted, exerciseIndex }) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { time, isRunning, start, pause, reset, formatTime } = useTimer();
  const [restTimer, setRestTimer] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  
  // Rest timer effect
  useEffect(() => {
    let interval = null;
    if (isRestActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(timer => {
          if (timer <= 1) {
            setIsRestActive(false);
            setIsResting(false);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTimer]);
  
  const startRest = () => {
    if (exercise.rest_between_sets_seconds) {
      setRestTimer(exercise.rest_between_sets_seconds);
      setIsRestActive(true);
      setIsResting(true);
    }
  };
  
  const completeSet = () => {
    if (exercise.sets && currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      startRest();
    } else {
      onComplete(exerciseIndex);
    }
  };
  
  const skipRest = () => {
    setIsRestActive(false);
    setIsResting(false);
    setRestTimer(0);
  };
  
  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-xl p-6 shadow-md border transition-all duration-300 ${
      isCompleted ? 'border-[#EADFD0] bg-[#FFF8ED]' : 'border-gray-100'
    } ${isResting ? 'ring-2 ring-[#EADFD0]' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <h4 className="text-lg font-semibold text-gray-800">{exercise.name}</h4>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 bg-black rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-[#FFF8ED] text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
          {exercise.type}
        </span>
        {exercise.sets && (
          <span className="bg-[#F5EFE6] text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
            Set {currentSet}/{exercise.sets}
          </span>
        )}
      </div>
    </div>
    
    <p className="text-gray-600 text-sm mb-4">{exercise.description}</p>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {exercise.sets && (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{exercise.sets}</p>
          <p className="text-xs text-gray-500">Sets</p>
        </div>
      )}
      {exercise.reps && (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{exercise.reps}</p>
          <p className="text-xs text-gray-500">Reps</p>
        </div>
      )}
      {exercise.duration_minutes && exercise.duration_minutes > 0 && (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{exercise.duration_minutes}</p>
          <p className="text-xs text-gray-500">Minutes</p>
        </div>
      )}
      {exercise.duration_seconds && exercise.duration_seconds > 0 && (
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{exercise.duration_seconds}</p>
          <p className="text-xs text-gray-500">Seconds</p>
        </div>
      )}
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{exercise.calories_burned}</p>
        <p className="text-xs text-gray-500">Calories</p>
      </div>
    </div>
    
    {/* Exercise Controls */}
    <div className="mt-6 space-y-3">
      {/* Timer Section */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTimer(!showTimer)}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {showTimer && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-semibold text-gray-800">
                {formatTime(time)}
              </span>
              <button
                onClick={isRunning ? pause : start}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isRunning ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-[#FFF8ED] text-gray-900 hover:bg-[#F5EFE6]'
                }`}
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
        {exercise.rest_between_sets_seconds && (
          <div className="text-sm text-gray-600">
            Rest: <span className="font-medium">{exercise.rest_between_sets_seconds}s</span>
          </div>
        )}
      </div>
      
      {/* Rest Timer */}
      {isResting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FFF8ED] border border-[#EADFD0] rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-gray-900 mb-2">
            Rest Time: {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={skipRest}
              className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors text-sm"
            >
              Skip Rest
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowDetailModal(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
        >
          View Details
        </button>
        
        {!isCompleted && (
          <>
            {exercise.sets ? (
              <button
                onClick={completeSet}
                disabled={isResting}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isResting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:opacity-90'
                }`}
              >
                {currentSet >= exercise.sets ? 'Complete Exercise' : `Complete Set ${currentSet}`}
              </button>
            ) : (
              <button
                onClick={() => onComplete(exerciseIndex)}
                className="flex-1 py-2 px-4 bg-black text-white rounded-lg font-medium hover:opacity-90 transition-colors"
              >
                Mark Complete
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={exercise}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        exerciseIndex={exerciseIndex}
        onComplete={onComplete}
        isCompleted={isCompleted}
      />
    </div>
  </motion.div>
  );
});

// Custom Workout Modal Component
const CustomWorkoutModal = React.memo(({ 
  showCustomWorkout, 
  setShowCustomWorkout, 
  customWorkout, 
  setCustomWorkout,
  addCustomExercise,
  updateCustomExercise,
  removeCustomExercise,
  saveCustomWorkout,
  saveLoading 
}) => (
  <AnimatePresence>
    {showCustomWorkout && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          // Only close if clicking the backdrop
          if (e.target === e.currentTarget) {
            setShowCustomWorkout(false);
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-50/95 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#F5EFE6] rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Create Custom Workout</h3>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
            saveCustomWorkout();
          }}>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name *
            </label>
            <input
              type="text"
              value={customWorkout.name}
              onChange={(e) => setCustomWorkout(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent"
              placeholder="Enter workout name (e.g., Upper Body Strength)"
              maxLength={50}
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-semibold text-gray-900">Exercises</h4>
              <button
                type="button"
                onClick={addCustomExercise}
                className="bg-black text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors text-sm font-medium"
              >
                Add Exercise
              </button>
            </div>

            {customWorkout.exercises.map((exercise, index) => (
              <div key={index} className="bg-white rounded-lg p-4 mb-3 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium text-sm text-gray-900">Exercise {index + 1}</h5>
                  {customWorkout.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCustomExercise(index)}
                      className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-xs font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Exercise Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Push-ups"
                      value={exercise.name}
                      onChange={(e) => updateCustomExercise(index, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select
                      value={exercise.type || 'Custom'}
                      onChange={(e) => updateCustomExercise(index, 'type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    >
                      <option value="Custom">Custom</option>
                      <option value="Cardio">Cardio</option>
                      <option value="Strength">Strength</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Core">Core</option>
                      <option value="Upper Body">Upper Body</option>
                      <option value="Lower Body">Lower Body</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sets</label>
                    <input
                      type="number"
                      placeholder="3"
                      min="1"
                      max="10"
                      value={exercise.sets}
                      onChange={(e) => updateCustomExercise(index, 'sets', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
                    <input
                      type="number"
                      placeholder="10"
                      min="1"
                      max="100"
                      value={exercise.reps}
                      onChange={(e) => updateCustomExercise(index, 'reps', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      placeholder="5"
                      min="1"
                      max="60"
                      value={exercise.duration}
                      onChange={(e) => updateCustomExercise(index, 'duration', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rest (sec)</label>
                    <input
                      type="number"
                      placeholder="60"
                      min="10"
                      max="300"
                      value={exercise.rest || 60}
                      onChange={(e) => updateCustomExercise(index, 'rest', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                  <textarea
                    placeholder="Describe how to perform this exercise..."
                    value={exercise.description || ''}
                    onChange={(e) => updateCustomExercise(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#EADFD0]"
                    rows="2"
                    maxLength={200}
                  />
                </div>
              </div>
            ))}
          </div>
          
          </form>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setShowCustomWorkout(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCustomWorkout}
              disabled={saveLoading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saveLoading ? 'Creating...' : 'Create Workout'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

// Save Plan Modal Component
const SavePlanModal = React.memo(({ 
  showSaveModal, 
  setShowSaveModal, 
  planName, 
  setPlanName, 
  saveCurrentPlan, 
  saveLoading, 
  setError 
}) => (
  <AnimatePresence>
    {showSaveModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-50/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-[#F5EFE6] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Save Workout Plan</h3>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent"
              placeholder="Enter a name for your workout plan"
              maxLength={50}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowSaveModal(false);
                setPlanName('');
                setError(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={saveCurrentPlan}
              disabled={saveLoading || !planName.trim()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {saveLoading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

// Saved Plans Modal Component
const SavedPlansModal = React.memo(({ 
  showSavedPlans, 
  setShowSavedPlans, 
  savedPlans, 
  savedPlansLoading, 
  loadSavedPlan, 
  deleteSavedPlan 
}) => (
  <AnimatePresence>
    {showSavedPlans && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-50/95 backdrop-blur-sm rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl"
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F5EFE6] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Your Saved Workout Plans</h3>
            </div>
            <button
              onClick={() => setShowSavedPlans(false)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {savedPlansLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : savedPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No saved workout plans yet.</p>
              <p className="text-sm text-gray-400">Generate and save workout plans to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {savedPlans.map((plan) => (
                <motion.div 
                  key={plan._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#EADFD0] transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-semibold text-gray-900">{plan.name}</h4>
                        {plan.isAIGenerated && (
                        <span className="bg-[#F5EFE6] text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium">
                            AI Generated
                          </span>
                        )}
                        {plan.isCustom && (
                        <span className="bg-[#F5EFE6] text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium">
                            Custom
                          </span>
                        )}
                        {plan.isActive && (
                        <span className="bg-[#F5EFE6] text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Goal: {plan.goal}</p>
                      <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{plan.days?.length || 0} days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{plan.duration_per_day_minutes} min/day</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                          </svg>
                          <span>{plan.totalCaloriesBurned} calories</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(plan.createdAt).toLocaleDateString()}
                        {plan.lastUsed && ` • Last used: ${new Date(plan.lastUsed).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => loadSavedPlan(plan._id)}
                        className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-black transition-colors text-xs font-medium"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteSavedPlan(plan._id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

// Workout Completion Modal Component
const WorkoutCompletionModal = React.memo(({
  showModal,
  workoutSession,
  completedExercises,
  totalWorkoutTime,
  workoutPlan,
  selectedDay,
  completeWorkout,
  cancelWorkoutCompletion,
  completionLoading,
  formatWorkoutTime
}) => {
  if (!showModal || !workoutSession) return null;

  const selectedDayData = workoutPlan?.days?.[selectedDay];
  const durationMinutes = Math.round(totalWorkoutTime / (1000 * 60));
  
  const completedCalories = Array.from(completedExercises).reduce((total, exerciseIndex) => {
    const exercise = selectedDayData?.exercises?.[exerciseIndex];
    return total + (exercise?.calories_burned || 0);
  }, 0);

  const completionRate = (completedExercises.size / (workoutSession.totalExercises || 1)) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#F5EFE6] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Workout Complete!</h3>
            <p className="text-gray-600">Great job finishing your workout session.</p>
          </div>

          {/* Workout Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Session Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatWorkoutTime(totalWorkoutTime)}</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{completedCalories}</p>
                <p className="text-xs text-gray-500">Calories Burned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{completedExercises.size}</p>
                <p className="text-xs text-gray-500">Exercises Done</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{Math.round(completionRate)}%</p>
                <p className="text-xs text-gray-500">Completion</p>
              </div>
            </div>
          </div>

          {/* Completed Exercises */}
          {completedExercises.size > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Completed Exercises</h4>
              <div className="max-h-32 overflow-y-auto">
                {Array.from(completedExercises).map(exerciseIndex => {
                  const exercise = selectedDayData?.exercises?.[exerciseIndex];
                  return (
                    <div key={exerciseIndex} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-700">{exercise?.name}</span>
                      <span className="text-gray-900 font-medium">{exercise?.calories_burned || 0} cal</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={cancelWorkoutCompletion}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={completeWorkout}
              disabled={completionLoading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {completionLoading ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

const Workouts = () => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showCustomWorkout, setShowCustomWorkout] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [savedPlansLoading, setSavedPlansLoading] = useState(false);
  const [planName, setPlanName] = useState('');
  const [customWorkout, setCustomWorkout] = useState({
    name: '',
    exercises: [{ 
      name: '', 
      type: 'Custom',
      sets: '', 
      reps: '', 
      duration: '',
      rest: 60,
      description: ''
    }]
  });
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  
  // Workout session management
  const [workoutSession, setWorkoutSession] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  
  // Workout session timer
  useEffect(() => {
    let interval = null;
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        setTotalWorkoutTime(Date.now() - workoutStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutStartTime]);

  // Handler for when a workout plan is generated
  const handlePlanGenerated = (result) => {
    setWorkoutPlan({ 
      ...result.workoutPlan, 
      isAIGenerated: !result.isDemoMode,
      isDemoMode: result.isDemoMode 
    });
    setSelectedDay(0);
    setError(null);
    
    // Show demo message if in demo mode
    if (result.isDemoMode) {
      setError(result.message || 'AI temporarily unavailable - showing demo workout plan');
    }
  };

  // Handler for generation errors
  const handleGenerationError = (errorMessage) => {
    setError(errorMessage);
  };

  const saveCurrentPlan = async () => {
    if (!workoutPlan || !planName.trim()) {
      setError('Please provide a name for your workout plan.');
      return;
    }

    setSaveLoading(true);
    try {
      console.log('Saving workout plan:', { workoutPlan, planName: planName.trim() });
      
      const result = await workoutAPI.saveWorkoutPlan(workoutPlan, planName.trim());
      console.log('Save result:', result);
      
      setShowSaveModal(false);
      setPlanName('');
      setError(null);
      
      // Show success message
      setError(`✅ Workout plan "${planName.trim()}" saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setError(null), 3000);
      
    } catch (err) {
      console.error('Error saving workout plan:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      let errorMessage = 'Failed to save workout plan. ';
      
      if (err.response?.status === 401) {
        errorMessage += 'Please log in and try again.';
      } else if (err.response?.status === 400) {
        errorMessage += err.response.data?.message || 'Invalid data provided.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage += 'Backend server is not available. Plan will be saved locally.';
        
        // Save to localStorage as fallback
        try {
          const savedPlans = JSON.parse(localStorage.getItem('fitme_saved_plans') || '[]');
          const newPlan = {
            _id: 'local_' + Date.now(),
            name: planName.trim(),
            workoutPlan,
            createdAt: new Date().toISOString(),
            isLocal: true
          };
          savedPlans.push(newPlan);
          localStorage.setItem('fitme_saved_plans', JSON.stringify(savedPlans));
          
          setShowSaveModal(false);
          setPlanName('');
          setError(`✅ Workout plan "${planName.trim()}" saved locally!`);
          setTimeout(() => setError(null), 3000);
          return;
        } catch (localError) {
          console.error('Failed to save locally:', localError);
        }
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const fetchSavedPlans = useCallback(async () => {
    setSavedPlansLoading(true);
    try {
      const response = await workoutAPI.getSavedWorkoutPlans();
      let plans = response.workoutPlans || [];
      
      // Also include local storage plans
      try {
        const localPlans = JSON.parse(localStorage.getItem('fitme_saved_plans') || '[]');
        plans = [...plans, ...localPlans];
      } catch (localError) {
        console.warn('Failed to load local plans:', localError);
      }
      
      setSavedPlans(plans);
    } catch (err) {
      console.error('Error fetching saved plans:', err);
      
      // Fallback to local storage only
      try {
        const localPlans = JSON.parse(localStorage.getItem('fitme_saved_plans') || '[]');
        setSavedPlans(localPlans);
        if (localPlans.length > 0) {
          setError('Server unavailable - showing locally saved plans only.');
        } else {
          setError('Failed to fetch saved workout plans.');
        }
      } catch (localError) {
        setError('Failed to fetch saved workout plans.');
      }
    } finally {
      setSavedPlansLoading(false);
    }
  }, []);

  const loadSavedPlan = useCallback(async (planId) => {
    try {
      const response = await workoutAPI.getWorkoutPlanById(planId);
      setWorkoutPlan(response.workoutPlan);
      setSelectedDay(0);
      setShowSavedPlans(false);
    } catch (err) {
      setError('Failed to load workout plan.');
      console.error('Error loading saved plan:', err);
    }
  }, []);

  const deleteSavedPlan = useCallback(async (planId) => {
    try {
      await workoutAPI.deleteWorkoutPlan(planId);
      setSavedPlans(prev => prev.filter(plan => plan._id !== planId));
    } catch (err) {
      setError('Failed to delete workout plan.');
      console.error('Error deleting plan:', err);
    }
  }, []);

  useEffect(() => {
    if (showSavedPlans) {
      fetchSavedPlans();
    }
  }, [showSavedPlans]);

  const addCustomExercise = useCallback(() => {
    setCustomWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, { 
        name: '', 
        type: 'Custom',
        sets: '', 
        reps: '', 
        duration: '',
        rest: 60,
        description: ''
      }]
    }));
  }, []);

  const updateCustomExercise = useCallback((index, field, value) => {
    setCustomWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  }, []);

  const removeCustomExercise = useCallback((index) => {
    setCustomWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  }, []);

  const saveCustomWorkout = useCallback(async () => {
    console.log('🔥 saveCustomWorkout function called!');
    console.log('=== Custom Workout Creation Debug ===');
    console.log('Custom workout data:', customWorkout);

    if (!customWorkout.name || customWorkout.name.trim().length === 0) {
      setError('Please provide a workout name.');
      return;
    }

    // Validate that at least one exercise has a name
    const validExercises = customWorkout.exercises.filter(ex => ex.name && ex.name.trim().length > 0);
    console.log('Valid exercises:', validExercises);
    
    if (validExercises.length === 0) {
      setError('Please add at least one exercise with a name.');
      return;
    }

    setSaveLoading(true);
    try {
      console.log('Attempting to create custom workout...');
      
      const exerciseData = validExercises.map(exercise => ({
        name: exercise.name.trim(),
        type: exercise.type || 'Custom',
        sets: exercise.sets ? parseInt(exercise.sets) : undefined,
        reps: exercise.reps ? parseInt(exercise.reps) : undefined,
        duration: exercise.duration ? parseInt(exercise.duration) : undefined,
        rest: exercise.rest ? parseInt(exercise.rest) : 60,
        description: exercise.description || `Custom exercise: ${exercise.name}`
      }));

      console.log('Processed exercise data:', exerciseData);

      const response = await workoutAPI.createCustomWorkout(
        customWorkout.name.trim(),
        exerciseData
      );

      console.log('Custom workout creation response:', response);

      // Load the created workout plan immediately
      setWorkoutPlan({
        ...response.workoutPlan,
        isCustom: true,
        isAIGenerated: false
      });
      setSelectedDay(0);
      setShowCustomWorkout(false);
      setCustomWorkout({
        name: '',
        exercises: [{ 
          name: '', 
          type: 'Custom',
          sets: '', 
          reps: '', 
          duration: '',
          rest: 60,
          description: ''
        }]
      });
      setError(null);
      
      // Refresh saved plans if the modal is open
      if (showSavedPlans) {
        fetchSavedPlans();
      }
    } catch (err) {
      console.error('❌ Error creating custom workout:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create custom workout. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        errorMessage = 'Server is not available. Please check if the backend is running.';
      }
      
      // If it's a network error, create a local demo version
      if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        console.log('🔄 Creating local demo custom workout due to network error');
        
        // Create a demo workout plan locally
        const localCustomWorkout = {
          _id: 'local_' + Date.now(),
          name: customWorkout.name.trim(),
          goal: 'Custom Workout',
          duration_per_day_minutes: Math.max(validExercises.length * 5, 15),
          preference: ['Custom'],
          days: [{
            day: "Custom Workout",
            workout_type: "Custom Exercise Plan",
            estimated_calories_burned: validExercises.length * 30,
            exercises: exerciseData.map(exercise => ({
              ...exercise,
              calories_burned: exercise.duration ? exercise.duration * 5 : 30
            }))
          }],
          isAIGenerated: false,
          isCustom: true,
          createdAt: new Date().toISOString(),
          isLocalDemo: true
        };

        // Load the workout plan
        setWorkoutPlan(localCustomWorkout);
        setSelectedDay(0);
        setShowCustomWorkout(false);
        setCustomWorkout({
          name: '',
          exercises: [{ 
            name: '', 
            type: 'Custom',
            sets: '', 
            reps: '', 
            duration: '',
            rest: 60,
            description: ''
          }]
        });
        setError('Custom workout created locally (server unavailable)');
        
        return;
      }
      
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  }, [customWorkout, showSavedPlans, fetchSavedPlans]);

  // Workout completion state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);

  // Workout session management functions
  const startWorkoutSession = useCallback(() => {
    setWorkoutSession({
      dayIndex: selectedDay,
      startTime: Date.now(),
      totalExercises: workoutPlan?.days?.[selectedDay]?.exercises?.length || 0
    });
    setWorkoutStartTime(Date.now());
    setIsWorkoutActive(true);
    setCompletedExercises(new Set());
  }, [selectedDay, workoutPlan]);

  const endWorkoutSession = useCallback(() => {
    setIsWorkoutActive(false);
    const session = {
      ...workoutSession,
      endTime: Date.now(),
      totalTime: totalWorkoutTime,
      completedCount: completedExercises.size,
      completionRate: (completedExercises.size / (workoutSession?.totalExercises || 1)) * 100
    };
    
    console.log('Workout session completed:', session);
    
    // Show completion modal if workout was actually performed
    if (completedExercises.size > 0) {
      setShowCompletionModal(true);
    } else {
      // Just reset if no exercises were completed
      setWorkoutSession(null);
      setWorkoutStartTime(null);
      setTotalWorkoutTime(0);
    }
  }, [workoutSession, totalWorkoutTime, completedExercises]);

  const completeWorkout = useCallback(async () => {
    if (!workoutSession) return;

    setCompletionLoading(true);
    try {
      const durationMinutes = Math.round(totalWorkoutTime / (1000 * 60));
      const selectedDayData = workoutPlan?.days?.[selectedDay];
      
      // Calculate calories burned from completed exercises
      const completedCalories = Array.from(completedExercises).reduce((total, exerciseIndex) => {
        const exercise = selectedDayData?.exercises?.[exerciseIndex];
        return total + (exercise?.calories_burned || 0);
      }, 0);

      // Prepare completed exercises data
      const completedExercisesData = Array.from(completedExercises).map(exerciseIndex => {
        const exercise = selectedDayData?.exercises?.[exerciseIndex];
        return {
          name: exercise?.name || 'Unknown Exercise',
          completed: true,
          caloriesBurned: exercise?.calories_burned || 0
        };
      });

      const workoutData = {
        workoutId: workoutPlan?._id || null,
        caloriesBurned: completedCalories,
        durationMinutes: Math.max(durationMinutes, 1), // Minimum 1 minute
        completedExercises: completedExercisesData,
        workoutName: `${selectedDayData?.day || 'Workout'} - ${selectedDayData?.workout_type || 'Custom'}`
      };

      console.log('Completing workout with data:', workoutData);

      const response = await workoutAPI.completeWorkout(workoutData);
      
      console.log('Workout completed successfully:', response);
      
      // Show success message
      setError(`✅ Workout completed! ${completedCalories} calories burned in ${durationMinutes} minutes.`);
      setTimeout(() => setError(null), 5000);

      // Refresh user profile to get updated workout history/stats
      try {
        await dispatch(getCurrentUser()).unwrap();
      } catch (e) {
        console.warn('Failed to refresh user after workout completion:', e);
      }

      // Notify other pages (Progress) to refresh charts
      try {
        window.dispatchEvent(new Event('workoutStatsUpdated'));
      } catch {}

      // Reset session
      setWorkoutSession(null);
      setWorkoutStartTime(null);
      setTotalWorkoutTime(0);
      setCompletedExercises(new Set());
      setShowCompletionModal(false);

    } catch (err) {
      console.error('Error completing workout:', err);
      setError('Failed to save workout completion. Please try again.');
    } finally {
      setCompletionLoading(false);
    }
  }, [workoutSession, totalWorkoutTime, completedExercises, workoutPlan, selectedDay]);

  const cancelWorkoutCompletion = useCallback(() => {
    setShowCompletionModal(false);
    setWorkoutSession(null);
    setWorkoutStartTime(null);
    setTotalWorkoutTime(0);
    setCompletedExercises(new Set());
  }, []);

  const completeExercise = useCallback((exerciseIndex) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      newSet.add(exerciseIndex);
      return newSet;
    });
  }, []);

  const formatWorkoutTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);




  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Workouts</h1>
          <p className="text-gray-600">
            AI-powered personalized workout plans tailored just for you, {user?.firstName || 'there'}!
          </p>
        </div>

        {/* Quick Action Buttons */}
        {!workoutPlan && (
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setShowSavedPlans(true)}
              className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View Saved Plans
            </button>

            <button
              onClick={() => setShowCustomWorkout(true)}
              className="flex items-center px-6 py-3 bg-white border border-[#EADFD0] text-gray-900 rounded-xl font-medium hover:bg-[#FFF8ED] transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Custom Workout
            </button>
          </div>
        )}

        {/* Workout Plan Generator */}
        {!workoutPlan && (
          <div className="mb-8">
            <WorkoutPlanGenerator 
              onPlanGenerated={handlePlanGenerated}
              onError={handleGenerationError}
            />
          </div>
        )}

        {/* Action Buttons - Show when plan exists */}
        {workoutPlan && (
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setWorkoutPlan(null)}
              className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-black transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate New Plan
            </button>

            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:opacity-90 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save Plan
            </button>
            
            <button
              onClick={() => setShowSavedPlans(true)}
              className="flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:opacity-90 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View Saved Plans
            </button>
            
            <button
              onClick={() => setShowCustomWorkout(true)}
              className="flex items-center px-6 py-3 bg-white border border-[#EADFD0] text-gray-900 rounded-xl font-medium hover:bg-[#FFF8ED] transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Custom Workout
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Workout Plan */}
        {workoutPlan ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Plan Overview */}
            <div className="rounded-2xl p-6 text-gray-900 border border-[#EADFD0] bg-[#FFF8ED]">
              <h2 className="text-2xl font-bold mb-4">Your Personalized Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">Goal</p>
                  <p className="text-xl font-semibold">{workoutPlan.goal}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration per Day</p>
                  <p className="text-xl font-semibold">{workoutPlan.duration_per_day_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600">Preferences</p>
                  <p className="text-xl font-semibold">{workoutPlan.preference?.join(', ') || 'Various'}</p>
                </div>
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex flex-wrap gap-2">
              {workoutPlan.days?.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDay === index
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-700 hover:bg-[#FFF8ED] border border-[#EADFD0]'
                  }`}
                >
                  {day.day}
                </button>
              ))}
            </div>

            {/* Workout Session Progress */}
            {isWorkoutActive && workoutSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFF8ED] border border-[#EADFD0] rounded-xl p-4 text-gray-900"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Session Progress</h3>
                  <span className="font-mono text-lg font-bold">{formatWorkoutTime(totalWorkoutTime)}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(completedExercises.size / (workoutSession.totalExercises || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{completedExercises.size}/{workoutSession.totalExercises} exercises completed</span>
                  <span>{Math.round((completedExercises.size / (workoutSession.totalExercises || 1)) * 100)}%</span>
                </div>
              </motion.div>
            )}

            {/* Selected Day Workout */}
            {workoutPlan.days?.[selectedDay] && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {workoutPlan.days[selectedDay].day}
                      </h3>
                      <p className="text-lg text-gray-600">
                        {workoutPlan.days[selectedDay].workout_type}
                      </p>
                      {isWorkoutActive && (
                          <p className="text-sm text-gray-600 font-medium mt-1">
                          Workout in progress • {formatWorkoutTime(totalWorkoutTime)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {workoutPlan.days[selectedDay].estimated_calories_burned}
                      </p>
                      <p className="text-sm text-gray-500">Estimated Calories</p>
                      {isWorkoutActive && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-600 font-medium">
                            {completedExercises.size}/{workoutSession?.totalExercises || 0} completed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Workout Session Controls */}
                  <div className="mt-4 flex gap-3">
                    {!isWorkoutActive ? (
                      <button
                        onClick={startWorkoutSession}
                        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 22h6a2 2 0 002-2V4a2 2 0 00-2-2H9a2 2 0 00-2 2v16a2 2 0 002 2z" />
                        </svg>
                        Start Workout
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={endWorkoutSession}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10l6 6m0-6l-6 6" />
                          </svg>
                          End Workout
                        </button>
                        <div className="flex items-center px-4 py-2 bg-[#F5EFE6] text-gray-900 rounded-lg border border-[#EADFD0]">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-mono font-semibold">{formatWorkoutTime(totalWorkoutTime)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercises */}
                <div className="grid gap-6">
                  {workoutPlan.days[selectedDay].exercises?.map((exercise, index) => (
                    <ExerciseCard 
                      key={index} 
                      exercise={exercise} 
                      exerciseIndex={index}
                      onComplete={completeExercise}
                      isCompleted={completedExercises.has(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : null}

        {/* Modals */}
        <CustomWorkoutModal 
          showCustomWorkout={showCustomWorkout}
          setShowCustomWorkout={setShowCustomWorkout}
          customWorkout={customWorkout}
          setCustomWorkout={setCustomWorkout}
          addCustomExercise={addCustomExercise}
          updateCustomExercise={updateCustomExercise}
          removeCustomExercise={removeCustomExercise}
          saveCustomWorkout={saveCustomWorkout}
          saveLoading={saveLoading}
        />
        <SavePlanModal 
          showSaveModal={showSaveModal}
          setShowSaveModal={setShowSaveModal}
          planName={planName}
          setPlanName={setPlanName}
          saveCurrentPlan={saveCurrentPlan}
          saveLoading={saveLoading}
          setError={setError}
        />
        <SavedPlansModal 
          showSavedPlans={showSavedPlans}
          setShowSavedPlans={setShowSavedPlans}
          savedPlans={savedPlans}
          savedPlansLoading={savedPlansLoading}
          loadSavedPlan={loadSavedPlan}
          deleteSavedPlan={deleteSavedPlan}
        />
        <WorkoutCompletionModal
          showModal={showCompletionModal}
          workoutSession={workoutSession}
          completedExercises={completedExercises}
          totalWorkoutTime={totalWorkoutTime}
          workoutPlan={workoutPlan}
          selectedDay={selectedDay}
          completeWorkout={completeWorkout}
          cancelWorkoutCompletion={cancelWorkoutCompletion}
          completionLoading={completionLoading}
          formatWorkoutTime={formatWorkoutTime}
        />
      </div>
    </div>
  );
};

export default Workouts;