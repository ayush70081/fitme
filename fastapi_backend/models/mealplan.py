from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class MealType(str, Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    dinner = "dinner"
    snack = "snack"

class DietaryPreference(str, Enum):
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    KETO = "keto"
    PALEO = "paleo"
    MEDITERRANEAN = "mediterranean"
    GLUTEN_FREE = "gluten_free"
    DAIRY_FREE = "dairy_free"
    NONE = "none"

class FitnessGoal(str, Enum):
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"
    ENDURANCE = "endurance"

class NutritionInfo(BaseModel):
    calories: float = 0
    protein: float = 0
    carbs: float = 0
    fat: float = 0
    fiber: float = 0
    sugar: float = 0
    sodium: float = 0
    cholesterol: float = 0
    saturated_fat: float = 0

class Meal(BaseModel):
    name: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: int  # in minutes
    nutrition: Optional[NutritionInfo] = None
    image_url: Optional[str] = None
    cuisine_type: Optional[str] = None
    difficulty: Optional[str] = None
    portion_size: Optional[str] = None

class DayMealPlan(BaseModel):
    breakfast: Optional[Meal] = None
    lunch: Optional[Meal] = None
    dinner: Optional[Meal] = None
    snack: Optional[Meal] = None
    total_calories: float = 0
    total_protein: float = 0
    total_carbs: float = 0
    total_fat: float = 0

class UserProfile(BaseModel):
    age: Optional[int] = None
    weight: Optional[float] = None  # in kg
    height: Optional[float] = None  # in cm
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    fitness_goal: Optional[str] = None
    dietary_preferences: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    disliked_foods: Optional[List[str]] = []
    preferred_cuisines: Optional[List[str]] = []

class MealPlanRequest(BaseModel):
    user_profile: UserProfile
    budget_range: Optional[str] = "medium"  # low, medium, high
    cooking_skill: Optional[str] = "intermediate"  # beginner, intermediate, advanced
    meal_focus: Optional[str] = "balanced"  # balanced, protein-heavy, low-carb, etc.
    max_prep_time: Optional[int] = 30  # in minutes
    regenerate: Optional[bool] = False

class MealPlan(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    meals: DayMealPlan
    created_at: datetime = Field(default_factory=datetime.utcnow)
    preferences: Dict = {}

class MealPlanResponse(BaseModel):
    success: bool
    message: str
    data: Optional[MealPlan] = None

class NutrientSearchRequest(BaseModel):
    food_items: List[str]
    portions: Optional[List[str]] = None

class NutrientSearchResponse(BaseModel):
    success: bool
    message: str
    nutrition_data: Dict

class SavedMealPlan(BaseModel):
    id: Optional[str] = None
    user_id: str
    plan: MealPlan
    saved_at: datetime = Field(default_factory=datetime.utcnow)
    label: Optional[str] = None  # Optional: allow user to name the plan