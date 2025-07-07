from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from typing import List, Optional
from datetime import datetime
import logging

from models.mealplan import (
    MealPlanRequest, MealPlanResponse, MealPlan,
    UserProfile, NutrientSearchRequest, NutrientSearchResponse
)
from models.user import User
from services.mealplan_service import MealPlanService
from services.nutrition_service import NutritionService
from utils.auth import get_current_active_user
from utils.database import get_collection

logger = logging.getLogger(__name__)

# Initialize services
meal_plan_service = MealPlanService()
nutrition_service = NutritionService()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/generate", response_model=MealPlanResponse)
@limiter.limit("5/minute")
async def generate_meal_plan(
    request: Request,
    meal_plan_request: MealPlanRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Generate a daily meal plan for the current user"""
    try:
        logger.info(f"Generating meal plan for user: {current_user.email} (ID: {current_user.id})")
        logger.info(f"User profile: age={getattr(current_user, 'age', 'N/A')}, weight={getattr(current_user, 'weight', 'N/A')}")
        
        # Set regenerate flag if specified
        meal_plan_request.regenerate = meal_plan_request.regenerate or False
        
        # Generate meal plan
        meal_plan = await meal_plan_service.generate_meal_plan(meal_plan_request)
        meal_plan.user_id = current_user.id
        
        # Save to database
        meal_plans_collection = await get_collection("meal_plans")
        
        # If regenerating, delete old plans first
        if meal_plan_request.regenerate:
            await meal_plans_collection.delete_many({"user_id": current_user.id})
        
        meal_plan_dict = meal_plan.dict()
        meal_plan_dict["_id"] = meal_plan_dict.pop("id", None)
        
        result = await meal_plans_collection.insert_one(meal_plan_dict)
        meal_plan.id = str(result.inserted_id)
        
        logger.info(f"Successfully generated meal plan with ID: {meal_plan.id}")
        
        return MealPlanResponse(
            success=True,
            message="Meal plan generated successfully",
            data=meal_plan
        )
        
    except Exception as e:
        logger.error(f"Error generating meal plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate meal plan: {str(e)}"
        )

@router.get("/", response_model=List[MealPlan])
async def get_user_meal_plans(
    current_user: User = Depends(get_current_active_user),
    limit: int = 10,
    skip: int = 0
):
    """Get meal plans for the current user"""
    try:
        meal_plans_collection = await get_collection("meal_plans")
        
        cursor = meal_plans_collection.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        meal_plans = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            meal_plans.append(MealPlan.parse_obj(doc))
        
        return meal_plans
        
    except Exception as e:
        logger.error(f"Error fetching meal plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch meal plans"
        )

@router.get("/{plan_id}", response_model=MealPlan)
async def get_meal_plan(
    plan_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific meal plan by ID"""
    try:
        meal_plans_collection = await get_collection("meal_plans")
        
        # Convert plan_id to ObjectId format if needed
        from bson import ObjectId
        if ObjectId.is_valid(plan_id):
            query = {"_id": ObjectId(plan_id), "user_id": current_user.id}
        else:
            query = {"id": plan_id, "user_id": current_user.id}
        
        doc = await meal_plans_collection.find_one(query)
        
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan not found"
            )
        
        doc["id"] = str(doc.pop("_id"))
        return MealPlan.parse_obj(doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching meal plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch meal plan"
        )

@router.delete("/{plan_id}")
async def delete_meal_plan(
    plan_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a meal plan"""
    try:
        meal_plans_collection = await get_collection("meal_plans")
        
        # Convert plan_id to ObjectId format if needed
        from bson import ObjectId
        if ObjectId.is_valid(plan_id):
            query = {"_id": ObjectId(plan_id), "user_id": current_user.id}
        else:
            query = {"id": plan_id, "user_id": current_user.id}
        
        result = await meal_plans_collection.delete_one(query)
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan not found"
            )
        
        return {"message": "Meal plan deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting meal plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete meal plan"
        )

@router.post("/nutrition/analyze", response_model=NutrientSearchResponse)
@limiter.limit("30/minute")
async def analyze_nutrition(
    request: Request,
    nutrition_request: NutrientSearchRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Analyze nutrition data for food items"""
    try:
        logger.info(f"Analyzing nutrition for user: {current_user.email}")
        
        nutrition_data = {}
        
        for i, food_item in enumerate(nutrition_request.food_items):
            portion = None
            if nutrition_request.portions and i < len(nutrition_request.portions):
                portion = nutrition_request.portions[i]
                food_item_with_portion = f"{portion} {food_item}"
            else:
                food_item_with_portion = food_item
            
            nutrition_info = await nutrition_service.get_ingredient_nutrition(food_item_with_portion)
            nutrition_data[food_item] = nutrition_info
        
        return NutrientSearchResponse(
            success=True,
            message="Nutrition analysis completed",
            nutrition_data=nutrition_data
        )
        
    except Exception as e:
        logger.error(f"Error analyzing nutrition: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze nutrition: {str(e)}"
        )

@router.post("/regenerate/{plan_id}", response_model=MealPlanResponse)
@limiter.limit("3/minute")
async def regenerate_meal_plan(
    request: Request,
    plan_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Regenerate a specific meal plan"""
    try:
        # Get the existing meal plan
        meal_plans_collection = await get_collection("meal_plans")
        
        from bson import ObjectId
        if ObjectId.is_valid(plan_id):
            query = {"_id": ObjectId(plan_id), "user_id": current_user.id}
        else:
            query = {"id": plan_id, "user_id": current_user.id}
        
        existing_plan = await meal_plans_collection.find_one(query)
        
        if not existing_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meal plan not found"
            )
        
        # Create user profile from current user data
        user_profile = UserProfile(
            age=current_user.age or 30,
            weight=current_user.weight or 70,
            height=current_user.height or 170,
            gender=current_user.gender or "other",
            activity_level=current_user.activity_level or "moderately_active",
            fitness_goal=current_user.fitness_goal or "maintenance",
            dietary_preferences=current_user.dietary_preferences or [],
            allergies=current_user.allergies or [],
            disliked_foods=current_user.disliked_foods or [],
            preferred_cuisines=current_user.preferred_cuisines or []
        )
        
        # Create meal plan request
        meal_plan_request = MealPlanRequest(
            user_profile=user_profile,
            regenerate=True
        )
        
        # Generate new meal plan
        new_meal_plan = await meal_plan_service.generate_meal_plan(meal_plan_request)
        new_meal_plan.user_id = current_user.id
        
        # Update in database
        meal_plan_dict = new_meal_plan.dict()
        meal_plan_dict["_id"] = ObjectId(plan_id)
        
        await meal_plans_collection.replace_one(query, meal_plan_dict)
        new_meal_plan.id = plan_id
        
        return MealPlanResponse(
            success=True,
            message="Meal plan regenerated successfully",
            data=new_meal_plan
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error regenerating meal plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to regenerate meal plan: {str(e)}"
        )