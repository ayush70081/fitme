import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from services.mealplan_service import MealPlanService
from models.mealplan import UserProfile, MealPlanRequest, FitnessGoal, DietaryPreference

@pytest.fixture
def sample_user_profile():
    return UserProfile(
        age=30,
        weight=70.0,
        height=175.0,
        gender="male",
        activity_level="moderately_active",
        fitness_goal=FitnessGoal.MAINTENANCE,
        dietary_preferences=[DietaryPreference.VEGETARIAN],
        allergies=[],
        disliked_foods=[],
        preferred_cuisines=["italian"]
    )

@pytest.fixture
def sample_meal_plan_request(sample_user_profile):
    return MealPlanRequest(
        user_profile=sample_user_profile,
        preferences={},
        regenerate=False
    )

@pytest.fixture
def mock_gemini_response():
    return '''
    {
        "plan_name": "Vegetarian Weekly Meal Plan",
        "days": [
            {
                "day": "Monday",
                "breakfast": {
                    "name": "Greek Yogurt with Berries",
                    "ingredients": ["greek yogurt", "mixed berries", "honey"],
                    "instructions": ["Mix yogurt with berries", "Drizzle with honey"],
                    "prep_time": 5,
                    "cook_time": 0,
                    "serving_size": 1,
                    "meal_type": "breakfast"
                },
                "lunch": {
                    "name": "Quinoa Salad",
                    "ingredients": ["quinoa", "cucumber", "tomatoes", "feta cheese"],
                    "instructions": ["Cook quinoa", "Chop vegetables", "Mix with feta"],
                    "prep_time": 15,
                    "cook_time": 10,
                    "serving_size": 1,
                    "meal_type": "lunch"
                },
                "dinner": {
                    "name": "Vegetable Pasta",
                    "ingredients": ["pasta", "zucchini", "bell peppers", "olive oil"],
                    "instructions": ["Cook pasta", "Sauté vegetables", "Combine"],
                    "prep_time": 10,
                    "cook_time": 15,
                    "serving_size": 2,
                    "meal_type": "dinner"
                }
            }
        ]
    }
    '''

class TestMealPlanService:
    
    @pytest.fixture(autouse=True)
    def setup_method(self):
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'test_key'}):
            self.service = MealPlanService()
    
    def test_initialization(self):
        """Test that MealPlanService initializes correctly"""
        assert self.service.gemini_api_key == 'test_key'
        assert self.service.meal_examples is not None
        assert len(self.service.meal_examples) > 0
    
    def test_get_similar_examples(self):
        """Test RAG example retrieval"""
        query = "vegetarian breakfast weight loss"
        examples = self.service._get_similar_examples(query, top_k=2)
        
        assert isinstance(examples, list)
        assert len(examples) <= 2
    
    def test_build_meal_generation_prompt(self, sample_user_profile):
        """Test prompt generation"""
        prompt = self.service._build_meal_generation_prompt(sample_user_profile)
        
        assert "User Profile:" in prompt
        assert "Age: 30" in prompt
        assert "vegetarian" in prompt.lower()
        assert "JSON" in prompt
    
    def test_parse_gemini_response_valid(self, mock_gemini_response):
        """Test parsing valid Gemini response"""
        result = self.service._parse_gemini_response(mock_gemini_response)
        
        assert "days" in result
        assert len(result["days"]) == 1
        assert result["days"][0]["day"] == "Monday"
        assert "breakfast" in result["days"][0]
    
    def test_parse_gemini_response_invalid(self):
        """Test parsing invalid Gemini response"""
        invalid_response = "This is not valid JSON"
        
        with pytest.raises(ValueError):
            self.service._parse_gemini_response(invalid_response)
    
    @pytest.mark.asyncio
    async def test_generate_meal_plan_success(self, sample_meal_plan_request, mock_gemini_response):
        """Test successful meal plan generation"""
        with patch.object(self.service, '_generate_with_gemini', return_value=mock_gemini_response):
            with patch.object(self.service.nutrition_service, 'analyze_meal', return_value=None):
                with patch.object(self.service.cache, 'get', return_value=None):
                    with patch.object(self.service.cache, 'set', return_value=True):
                        
                        result = await self.service.generate_meal_plan(sample_meal_plan_request)
                        
                        assert result is not None
                        assert result.plan_name == "Vegetarian Weekly Meal Plan"
                        assert len(result.days) == 1
                        assert result.days[0].day == "Monday"
    
    @pytest.mark.asyncio
    async def test_generate_meal_plan_cached(self, sample_meal_plan_request):
        """Test meal plan generation with cached result"""
        cached_plan = {
            "plan_name": "Cached Plan",
            "days": [],
            "user_id": "test_user"
        }
        
        with patch.object(self.service.cache, 'get', return_value=cached_plan):
            result = await self.service.generate_meal_plan(sample_meal_plan_request)
            
            assert result.plan_name == "Cached Plan"
    
    @pytest.mark.asyncio
    async def test_generate_meal_plan_error(self, sample_meal_plan_request):
        """Test meal plan generation with error"""
        with patch.object(self.service, '_generate_with_gemini', side_effect=Exception("API Error")):
            
            with pytest.raises(Exception) as exc_info:
                await self.service.generate_meal_plan(sample_meal_plan_request)
            
            assert "Failed to generate meal plan" in str(exc_info.value)

if __name__ == "__main__":
    pytest.main([__file__])