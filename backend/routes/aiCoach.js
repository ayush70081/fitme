const express = require('express');
const router = express.Router();
const { generateAIResponse, getSuggestedQuestions } = require('../controllers/aiCoachController');
const { authenticate } = require('../middleware/auth');

// POST /api/ai-coach/chat - Send message to AI Coach
router.post('/chat', authenticate, generateAIResponse);

// GET /api/ai-coach/suggestions - Get personalized question suggestions
router.get('/suggestions', authenticate, getSuggestedQuestions);

module.exports = router; 