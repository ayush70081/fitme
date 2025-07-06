from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ConversationMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user/assistant)")
    content: str = Field(..., description="Content of the message")

class Recipe(BaseModel):
    name: str = Field(..., description="Recipe name")
    description: str = Field(..., description="Brief description of the recipe")
    prep_time: str = Field(..., description="Preparation time", alias="prepTime")
    cook_time: str = Field(..., description="Cooking time", alias="cookTime")
    calories: str = Field(..., description="Calories per serving")
    protein: str = Field(..., description="Protein content")
    carbs: str = Field(..., description="Carbohydrate content")
    fat: str = Field(..., description="Fat content")
    ingredients: List[str] = Field(..., description="List of ingredients")
    instructions: List[str] = Field(..., description="Step-by-step instructions")
    tags: List[str] = Field(default=[], description="Recipe tags")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User message")
    conversation_history: List[ConversationMessage] = Field(
        default=[], 
        description="Previous conversation history for context",
        alias="conversationHistory"
    )

class ChatResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    response: str = Field(..., description="AI generated response")
    recipes: Optional[List[Recipe]] = Field(None, description="Generated recipes if applicable")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    message: Optional[str] = Field(None, description="Additional message or error details")

class SuggestionsResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    suggestions: List[str] = Field(..., description="List of suggested questions")
    message: Optional[str] = Field(None, description="Additional message or error details")

class UserContext(BaseModel):
    name: str = Field(..., description="User's name")
    fitness_goals: List[str] = Field(default=[], description="User's fitness goals")
    fitness_experience: str = Field(..., description="User's fitness experience level")
    dietary_preference: str = Field(..., description="User's dietary preferences")
    workout_frequency: str = Field(..., description="User's workout frequency")
    preferred_workouts: List[str] = Field(default=[], description="User's preferred workout types")