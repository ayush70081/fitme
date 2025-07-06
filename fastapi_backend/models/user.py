from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from models.mealplan import DietaryPreference, FitnessGoal

class User(BaseModel):
    id: Optional[str] = Field(None, description="User ID")
    email: EmailStr = Field(..., description="User email")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password_hash: str = Field(..., description="Hashed password")
    
    # Profile information
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=1, le=120)
    weight: Optional[float] = Field(None, ge=20, le=300)
    height: Optional[float] = Field(None, ge=50, le=250)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    activity_level: Optional[str] = Field(None, pattern="^(sedentary|lightly_active|moderately_active|very_active|extremely_active)$")
    fitness_goal: Optional[FitnessGoal] = Field(None)
    dietary_preferences: List[DietaryPreference] = Field(default=[])
    allergies: List[str] = Field(default=[])
    disliked_foods: List[str] = Field(default=[])
    preferred_cuisines: List[str] = Field(default=[])
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = Field(None)
    
    # Settings
    is_active: bool = Field(True)
    is_verified: bool = Field(False)

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    fitness_goal: Optional[FitnessGoal] = None
    dietary_preferences: List[DietaryPreference] = []
    allergies: List[str] = []
    disliked_foods: List[str] = []
    preferred_cuisines: List[str] = []
    created_at: datetime
    is_active: bool

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    age: Optional[int] = Field(None, ge=1, le=120)
    weight: Optional[float] = Field(None, ge=20, le=300)
    height: Optional[float] = Field(None, ge=50, le=250)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    activity_level: Optional[str] = Field(None, pattern="^(sedentary|lightly_active|moderately_active|very_active|extremely_active)$")
    fitness_goal: Optional[FitnessGoal] = Field(None)
    dietary_preferences: Optional[List[DietaryPreference]] = Field(None)
    allergies: Optional[List[str]] = Field(None)
    disliked_foods: Optional[List[str]] = Field(None)
    preferred_cuisines: Optional[List[str]] = Field(None)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None