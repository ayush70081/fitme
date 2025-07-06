import json
import logging
from typing import List, Dict, Any, Optional
import os
from datetime import datetime
import asyncio
import httpx
from dotenv import load_dotenv
from fastapi import HTTPException

from models.mealplan import (
    UserProfile, MealPlan, DayMealPlan, Meal, MealType, 
    NutritionInfo, MealPlanRequest
)
from services.nutrition_service import NutritionService
from utils.cache import CacheManager

logger = logging.getLogger(__name__)

# Try to import google.generativeai with error handling
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    logger.info(" google.generativeai module loaded successfully for meal planning")
except ImportError as e:
    logger.error(f"L Failed to import google.generativeai for meal planning: {e}")
    GENAI_AVAILABLE = False
    genai = None

class MealPlanService:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        # Initialize Gemini for meal planning
        self._init_gemini()
        
        # Initialize nutrition service
        self.nutrition_service = NutritionService()
        
        # Initialize cache
        self.cache = CacheManager()
    
    def _init_gemini(self):
        """Initialize Gemini model for meal planning"""
        # Check if the library is available
        if not GENAI_AVAILABLE:
            logger.error("L google.generativeai library not available for meal planning")
            return
            
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            logger.warning("L GEMINI_API_KEY not configured. Meal plan generation will use demo mode.")
            return
            
        try:
            logger.info(f"= Initializing Gemini for meal planning with API key: {self.gemini_api_key[:20]}...")
            
            # Configure Gemini
            genai.configure(api_key=self.gemini_api_key)
            logger.info(" Gemini API configured successfully for meal planning")
            
            # Try different model names in order of preference
            model_names = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro']
            
            for model_name in model_names:
                try:
                    logger.info(f">� Attempting to initialize meal planning model: {model_name}")
                    test_model = genai.GenerativeModel(model_name)
                    
                    # Test the model with a simple request
                    logger.info(f">� Testing meal planning model {model_name}...")
                    test_response = test_model.generate_content(
                        "Respond with just the word 'ready'",
                        generation_config=genai.types.GenerationConfig(
                            temperature=0.1,
                            top_p=0.8,
                            top_k=40,
                            max_output_tokens=10,
                        )
                    )
                    
                    if test_response and test_response.text:
                        self.model = test_model
                        logger.info(f" Successfully initialized Gemini model '{model_name}' for meal planning")
                        logger.info(f" Meal planning test response: '{test_response.text.strip()}'")
                        return
                    else:
                        logger.warning(f"� Meal planning model {model_name} responded but with empty text")
                        
                except Exception as model_error:
                    logger.error(f"L Failed to initialize meal planning model '{model_name}': {str(model_error)}")
                    continue
                    
            logger.error("L Failed to initialize any Gemini model for meal planning")
            self.model = None
                    
        except Exception as e:
            logger.error(f"L Failed to configure Gemini for meal planning: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            self.model = None

    async def generate_meal_plan(self, request: MealPlanRequest) -> MealPlan:
        """Generate a daily meal plan"""
        try:
            logger.info("Generating daily meal plan")
            
            if not self.model:
                logger.error("Gemini model not available - cannot generate meal plan")
                raise Exception("AI meal generation service is not available. Please check your connection and try again.")
            
            # Skip cache if regenerate is true
            if not request.regenerate:
                # Try to get from cache
                cache_key = f"meal_plan_{request.user_profile.dict()}"
                cached_plan = await self.cache.get(cache_key)
                if cached_plan:
                    logger.info("Returning cached meal plan")
                    return MealPlan.parse_obj(cached_plan)
            
            # Generate AI daily meal plan for today
            response = await self._call_gemini_daily_api(request, "Today")
            daily_data = self._parse_gemini_daily_response(response)
            
            # Enrich with nutrition
            enriched_plan = await self._enrich_daily_with_nutrition(daily_data, request.user_profile, "Today")
            
            # Cache the plan if not regenerating
            if not request.regenerate:
                cache_key = f"meal_plan_{request.user_profile.dict()}"
                await self.cache.set(cache_key, enriched_plan.dict(), expire=24*60*60)  # Cache for 24 hours
            
            logger.info("Successfully generated daily meal plan")
            return enriched_plan
            
        except Exception as e:
            logger.error(f"Error generating meal plan: {e}")
            raise Exception(f"Failed to generate meal plan: {str(e)}")
    
    async def generate_daily_meal_plan(self, request: MealPlanRequest, target_day: str) -> MealPlan:
        """Generate meal plan for a single day (cost-effective)"""
        try:
            logger.info(f"Generating daily meal plan for {target_day}")
            
            if not self.model:
                logger.error("Gemini model not available - cannot generate daily meal plan")
                raise Exception("AI meal generation service is not available. Please check your connection and try again.")
            
            # Generate AI daily meal plan
            response = await self._call_gemini_daily_api(request, target_day)
            daily_data = self._parse_gemini_daily_response(response)
            
            # Enrich with nutrition
            enriched_plan = await self._enrich_daily_with_nutrition(daily_data, request.user_profile, target_day)
            
            logger.info(f"Successfully generated daily meal plan for {target_day}")
            return enriched_plan
            
        except Exception as e:
            logger.error(f"Error generating daily meal plan: {e}")
            raise Exception(f"Failed to generate daily meal plan: {str(e)}")

    async def _generate_with_gemini(self, prompt: str) -> str:
        """Generate content using Gemini AI"""
        if not self.model:
            logger.error("Gemini model not available - cannot generate meal plan")
            raise Exception("AI meal generation service is not available. Please check your connection and try again.")
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=8192,
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            raise Exception(f"Gemini API error: {str(e)}")

    async def _call_gemini_daily_api(self, request: MealPlanRequest, target_day: str) -> str:
        """Call Gemini API for daily meal plan generation with nutrition info"""
        user_profile = request.user_profile
        
        # Get preferences from the request fields
        cuisine_pref = ""
        if user_profile.preferred_cuisines:
            cuisine_pref = f"Focus on {', '.join(user_profile.preferred_cuisines)} cuisine. "
        
        meal_focus = request.meal_focus or 'balanced'
        max_prep_time = request.max_prep_time or 30
        
        prompt = f'''
        Create a daily meal plan with detailed nutrition information for {target_day} for a person with these characteristics:
        - Age: {user_profile.age}, Weight: {user_profile.weight}kg, Height: {user_profile.height}cm
        - Gender: {user_profile.gender}, Activity: {user_profile.activity_level}
        - Fitness Goal: {user_profile.fitness_goal}
        - Dietary Preferences: {", ".join(user_profile.dietary_preferences) if user_profile.dietary_preferences else "None"}
        - Allergies: {", ".join(user_profile.allergies) if user_profile.allergies else "None"}
        - Dislikes: {", ".join(user_profile.disliked_foods) if user_profile.disliked_foods else "None"}
        - Cooking Skill: {request.cooking_skill or "intermediate"}
        
        Preferences for this day:
        - {cuisine_pref}
        - Meal focus: {meal_focus}
        - Maximum prep time per meal: {max_prep_time} minutes
        
        Return ONLY a JSON object with this exact structure. Include accurate nutrition information for each meal AND each ingredient:
        {{
            "day": "{target_day}",
            "breakfast": {{
                "name": "Meal Name",
                "description": "Brief description of the meal",
                "ingredients": [
                    {{
                        "name": "ingredient1",
                        "amount": "quantity with unit",
                        "nutrition": {{
                            "calories": number,
                            "protein": number,
                            "carbs": number,
                            "fat": number,
                            "fiber": number,
                            "sugar": number
                        }}
                    }}
                ],
                "instructions": ["step1", "step2", "step3"],
                "prep_time": number,
                "cuisine_type": "international/specific cuisine",
                "difficulty": "beginner/intermediate/advanced",
                "portion_size": "1 serving",
                "total_nutrition": {{
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fat": number,
                    "fiber": number,
                    "sugar": number
                }}
            }},
            "lunch": {{ same structure as breakfast }},
            "dinner": {{ same structure as breakfast }},
            "daily_totals": {{
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "fiber": number,
                "sugar": number
            }}
        }}
        
        Ensure all nutrition values are realistic and based on standard nutritional databases.
        All numerical values should be numbers, not strings.
        '''
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=8192,
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini API for daily plan: {e}")
            raise Exception(f"Gemini API error: {str(e)}")

    def _create_meal_plan_prompt(self, request: MealPlanRequest) -> str:
        """Create prompt for weekly meal plan generation"""
        user_profile = request.user_profile
        
        prompt = f'''
        Create a 7-day meal plan for a person with these characteristics:
        - Age: {user_profile.age}, Weight: {user_profile.weight}kg, Height: {user_profile.height}cm
        - Gender: {user_profile.gender}, Activity: {user_profile.activity_level}
        - Fitness Goal: {user_profile.fitness_goal}
        - Dietary Preferences: {", ".join(user_profile.dietary_preferences) if user_profile.dietary_preferences else "None"}
        - Allergies: {", ".join(user_profile.allergies) if user_profile.allergies else "None"}
        - Dislikes: {", ".join(user_profile.disliked_foods) if user_profile.disliked_foods else "None"}
        - Cooking Skill: {request.cooking_skill or "intermediate"}
        
        Return ONLY a valid JSON object with this structure:
        {{
            "plan_name": "Weekly Meal Plan",
            "days": [
                {{
                    "day": "Monday",
                    "breakfast": {{"name": "...", "ingredients": [...], "instructions": [...], "prep_time": 0, "cook_time": 0, "serving_size": 1, "meal_type": "breakfast"}},
                    "lunch": {{"name": "...", "ingredients": [...], "instructions": [...], "prep_time": 0, "cook_time": 0, "serving_size": 1, "meal_type": "lunch"}},
                    "dinner": {{"name": "...", "ingredients": [...], "instructions": [...], "prep_time": 0, "cook_time": 0, "serving_size": 1, "meal_type": "dinner"}}
                }}
                // ... repeat for Tuesday through Sunday
            ]
        }}
        '''
        return prompt

    def _parse_gemini_response(self, response: str) -> Dict[str, Any]:
        """Parse Gemini response into meal plan data"""
        try:
            # Clean the response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            
            # Parse JSON
            meal_plan_data = json.loads(response)
            
            # Validate structure
            if "days" not in meal_plan_data:
                raise ValueError("Invalid response structure: missing 'days'")
            
            if len(meal_plan_data["days"]) != 7:
                raise ValueError(f"Expected 7 days, got {len(meal_plan_data['days'])}")
            
            return meal_plan_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            logger.error(f"Response: {response}")
            raise ValueError(f"Invalid JSON response from AI: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            raise ValueError(f"Error parsing AI response: {str(e)}")

    def _parse_gemini_daily_response(self, response: str) -> Dict[str, Any]:
        """Parse Gemini response for daily meal plan"""
        try:
            # Clean the response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]
            
            # Parse JSON
            daily_data = json.loads(response)
            
            # Validate structure
            required_meals = ["breakfast", "lunch", "dinner"]
            for meal in required_meals:
                if meal not in daily_data:
                    raise ValueError(f"Missing {meal} in daily plan")
            
            return daily_data
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error for daily plan: {e}")
            logger.error(f"Response: {response}")
            raise ValueError(f"Invalid JSON response from AI: {str(e)}")
        except Exception as e:
            logger.error(f"Error parsing daily response: {e}")
            raise ValueError(f"Error parsing AI daily response: {str(e)}")

    async def _enrich_with_nutrition(self, meal_plan_data: Dict[str, Any], user_profile: UserProfile) -> MealPlan:
        """Enrich meal plan with nutrition data"""
        try:
            days = []
            weekly_nutrition = NutritionInfo(calories=0, protein=0, carbs=0, fat=0)
            
            for day_data in meal_plan_data["days"]:
                day_meals = []
                daily_nutrition = NutritionInfo(calories=0, protein=0, carbs=0, fat=0)
                
                for meal_type in ["breakfast", "lunch", "dinner"]:
                    if meal_type in day_data:
                        meal_data = day_data[meal_type]
                        
                        # Get nutrition for this meal
                        meal_nutrition = await self.nutrition_service.analyze_meal(
                            meal_data["ingredients"],
                            meal_data.get("serving_size", 1)
                        )
                        
                        # Create meal object
                        meal = Meal(
                            name=meal_data["name"],
                            ingredients=meal_data["ingredients"],
                            instructions=meal_data["instructions"],
                            prep_time=meal_data["prep_time"],
                            cook_time=meal_data["cook_time"],
                            serving_size=meal_data["serving_size"],
                            meal_type=MealType(meal_type),
                            nutrition=meal_nutrition
                        )
                        
                        day_meals.append(meal)
                        
                        # Add to daily totals
                        if meal_nutrition:
                            daily_nutrition.calories += meal_nutrition.calories
                            daily_nutrition.protein += meal_nutrition.protein
                            daily_nutrition.carbs += meal_nutrition.carbs
                            daily_nutrition.fat += meal_nutrition.fat
                
                # Create day meal plan
                day_plan = DayMealPlan(
                    day=day_data["day"],
                    breakfast=day_meals[0] if len(day_meals) > 0 else None,
                    lunch=day_meals[1] if len(day_meals) > 1 else None,
                    dinner=day_meals[2] if len(day_meals) > 2 else None,
                    daily_nutrition=daily_nutrition
                )
                
                days.append(day_plan)
                
                # Add to weekly totals
                weekly_nutrition.calories += daily_nutrition.calories
                weekly_nutrition.protein += daily_nutrition.protein
                weekly_nutrition.carbs += daily_nutrition.carbs
                weekly_nutrition.fat += daily_nutrition.fat
            
            # For the new daily-focused model, just return the first day's plan
            if days:
                first_day = days[0]
                return MealPlan(
                    user_id="temp_user_id",
                    meals=first_day,
                    preferences={}
                )
            else:
                # Return empty meal plan
                return MealPlan(
                    user_id="temp_user_id",
                    meals=DayMealPlan(),
                    preferences={}
                )
            
        except Exception as e:
            logger.error(f"Error enriching meal plan with nutrition: {e}")
            # Return without nutrition data if enrichment fails
            return self._create_basic_meal_plan(meal_plan_data, user_profile)

    async def _enrich_daily_with_nutrition(self, daily_data: Dict[str, Any], user_profile: UserProfile, target_day: str) -> MealPlan:
        """Enrich daily meal plan with nutrition data from the response"""
        try:
            # Create meals by type
            breakfast_meal = None
            lunch_meal = None
            dinner_meal = None
            
            for meal_type in ["breakfast", "lunch", "dinner"]:
                if meal_type in daily_data:
                    meal_data = daily_data[meal_type]
                    
                    # Get ingredients with their nutrition info
                    ingredients = [ingredient["name"] for ingredient in meal_data["ingredients"]]
                    
                    # Create meal nutrition info from the total_nutrition in response
                    meal_nutrition = NutritionInfo(
                        calories=meal_data["total_nutrition"]["calories"],
                        protein=meal_data["total_nutrition"]["protein"],
                        carbs=meal_data["total_nutrition"]["carbs"],
                        fat=meal_data["total_nutrition"]["fat"],
                        fiber=meal_data["total_nutrition"]["fiber"],
                        sugar=meal_data["total_nutrition"]["sugar"],
                        sodium=0,  # These values aren't in the response
                        cholesterol=0,
                        saturated_fat=0
                    )
                    
                    # Create meal object with all required fields
                    meal = Meal(
                        name=meal_data["name"],
                        description=meal_data["description"],
                        ingredients=ingredients,
                        instructions=meal_data["instructions"],
                        prep_time=meal_data["prep_time"],
                        nutrition=meal_nutrition,
                        cuisine_type=meal_data["cuisine_type"],
                        difficulty=meal_data["difficulty"],
                        portion_size=meal_data["portion_size"]
                    )
                    
                    # Assign meal to correct variable
                    if meal_type == "breakfast":
                        breakfast_meal = meal
                    elif meal_type == "lunch":
                        lunch_meal = meal
                    else:
                        dinner_meal = meal
            
            # Create day meal plan using daily totals from response
            day_plan = DayMealPlan(
                breakfast=breakfast_meal,
                lunch=lunch_meal,
                dinner=dinner_meal,
                total_calories=daily_data["daily_totals"]["calories"],
                total_protein=daily_data["daily_totals"]["protein"],
                total_carbs=daily_data["daily_totals"]["carbs"],
                total_fat=daily_data["daily_totals"]["fat"]
            )
            
            # Create and return meal plan
            return MealPlan(
                user_id="temp_user_id",
                meals=day_plan,
                preferences={},
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error enriching daily plan with nutrition: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to enrich meal plan with nutrition data: {str(e)}"
            )

    def _create_basic_meal_plan(self, meal_plan_data: Dict[str, Any], user_profile: UserProfile) -> MealPlan:
        """Create meal plan without nutrition enrichment"""
        days = []
        
        for day_data in meal_plan_data["days"]:
            day_meals = []
            
            for meal_type in ["breakfast", "lunch", "dinner"]:
                if meal_type in day_data:
                    meal_data = day_data[meal_type]
                    
                    meal = Meal(
                        name=meal_data["name"],
                        ingredients=meal_data["ingredients"],
                        instructions=meal_data["instructions"],
                        prep_time=meal_data["prep_time"],
                        cook_time=meal_data["cook_time"],
                        serving_size=meal_data["serving_size"],
                        meal_type=MealType(meal_type)
                    )
                    
                    day_meals.append(meal)
            
            day_plan = DayMealPlan(
                day=day_data["day"],
                breakfast=day_meals[0] if len(day_meals) > 0 else None,
                lunch=day_meals[1] if len(day_meals) > 1 else None,
                dinner=day_meals[2] if len(day_meals) > 2 else None
            )
            
            days.append(day_plan)
        
        # For the new daily-focused model, just return the first day's plan
        if days:
            first_day = days[0]
            return MealPlan(
                user_id="temp_user_id",
                meals=first_day,
                preferences={}
            )
        else:
            # Return empty meal plan
            return MealPlan(
                user_id="temp_user_id",
                meals=DayMealPlan(),
                preferences={}
            )

    def _create_basic_daily_plan(self, daily_data: Dict[str, Any], target_day: str) -> MealPlan:
        """Create daily meal plan without nutrition enrichment"""
        breakfast_meal = None
        lunch_meal = None
        dinner_meal = None
        
        for meal_type in ["breakfast", "lunch", "dinner"]:
            if meal_type in daily_data:
                meal_data = daily_data[meal_type]
                
                meal = Meal(
                    name=meal_data["name"],
                    description=meal_data.get("description", ""),
                    ingredients=meal_data["ingredients"],
                    instructions=meal_data["instructions"],
                    prep_time=meal_data["prep_time"]
                )
                
                # Assign to correct meal type
                if meal_type == "breakfast":
                    breakfast_meal = meal
                elif meal_type == "lunch":
                    lunch_meal = meal
                elif meal_type == "dinner":
                    dinner_meal = meal
        
        day_plan = DayMealPlan(
            breakfast=breakfast_meal,
            lunch=lunch_meal,
            dinner=dinner_meal
        )
        
        return MealPlan(
            user_id="temp_user_id",
            meals=day_plan,
            preferences={}
        )