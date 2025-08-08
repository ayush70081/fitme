import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Clock, Target, Zap, Info } from 'lucide-react';

const ExerciseDetailModal = ({ 
  exercise, 
  isOpen, 
  onClose, 
  exerciseIndex,
  onComplete,
  isCompleted 
}) => {
  if (!exercise || !isOpen) return null;

  const getExerciseIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'cardio':
        return '🏃';
      case 'strength':
      case 'upper body':
      case 'lower body':
        return '💪';
      case 'core':
        return '🔥';
      case 'flexibility':
        return '🧘';
      case 'full body':
        return '🏋️';
      default:
        return '⚡';
    }
  };

  const getDifficultyColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'cardio':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'strength':
      case 'upper body':
      case 'lower body':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'core':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'flexibility':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'full body':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="relative bg-black text-white p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getExerciseIcon(exercise.type)}</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{exercise.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border bg-[#F5EFE6] text-gray-900 border-[#EADFD0]`}>
                    {exercise.type}
                  </span>
                  {isCompleted && (
                    <span className="px-3 py-1 bg-[#F5EFE6] text-gray-900 rounded-full text-sm font-medium border border-[#EADFD0]">
                      ✅ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Exercise Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exercise.sets && (
                <div className="text-center p-4 bg-[#F5EFE6] rounded-xl border border-[#EADFD0]">
                  <div className="text-2xl font-bold text-gray-900">{exercise.sets}</div>
                  <div className="text-sm text-gray-600">Sets</div>
                </div>
              )}
              {exercise.reps && (
                <div className="text-center p-4 bg-[#F5EFE6] rounded-xl border border-[#EADFD0]">
                  <div className="text-2xl font-bold text-gray-900">{exercise.reps}</div>
                  <div className="text-sm text-gray-600">Reps</div>
                </div>
              )}
              {exercise.duration_minutes && exercise.duration_minutes > 0 && (
                <div className="text-center p-4 bg-[#F5EFE6] rounded-xl border border-[#EADFD0]">
                  <div className="text-2xl font-bold text-gray-900">{exercise.duration_minutes}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              )}
              {exercise.duration_seconds && exercise.duration_seconds > 0 && (
                <div className="text-center p-4 bg-[#F5EFE6] rounded-xl border border-[#EADFD0]">
                  <div className="text-2xl font-bold text-gray-900">{exercise.duration_seconds}</div>
                  <div className="text-sm text-gray-600">Seconds</div>
                </div>
              )}
              <div className="text-center p-4 bg-[#F5EFE6] rounded-xl border border-[#EADFD0]">
                <div className="text-2xl font-bold text-gray-900">{exercise.calories_burned}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              {exercise.rest_between_sets_seconds && (
                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-2xl font-bold text-gray-600">{exercise.rest_between_sets_seconds}s</div>
                  <div className="text-sm text-gray-700">Rest Time</div>
                </div>
              )}
            </div>

            {/* Exercise Description */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">How to Perform</h3>
              </div>
              <div className="text-gray-700 leading-relaxed">
                {exercise.description ? 
                  exercise.description.split('. ').map((sentence, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {sentence.trim()}{sentence.trim() && !sentence.endsWith('.') && '.'}
                    </p>
                  )) :
                  <p>Detailed exercise instructions not available. Please consult a fitness professional for proper form guidance.</p>
                }
              </div>
            </div>

            {/* Tips & Benefits */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#F5EFE6] rounded-xl p-4 border border-[#EADFD0]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-gray-900" />
                  <h4 className="font-semibold text-gray-900">Form Tips</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Maintain proper posture throughout</li>
                  <li>• Control the movement, don't rush</li>
                  <li>• Breathe properly during execution</li>
                  <li>• Focus on quality over quantity</li>
                </ul>
              </div>
              
              <div className="bg-[#F5EFE6] rounded-xl p-4 border border-[#EADFD0]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-gray-900" />
                  <h4 className="font-semibold text-gray-900">Benefits</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Improves strength and endurance</li>
                  <li>• Enhances muscle coordination</li>
                  <li>• Boosts cardiovascular health</li>
                  <li>• Burns calories effectively</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            {!isCompleted && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    onComplete(exerciseIndex);
                    onClose();
                  }}
                  className="flex-1 py-3 px-6 bg-black text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200"
                >
                  Mark as Complete
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
            
            {isCompleted && (
              <div className="text-center py-4">
                <div className="text-gray-900 font-medium">✅ Exercise completed!</div>
                <button
                  onClick={onClose}
                  className="mt-3 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseDetailModal;