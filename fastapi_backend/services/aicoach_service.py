import os
import json
import re
import logging
from typing import List, Optional, Dict, Any
from google.generativeai import GenerativeModel, configure
from models.aicoach import ChatRequest, ChatResponse, Recipe, UserContext, ConversationMessage
from models.user import User

logger = logging.getLogger(__name__)

class AICoachService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Gemini API client"""
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            return
        
        try:
            configure(api_key=self.api_key)
            self.model = GenerativeModel(
                model_name="gemini-2.5-flash",
                generation_config={
                    "temperature": 0.7,
                    "top_k": 40,
                    "top_p": 0.95,
                    "max_output_tokens": 1024,
                }
            )
            logger.info("Gemini API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API client: {e}")
            self.model = None
    
    def _clean_response_text(self, text: str) -> str:
        """Clean AI response text by removing markdown formatting"""
        if not text:
            return ""
        
        # Remove markdown formatting
        cleaned = re.sub(r'\*\*', '', text)  # Remove bold
        cleaned = re.sub(r'\*', '', cleaned)  # Remove italic
        cleaned = re.sub(r'#{1,6}\s', '', cleaned)  # Remove headers
        cleaned = re.sub(r'```[\w]*\n?', '', cleaned)  # Remove code blocks
        cleaned = re.sub(r'```', '', cleaned)
        cleaned = re.sub(r'`', '', cleaned)  # Remove inline code
        cleaned = re.sub(r'^\s*[-*+]\s', '• ', cleaned, flags=re.MULTILINE)  # Convert lists
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)  # Clean extra newlines
        
        return cleaned.strip()
    
    def _build_user_context(self, user: User) -> UserContext:
        """Build user context from User model"""
        # Handle fitness goals - ensure it's a list
        fitness_goals = []
        if hasattr(user, 'fitness_goals'):
            if isinstance(user.fitness_goals, list):
                fitness_goals = user.fitness_goals
            elif isinstance(user.fitness_goals, str):
                fitness_goals = [user.fitness_goals]
        
        # Handle preferred workouts - ensure it's a list
        preferred_workouts = []
        if hasattr(user, 'preferred_workouts'):
            if isinstance(user.preferred_workouts, list):
                preferred_workouts = user.preferred_workouts
            elif isinstance(user.preferred_workouts, str):
                preferred_workouts = [user.preferred_workouts]
        
        return UserContext(
            name=user.first_name or "there",
            fitness_goals=fitness_goals,
            fitness_experience=getattr(user, 'fitness_experience', 'beginner'),
            dietary_preference=getattr(user, 'dietary_preference', 'No Restrictions'),
            workout_frequency=getattr(user, 'workout_frequency', 'not specified'),
            preferred_workouts=preferred_workouts
        )
    
    def _create_system_prompt(self, user_context: UserContext) -> str:
        """Create system prompt for AI coach"""
        goals_str = ', '.join(user_context.fitness_goals) if user_context.fitness_goals else 'general fitness'
        workouts_str = ', '.join(user_context.preferred_workouts) if user_context.preferred_workouts else 'various'
        
        return f"""You are an AI Fitness Coach for FitMe+. Be helpful, encouraging, and provide personalized advice.

User Profile:
- Name: {user_context.name}
- Goals: {goals_str}
- Experience: {user_context.fitness_experience}
- Diet: {user_context.dietary_preference}
- Workout Frequency: {user_context.workout_frequency}
- Preferred Workouts: {workouts_str}

Guidelines:
- Be supportive and motivational
- Provide evidence-based advice
- Help with workouts, nutrition, recipes, and app usage
- Use emojis appropriately
- Keep responses concise but helpful
- Do NOT use markdown formatting
- Write in plain text only
- End responses naturally

