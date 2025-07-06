from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Dict, Any
import logging

from models.mealplan import MealPlanRequest, MealPlanResponse, UserProfile
from services.mealplan_service import MealPlanService

logger = logging.getLogger(__name__)

# Initialize service
meal_plan_service = MealPlanService()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/generate-test", response_model=MealPlanResponse)
@limiter.limit("10/minute")
async def generate_test_meal_plan(request: Request):
    """Generate a test meal plan without authentication"""
    try:
        logger.info("Generating test meal plan without authentication")
        
        # Create a default user profile for testing
        default_profile = UserProfile(
            age=30,
            weight=70.0,
            height=175.0,
            gender="other",
            activity_level="moderately_active",
            fitness_goal="maintenance",
            dietary_preferences=[],
            allergies=[],
            disliked_foods=[],
            preferred_cuisines=[]
        )
        
        # Create meal plan request
        meal_plan_request = MealPlanRequest(
            user_profile=default_profile,
            budget_range="medium",
            cooking_skill="intermediate",
            meal_focus="balanced",
            max_prep_time=30,
            regenerate=False
        )
        
        # Generate meal plan
        meal_plan = await meal_plan_service.generate_meal_plan(meal_plan_request)
        meal_plan.user_id = "test_user"
        
        logger.info("Successfully generated test meal plan")
        
        return MealPlanResponse(
            success=True,
            message="Test meal plan generated successfully",
            data=meal_plan
        )
        
    except Exception as e:
        logger.error(f"Error generating test meal plan: {e}")
        return MealPlanResponse(
            success=False,
            message=f"Failed to generate test meal plan: {str(e)}"
        )

@router.post("/generate-daily-test", response_model=MealPlanResponse)
@limiter.limit("15/minute")
async def generate_daily_test_meal_plan(request: Request, daily_request: Dict[Any, Any]):
    """Generate a daily meal plan for cost-effective usage"""
    try:
        target_day = daily_request.get('target_day', 'Today')
        logger.info(f"Generating daily test meal plan for {target_day}")
        
        # Extract preferences from request
        preferences = daily_request.get('preferences', {})
        
        # Create a user profile from the request
        user_profile = UserProfile(
            age=preferences.get('age', 30),
            weight=preferences.get('weight', 70.0),
            height=preferences.get('height', 175.0),
            gender=preferences.get('gender', 'other'),
            activity_level=preferences.get('activity_level', 'moderately_active'),
            fitness_goal=preferences.get('fitness_goal', 'maintenance'),
            dietary_preferences=preferences.get('dietary_preferences', []),
            allergies=preferences.get('allergies', []),
            disliked_foods=preferences.get('disliked_foods', []),
            preferred_cuisines=preferences.get('preferred_cuisines', [])
        )
        
        # Create meal plan request for single day
        meal_plan_request = MealPlanRequest(
            user_profile=user_profile,
            budget_range=preferences.get('budget', 'medium'),
            cooking_skill=preferences.get('cooking_skill', 'intermediate'),
            meal_focus=preferences.get('meal_focus', 'balanced'),
            max_prep_time=preferences.get('max_prep_time', 30),
            regenerate=False
        )
        
        # Generate daily meal plan using the correct method
        meal_plan = await meal_plan_service.generate_meal_plan(meal_plan_request)
        meal_plan.user_id = "test_user"
        
        logger.info(f"Successfully generated daily test meal plan for {target_day}")
        
        return MealPlanResponse(
            success=True,
            message=f"Daily meal plan for {target_day} generated successfully",
            data=meal_plan
        )
        
    except Exception as e:
        logger.error(f"Error generating daily test meal plan: {e}")
        return MealPlanResponse(
            success=False,
            message=f"Failed to generate daily meal plan: {str(e)}"
        )