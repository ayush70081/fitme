import logging
import os
import json
from typing import List, Dict, Optional, Any
import re
import asyncio
from dotenv import load_dotenv
from models.mealplan import NutritionInfo
from utils.cache import CacheManager

# Load environment variables
load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)

# Try to import google.generativeai with error handling
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
    logger.info("[+] google.generativeai module loaded successfully")
except ImportError as e:
    logger.error(f"[-] Failed to import google.generativeai: {e}")
    GENAI_AVAILABLE = False
    genai = None

class NutritionService:
    def __init__(self):
        self.cache = CacheManager()
        
        # Initialize Gemini for nutrition analysis
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # Debug: Print API key status
        logger.info(f"Nutrition Service - Gemini API Key configured: {bool(self.gemini_api_key and self.gemini_api_key != 'your_gemini_api_key_here')}")
        if self.gemini_api_key:
            logger.info(f"Nutrition Service - API Key preview: {self.gemini_api_key[:20]}...")
        
        # Initialize Gemini model
        self.gemini_model = None
        self._init_gemini()
        
        # Common portion size mappings
        self.portion_mappings = {
            "cup": 240,
            "cups": 240,
            "tablespoon": 15,
            "tablespoons": 15,
            "tbsp": 15,
            "teaspoon": 5,
            "teaspoons": 5,
            "tsp": 5,
            "ounce": 28,
            "ounces": 28,
            "oz": 28,
            "pound": 454,
            "pounds": 454,
            "lb": 454,
            "lbs": 454,
            "gram": 1,
            "grams": 1,
            "g": 1,
            "kilogram": 1000,
            "kilograms": 1000,
            "kg": 1000,
            "slice": 25,
            "slices": 25,
            "piece": 100,
            "pieces": 100,
            "medium": 150,
            "large": 200,
            "small": 100,
        }
    
    async def analyze_meal(self, ingredients: List[str], serving_size: int = 1) -> Optional[NutritionInfo]:
        """Analyze nutrition for a complete meal"""
        try:
            total_nutrition = NutritionInfo(
                calories=0, protein=0, carbs=0, fat=0,
                fiber=0, sugar=0, sodium=0,
                cholesterol=0, saturated_fat=0
            )
            
            for ingredient in ingredients:
                ingredient_nutrition = await self.get_ingredient_nutrition(ingredient)
                if ingredient_nutrition:
                    # Add all nutritional values
                    total_nutrition.calories += ingredient_nutrition.calories
                    total_nutrition.protein += ingredient_nutrition.protein
                    total_nutrition.carbs += ingredient_nutrition.carbs
                    total_nutrition.fat += ingredient_nutrition.fat
                    total_nutrition.fiber += ingredient_nutrition.fiber
                    total_nutrition.sugar += ingredient_nutrition.sugar
                    total_nutrition.sodium += ingredient_nutrition.sodium
                    total_nutrition.cholesterol += ingredient_nutrition.cholesterol
                    total_nutrition.saturated_fat += ingredient_nutrition.saturated_fat
            
            # Adjust for serving size
            if serving_size != 1:
                total_nutrition.calories *= serving_size
                total_nutrition.protein *= serving_size
                total_nutrition.carbs *= serving_size
                total_nutrition.fat *= serving_size
                total_nutrition.fiber *= serving_size
                total_nutrition.sugar *= serving_size
                total_nutrition.sodium *= serving_size
                total_nutrition.cholesterol *= serving_size
                total_nutrition.saturated_fat *= serving_size
            
            logger.info(f"Meal nutrition analysis complete: {total_nutrition.calories:.1f} kcal, "
                       f"{total_nutrition.protein:.1f}g protein, {total_nutrition.carbs:.1f}g carbs, "
                       f"{total_nutrition.fat:.1f}g fat")
            
            return total_nutrition
            
        except Exception as e:
            logger.error(f"Error analyzing meal nutrition: {e}")
            return None
    
    def _normalize_ingredient_name(self, ingredient: str) -> str:
        """Normalize ingredient name for better cache hits"""
        # Remove quantities and units
        cleaned = re.sub(r'\d+\.?\d*\s*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|ounce|ounces|oz|pound|pounds|lb|lbs|gram|grams|g|kilogram|kilograms|kg|slice|slices|piece|pieces|medium|large|small)', '', ingredient.lower())
        
        # Remove common modifiers
        cleaned = re.sub(r'\b(fresh|dried|cooked|raw|grilled|baked|steamed|boiled|chopped|diced|sliced|minced|about|optional|to taste)\b', '', cleaned)
        
        # Remove special characters and extra spaces
        cleaned = re.sub(r'[^\w\s]', '', cleaned)
        cleaned = ' '.join(cleaned.split())
        
        return cleaned.strip()

    async def get_ingredient_nutrition(self, ingredient: str, fitness_goal: str = None) -> Optional[NutritionInfo]:
        """Get nutrition data for a single ingredient using Gemini AI"""
        try:
            # Parse ingredient and quantity
            food_name, quantity_grams = self._parse_ingredient(ingredient)
            
            # Normalize the ingredient name for caching
            normalized_name = self._normalize_ingredient_name(food_name)
            
            # Check cache first with normalized name
            cache_key = f"nutrition_{normalized_name}"
            cached_data = await self.cache.get(cache_key)
            
            base_nutrition = None
            if cached_data:
                base_nutrition = NutritionInfo.parse_obj(cached_data)
            else:
                # These ingredients don't need Gemini API calls
                if normalized_name in ['salt', 'pepper', 'water', 'ice']:
                    base_nutrition = NutritionInfo()  # Zero nutrition
                elif any(word in normalized_name for word in ['seasoning', 'spice', 'herb', 'herbs']):
                    base_nutrition = NutritionInfo(calories=5, protein=0.1, carbs=1, fat=0.1)
                else:
                    # Get nutrition from Gemini AI for 100g portion
                    logger.info(f"Analyzing nutrition for '{normalized_name}' using Gemini AI")
                    base_nutrition = await self._get_nutrition_from_gemini(normalized_name, 100.0, fitness_goal)
                    
                    if base_nutrition:
                        # Cache the 100g base values
                        await self.cache.set(cache_key, base_nutrition.dict(), expire=7*24*60*60)  # Cache for 7 days
            
            if base_nutrition:
                # Scale nutrition based on actual quantity
                scale_factor = quantity_grams / 100.0
                return NutritionInfo(
                    calories=base_nutrition.calories * scale_factor,
                    protein=base_nutrition.protein * scale_factor,
                    carbs=base_nutrition.carbs * scale_factor,
                    fat=base_nutrition.fat * scale_factor,
                    fiber=base_nutrition.fiber * scale_factor,
                    sugar=base_nutrition.sugar * scale_factor,
                    sodium=base_nutrition.sodium * scale_factor,
                    cholesterol=base_nutrition.cholesterol * scale_factor,
                    saturated_fat=base_nutrition.saturated_fat * scale_factor
                )
            
            # Fallback to estimated nutrition
            logger.warning(f"Using estimated nutrition for '{food_name}'")
            return self._get_estimated_nutrition(food_name, quantity_grams)
            
        except Exception as e:
            logger.error(f"Error getting ingredient nutrition for '{ingredient}': {e}")
            food_name, quantity_grams = self._parse_ingredient(ingredient)
            return self._get_estimated_nutrition(food_name, quantity_grams)
    
    def _init_gemini(self):
        """Initialize Gemini model for nutrition analysis"""
        if not GENAI_AVAILABLE:
            logger.error("[-] google.generativeai library not available")
            return
            
        if not self.gemini_api_key or self.gemini_api_key == "your_gemini_api_key_here":
            logger.warning("[-] Gemini API key not configured, nutrition analysis will use estimates")
            return
            
        try:
            logger.info(f"[*] Initializing Gemini for nutrition analysis...")
            
            # Configure Gemini
            genai.configure(api_key=self.gemini_api_key)
            logger.info("[+] Gemini API configured successfully")
            
            # Try different model names in order of preference
            model_names = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro']
            
            for model_name in model_names:
                try:
                    logger.info(f"[*] Testing model: {model_name}")
                    test_model = genai.GenerativeModel(model_name)
                    
                    # Test the model
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
                        self.gemini_model = test_model
                        logger.info(f"[+] Successfully initialized Gemini model '{model_name}' for nutrition analysis")
                        return
                        
                except Exception as model_error:
                    logger.error(f"[-] Failed to initialize model '{model_name}': {str(model_error)}")
                    continue
                    
            logger.error("[-] Failed to initialize any Gemini model for nutrition analysis")
            self.gemini_model = None
                    
        except Exception as e:
            logger.error(f"[-] Failed to configure Gemini for nutrition analysis: {str(e)}")
            self.gemini_model = None
    
    def _get_required_nutrients(self, fitness_goal: str = None) -> List[str]:
        """Determine which nutrients to fetch based on user's fitness goal"""
        # Base nutrients always needed
        base_nutrients = ["calories"]
        
        if not fitness_goal:
            return base_nutrients + ["protein", "carbs", "fat"]
            
        goal_specific_nutrients = {
            "weight_loss": [
                "calories",
                "protein",  # Important for preserving muscle
                "fat"      # Important for satiety
            ],
            "muscle_gain": [
                "calories",
                "protein",  # Critical for muscle building
                "carbs"    # Important for energy and recovery
            ],
            "maintenance": [
                "calories",
                "protein",
                "carbs",
                "fat"
            ],
            "endurance": [
                "calories",
                "carbs",    # Primary focus for endurance
                "protein"   # Secondary for recovery
            ]
        }
        
        return goal_specific_nutrients.get(fitness_goal.lower(), base_nutrients)

    async def _get_nutrition_from_gemini(self, food_name: str, quantity_grams: float, fitness_goal: str = None) -> Optional[NutritionInfo]:
        """Get nutrition data using Gemini AI"""
        try:
            # Get required nutrients based on fitness goal
            required_nutrients = self._get_required_nutrients(fitness_goal)
            nutrients_str = ", ".join(required_nutrients)
            
            prompt = f"""
            Analyze the nutritional content of {quantity_grams}g of {food_name}.
            
            Please provide accurate nutritional information for the following nutrients only: {nutrients_str}.
            Return the data in this exact JSON format:
            {{
                "calories": <number>,
                "protein": <number in grams>,
                "carbs": <number in grams>,
                "fat": <number in grams>
            }}
            
            Only include the requested nutrients. Provide realistic values based on standard nutritional databases.
            """
            
            # Generate content asynchronously
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=8192,
                )
            )
            
            if not response or not response.text:
                logger.error(f"No response from Gemini for '{food_name}'")
                return None
                
            # Extract JSON from response
            json_str = self._extract_json_from_response(response.text)
            if not json_str:
                logger.error(f"Could not extract JSON from Gemini response for '{food_name}'")
                return None
                
            # Parse nutrition data
            nutrition_data = json.loads(json_str)
            
            # Create NutritionInfo with default values
            nutrition_info = NutritionInfo()
            
            # Update only the required nutrients
            for nutrient in required_nutrients:
                if nutrient in nutrition_data:
                    setattr(nutrition_info, nutrient, float(nutrition_data[nutrient]))
            
            return nutrition_info
            
        except Exception as e:
            logger.error(f"Error getting nutrition from Gemini for '{food_name}': {e}")
            return None
    
    def _extract_json_from_response(self, response_text: str) -> Optional[str]:
        """Extract JSON from Gemini response"""
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        response_text = response_text.strip()
        
        return response_text
    
    def _parse_ingredient(self, ingredient: str) -> tuple[str, float]:
        """Parse ingredient string to extract food name and quantity"""
        try:
            # Remove cooking methods and adjectives
            cleaned = re.sub(r'\b(fresh|dried|cooked|raw|grilled|baked|steamed|boiled|chopped|diced|sliced|minced)\b', '', ingredient.lower())
            
            # Look for quantity patterns
            quantity_pattern = r'(\d+\.?\d*)\s*(cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|ounce|ounces|oz|pound|pounds|lb|lbs|gram|grams|g|kilogram|kilograms|kg|slice|slices|piece|pieces|medium|large|small)'
            
            match = re.search(quantity_pattern, cleaned)
            if match:
                quantity = float(match.group(1))
                unit = match.group(2).lower()
                food_name = re.sub(quantity_pattern, '', cleaned).strip()
                
                # Convert to grams
                quantity_grams = quantity * self.portion_mappings.get(unit, 100)
            else:
                # Default quantity
                food_name = cleaned.strip()
                quantity_grams = 100  # Default to 100g
            
            # Clean up food name
            food_name = re.sub(r'\s+', ' ', food_name).strip()
            food_name = re.sub(r'[^\w\s]', '', food_name)
            
            return food_name, quantity_grams
            
        except Exception as e:
            logger.error(f"Error parsing ingredient '{ingredient}': {e}")
            return ingredient.lower(), 100
    
    def _get_estimated_nutrition(self, food_name: str, quantity_grams: float) -> NutritionInfo:
        """Get estimated nutrition when Gemini is not available"""
        food_name_lower = food_name.lower()
        
        # Protein sources
        if any(word in food_name_lower for word in ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'egg', 'tofu']):
            calories_per_100g = 150
            protein_per_100g = 20
            carbs_per_100g = 0
            fat_per_100g = 8
        
        # Grains and starches
        elif any(word in food_name_lower for word in ['rice', 'pasta', 'bread', 'oats', 'quinoa', 'potato']):
            calories_per_100g = 120
            protein_per_100g = 4
            carbs_per_100g = 25
            fat_per_100g = 1
        
        # Vegetables
        elif any(word in food_name_lower for word in ['broccoli', 'spinach', 'carrot', 'tomato', 'pepper', 'onion', 'lettuce']):
            calories_per_100g = 25
            protein_per_100g = 2
            carbs_per_100g = 5
            fat_per_100g = 0
        
        # Fruits
        elif any(word in food_name_lower for word in ['apple', 'banana', 'orange', 'berry', 'grape', 'pear']):
            calories_per_100g = 50
            protein_per_100g = 1
            carbs_per_100g = 12
            fat_per_100g = 0
        
        # Dairy
        elif any(word in food_name_lower for word in ['milk', 'cheese', 'yogurt', 'butter']):
            calories_per_100g = 100
            protein_per_100g = 8
            carbs_per_100g = 5
            fat_per_100g = 6
        
        # Oils and fats
        elif any(word in food_name_lower for word in ['oil', 'butter', 'avocado', 'nuts', 'seeds']):
            calories_per_100g = 500
            protein_per_100g = 5
            carbs_per_100g = 5
            fat_per_100g = 50
        
        # Default
        else:
            calories_per_100g = 100
            protein_per_100g = 3
            carbs_per_100g = 15
            fat_per_100g = 3
        
        # Calculate for actual quantity
        multiplier = quantity_grams / 100
        
        return NutritionInfo(
            calories=calories_per_100g * multiplier,
            protein=protein_per_100g * multiplier,
            carbs=carbs_per_100g * multiplier,
            fat=fat_per_100g * multiplier,
            fiber=2 * multiplier,  # Basic estimate
            sugar=5 * multiplier,  # Basic estimate
            sodium=100 * multiplier,  # Basic estimate in mg
            cholesterol=0,
            saturated_fat=fat_per_100g * 0.3 * multiplier  # Estimate 30% of fat as saturated
        )