Respond to the user's message below."""
    
    def _build_conversation_context(self, system_prompt: str, conversation_history: List[ConversationMessage], current_message: str) -> str:
        """Build conversation context for API call"""
        context = system_prompt + '\n\n'
        
        # Add recent conversation history (last 6 messages)
        recent_history = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history
        
        for msg in recent_history:
            role = "User" if msg.role == "user" else "Assistant"
            context += f"{role}: {msg.content}\n"
        
        context += f"User: {current_message}\nAssistant:"
        return context
    
    def _needs_recipes(self, message: str) -> bool:
        """Check if the message requests recipes"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in ['recipe', 'meal', 'food', 'cook'])
    
    async def _generate_recipes(self, message: str, user_context: UserContext) -> Optional[List[Recipe]]:
        """Generate recipe suggestions based on user message"""
        if not self.model:
            return None
        
        try:
            goals_str = ', '.join(user_context.fitness_goals) if user_context.fitness_goals else 'general fitness'
            
            recipe_prompt = f"""Generate 2 healthy recipes related to: "{message}"
            
User preferences:
- Dietary: {user_context.dietary_preference}
- Goals: {goals_str}

Return ONLY a valid JSON array in this format:
[
  {{
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
  }}
]"""
            
            result = self.model.generate_content(recipe_prompt)
            response_text = result.text
            
            # Extract JSON from response
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                recipes_data = json.loads(json_match.group(0))
                recipes = []
                for recipe_data in recipes_data:
                    recipe = Recipe(**recipe_data)
                    recipes.append(recipe)
                return recipes
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating recipes: {e}")
            return None
    
    async def generate_chat_response(self, chat_request: ChatRequest, user: User) -> ChatResponse:
        """Generate AI coach response"""
        if not self.model:
            return ChatResponse(
                success=False,
                response="I'm having trouble connecting to the AI service. Please try again later.",
                message="AI service is not configured. Please contact administrator."
            )
        
        try:
            # Build user context
            user_context = self._build_user_context(user)
            
            # Create system prompt
            system_prompt = self._create_system_prompt(user_context)
            
            # Build conversation context
            conversation_context = self._build_conversation_context(
                system_prompt, 
                chat_request.conversation_history, 
                chat_request.message
            )
            
            logger.info(f"Generating response for user: {user.email}")
            logger.info(f"Context length: {len(conversation_context)}")
            
            # Generate response
            result = self.model.generate_content(conversation_context)
            raw_response = result.text
            
            # Clean response
            cleaned_response = self._clean_response_text(raw_response)
            
            # Check if recipes are needed
            recipes = None
            if self._needs_recipes(chat_request.message):
                recipes = await self._generate_recipes(chat_request.message, user_context)
            
            return ChatResponse(
                success=True,
                response=cleaned_response,
                recipes=recipes
            )
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            
            # Handle specific error types
            error_message = "I'm having trouble connecting right now. Please try again later."
            
            if "API_KEY_INVALID" in str(e):
                error_message = "The AI service is not properly configured. Please contact the administrator."
            elif "RATE_LIMIT_EXCEEDED" in str(e):
                error_message = "We've hit the rate limit. Please try again in a few moments."
            elif "QUOTA_EXCEEDED" in str(e):
                error_message = "AI service quota exceeded. Please try again later."
            
            return ChatResponse(
                success=False,
                response=error_message,
                message=str(e) if os.getenv("DEBUG") else "Internal server error"
            )
    
    def get_suggested_questions(self, user: User) -> List[str]:
        """Get personalized suggested questions based on user profile"""
        suggestions = [
            "How do I set up my workout routine?",
            "What's a good beginner workout plan?",
            "Can you suggest healthy recipes for weight loss?",
            "How can I track my nutrition effectively?",
            "What exercises are best for building muscle?",
            "How do I stay motivated with my fitness goals?",
            "Can you create a meal plan for my dietary preferences?",
            "What's the best way to track my progress?"
        ]
        
        # Add personalized suggestions based on user profile
        if hasattr(user, 'fitness_goals') and user.fitness_goals:
            if isinstance(user.fitness_goals, list):
                goals = user.fitness_goals
            else:
                goals = [user.fitness_goals]
            
            if 'weight-loss' in goals:
                suggestions.insert(0, "What are effective weight loss strategies?")
                suggestions.insert(1, "Can you suggest low-calorie recipes?")
            
            if 'muscle-gain' in goals:
                suggestions.insert(0, "How much protein should I eat for muscle gain?")
                suggestions.insert(1, "What's a good strength training routine?")
        
        if hasattr(user, 'dietary_preference') and user.dietary_preference and user.dietary_preference != 'No Restrictions':
            suggestions.insert(0, f"Can you suggest {user.dietary_preference} recipes?")
        
        return suggestions[:8]