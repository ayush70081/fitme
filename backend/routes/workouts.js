const express = require('express');
const router = express.Router();
const { 
  generateWorkoutPlan,
  saveWorkoutPlan,
  getSavedWorkoutPlans,
  getWorkoutPlanById,
  deleteWorkoutPlan,
  setActivePlan,
  createCustomWorkout,
  completeWorkout,
  getWorkoutStatistics
} = require('../controllers/workoutController');
const { authenticate } = require('../middleware/auth');

// POST /api/workouts/generate - Generate AI workout plan
router.post('/generate', authenticate, generateWorkoutPlan);

// POST /api/workouts/save - Save workout plan
router.post('/save', authenticate, saveWorkoutPlan);

// POST /api/workouts/custom - Create custom workout
router.post('/custom', authenticate, createCustomWorkout);

// GET /api/workouts/saved - Get all saved workout plans
router.get('/saved', authenticate, getSavedWorkoutPlans);

// GET /api/workouts/statistics - Get workout statistics (must come before /:planId)
router.get('/statistics', authenticate, getWorkoutStatistics);

// POST /api/workouts/complete - Complete a workout
router.post('/complete', authenticate, completeWorkout);

// GET /api/workouts/:planId - Get specific workout plan
router.get('/:planId', authenticate, getWorkoutPlanById);

// DELETE /api/workouts/:planId - Delete workout plan
router.delete('/:planId', authenticate, deleteWorkoutPlan);

// PUT /api/workouts/:planId/activate - Set workout plan as active
router.put('/:planId/activate', authenticate, setActivePlan);

module.exports = router;