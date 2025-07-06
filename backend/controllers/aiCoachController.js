const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

// Initialize Gemini AI client
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Simple text cleaning - only remove markdown formatting
 */
const cleanResponseText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/```[\w]*\n?/g, '') // Remove code blocks
    .replace(/```/g, '')
    .replace(/`/g, '') // Remove inline code
    .replace(/^\s*[-*+]\s/gm, '• ') // Convert lists
    .replace(/\n{3,}/g, '\n\n') // Clean extra newlines
    .trim();
};

/**
 * Generate AI Coach response using Gemini 2.5 Flash
 * @route POST /api/ai-coach/chat
 * @access Private
 */
const generateAIResponse = async (req, res) => {
  try {
    console.log('=== AI Coach Request ===');
    console.log('Request ID:', Date.now());
    
    // Check if Gemini API key is configured
    if (!genAI) {
      console.log('❌ Gemini API key not configured');
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please contact administrator.',
        error: 'Missing GEMINI_API_KEY environment variable'
      });
    }

    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user data
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build user context with safe array handling
    const userContext = {
      name: user.firstName || 'there',
      fitnessGoals: Array.isArray(user.fitnessGoals) ? user.fitnessGoals : [],
      fitnessExperience: user.fitnessExperience || 'beginner',
      dietaryPreference: user.dietaryPreference || 'No Restrictions',
      workoutFrequency: user.workoutFrequency || 'not specified',
      preferredWorkouts: Array.isArray(user.preferredWorkouts) ? user.preferredWorkouts : []
    };

    // Create system prompt
    const systemPrompt = `You are an AI Fitness Coach for FitMe+. Be helpful, encouraging, and provide personalized advice.

User Profile:
- Name: ${userContext.name}
- Goals: ${userContext.fitnessGoals.join(', ') || 'general fitness'}
- Experience: ${userContext.fitnessExperience}
- Diet: ${userContext.dietaryPreference}
- Workout Frequency: ${userContext.workoutFrequency}
- Preferred Workouts: ${userContext.preferredWorkouts.join(', ') || 'various'}

Guidelines:
- Be supportive and motivational
- Provide evidence-based advice
- Help with workouts, nutrition, recipes, and app usage
- Use emojis appropriately
- Keep responses concise but helpful
- Do NOT use markdown formatting
- Write in plain text only
- End responses naturally

Respond to the user's message below.`;

    // Build conversation context
    let conversationText = systemPrompt + '\n\n';
    
    // Add recent conversation history (last 6 messages)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach(msg => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    conversationText += `User: ${message}\nAssistant:`;

    console.log('Sending request to Gemini...');
    console.log('Context length:', conversationText.length);

    // Configure Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024, // Reduced to prevent long responses
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    // Generate response
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const rawResponse = response.text();

    console.log('Raw response received, length:', rawResponse.length);

    // Clean the response
    const cleanedResponse = cleanResponseText(rawResponse);
    
    console.log('Cleaned response length:', cleanedResponse.length);
    console.log('✅ Response generated successfully');

    // Check if response mentions food/recipes
    const needsRecipes = message.toLowerCase().includes('recipe') || 
                        message.toLowerCase().includes('meal') || 
                        message.toLowerCase().includes('food') ||
                        message.toLowerCase().includes('cook');

    let recipes = null;
    if (needsRecipes) {
      recipes = await generateRecipes(model, message, userContext);
    }

    // Return response
    res.json({
      success: true,
      response: cleanedResponse,
      recipes: recipes,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      return res.status(500).json({
        success: false,
        message: 'Invalid API key configuration',
        error: 'Please check your Gemini API key'
      });
    }

    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return res.status(429).json({
        success: false,
        message: 'AI service rate limit exceeded. Please try again later.',
        error: 'Rate limit exceeded'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate recipe suggestions
 */
const generateRecipes = async (model, query, userContext) => {
  try {
    const recipePrompt = `Generate 2 healthy recipes related to: "${query}"
    
User preferences:
- Dietary: ${userContext.dietaryPreference}
- Goals: ${userContext.fitnessGoals.join(', ')}

Return ONLY a valid JSON array in this format:
[
  {
    "name": "Recipe Name",
    "description": "Brief description",
    "prepTime": "X minutes",
    "cookTime": "Y minutes", 
    "calories": "per serving",
    "protein": "Xg",
    "carbs": "Yg",
    "fat": "Zg",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "instructions": ["step 1", "step 2", "step 3"],
    "tags": ["healthy", "fitness"]
  }
]`;

    const result = await model.generateContent(recipePrompt);
    const response = await result.response;
    const recipesText = response.text();

    // Extract JSON from response
    const jsonMatch = recipesText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recipes = JSON.parse(jsonMatch[0]);
      return recipes;
    }

    return null;
  } catch (error) {
    console.error('Error generating recipes:', error);
    return null;
  }
};

/**
 * Get suggested questions based on user profile
 * @route GET /api/ai-coach/suggestions
 * @access Private
 */
const getSuggestedQuestions = async (req, res) => {
  try {
    const user = req.user;
    
    const suggestions = [
      "How do I set up my workout routine?",
      "What's a good beginner workout plan?",
      "Can you suggest healthy recipes for weight loss?",
      "How can I track my nutrition effectively?",
      "What exercises are best for building muscle?",
      "How do I stay motivated with my fitness goals?",
      "Can you create a meal plan for my dietary preferences?",
      "What's the best way to track my progress?"
    ];

    // Add personalized suggestions
    if (user.fitnessGoals?.includes('weight-loss')) {
      suggestions.unshift("What are effective weight loss strategies?");
      suggestions.unshift("Can you suggest low-calorie recipes?");
    }

    if (user.fitnessGoals?.includes('muscle-gain')) {
      suggestions.unshift("How much protein should I eat for muscle gain?");
      suggestions.unshift("What's a good strength training routine?");
    }

    if (user.dietaryPreference && user.dietaryPreference !== 'No Restrictions') {
      suggestions.unshift(`Can you suggest ${user.dietaryPreference} recipes?`);
    }

    res.json({
      success: true,
      suggestions: suggestions.slice(0, 8)
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  generateAIResponse,
  getSuggestedQuestions
};