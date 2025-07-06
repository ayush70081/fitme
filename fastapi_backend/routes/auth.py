from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import datetime, timedelta
import logging

from models.user import User, UserCreate, UserLogin, UserResponse, UserUpdate, Token
from utils.auth import (
    verify_password, get_password_hash, create_access_token, 
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.database import get_collection

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        users_collection = await get_collection("users")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({
            "$or": [
                {"email": user_data.email},
                {"username": user_data.username}
            ]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email or username already exists"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "username": user_data.username,
            "password_hash": hashed_password,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "is_verified": False,
            "dietary_preferences": [],
            "allergies": [],
            "disliked_foods": [],
            "preferred_cuisines": []
        }
        
        # Insert user
        result = await users_collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        
        # Return user response
        return UserResponse(
            id=str(user_doc["_id"]),
            email=user_doc["email"],
            username=user_doc["username"],
            first_name=user_doc.get("first_name"),
            last_name=user_doc.get("last_name"),
            created_at=user_doc["created_at"],
            is_active=user_doc["is_active"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register user"
        )

@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    try:
        users_collection = await get_collection("users")
        
        # Find user by email
        user_doc = await users_collection.find_one({"email": user_credentials.email})
        
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Verify password
        if not verify_password(user_credentials.password, user_doc["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if user is active
        if not user_doc.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated"
            )
        
        # Update last login
        await users_collection.update_one(
            {"_id": user_doc["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_doc["email"]}, 
            expires_delta=access_token_expires
        )
        
        return Token(access_token=access_token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to login user"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        age=current_user.age,
        weight=current_user.weight,
        height=current_user.height,
        gender=current_user.gender,
        activity_level=current_user.activity_level,
        fitness_goal=current_user.fitness_goal,
        dietary_preferences=current_user.dietary_preferences,
        allergies=current_user.allergies,
        disliked_foods=current_user.disliked_foods,
        preferred_cuisines=current_user.preferred_cuisines,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update current user profile"""
    try:
        users_collection = await get_collection("users")
        
        # Build update document
        update_data = {}
        for field, value in user_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            # Update user
            from bson import ObjectId
            await users_collection.update_one(
                {"_id": ObjectId(current_user.id)},
                {"$set": update_data}
            )
            
            # Get updated user
            updated_user_doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
            
            return UserResponse(
                id=str(updated_user_doc["_id"]),
                email=updated_user_doc["email"],
                username=updated_user_doc["username"],
                first_name=updated_user_doc.get("first_name"),
                last_name=updated_user_doc.get("last_name"),
                age=updated_user_doc.get("age"),
                weight=updated_user_doc.get("weight"),
                height=updated_user_doc.get("height"),
                gender=updated_user_doc.get("gender"),
                activity_level=updated_user_doc.get("activity_level"),
                fitness_goal=updated_user_doc.get("fitness_goal"),
                dietary_preferences=updated_user_doc.get("dietary_preferences", []),
                allergies=updated_user_doc.get("allergies", []),
                disliked_foods=updated_user_doc.get("disliked_foods", []),
                preferred_cuisines=updated_user_doc.get("preferred_cuisines", []),
                created_at=updated_user_doc["created_at"],
                is_active=updated_user_doc["is_active"]
            )
        
        # No changes to update
        return get_current_user_profile(current_user)
        
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )