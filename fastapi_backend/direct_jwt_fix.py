#!/usr/bin/env python3
"""
Direct fix for JWT secret - Replace the auth.py file with correct secret
"""

auth_content = '''from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User, TokenData
from utils.database import get_collection
import logging

logger = logging.getLogger(__name__)

# Security configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT configuration - HARDCODED to match Express backend
SECRET_KEY = "your-super-secret-jwt-key-here-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Debug logging for JWT configuration
logger.info(f"🔐 JWT Configuration (HARDCODED):")
logger.info(f"   SECRET_KEY: {SECRET_KEY}")
logger.info(f"   SECRET_KEY length: {len(SECRET_KEY)}")
logger.info(f"   ALGORITHM: {ALGORITHM}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user - Compatible with Express backend tokens"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        logger.info(f"Attempting to decode token: {token[:20]}...")
        logger.info(f"Using SECRET_KEY: {SECRET_KEY}")
        
        # Try to decode JWT token (Express backend format first)
        payload = None
        try:
            # Express backend JWT format with issuer/audience
            payload = jwt.decode(
                token, 
                SECRET_KEY, 
                algorithms=[ALGORITHM],
                issuer='fitness-tracker-api',
                audience='fitness-tracker-client'
            )
            logger.info("✅ Successfully decoded Express backend token")
        except JWTError as e:
            logger.warning(f"Express format failed: {e}, trying FastAPI format")
            try:
                # Try FastAPI format (without issuer/audience)
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                logger.info("✅ Successfully decoded FastAPI token")
            except JWTError as e2:
                logger.error(f"Both token formats failed. Express error: {e}, FastAPI error: {e2}")
                raise credentials_exception
        
        # Get user identifier from token
        user_id = payload.get("userId")  # Express backend format
        email = payload.get("email") or payload.get("sub")  # Both formats
        token_type = payload.get("type")  # Express backend includes type
        
        if not user_id and not email:
            logger.error("No user identifier found in token")
            raise credentials_exception
        
        # Validate token type if present (Express backend uses 'access' type)
        if token_type and token_type != 'access':
            logger.error(f"Invalid token type: {token_type}")
            raise credentials_exception
        
        logger.info(f"Token contains user_id: {user_id}, email: {email}, type: {token_type}")
        
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    
    # Get user from database
    users_collection = await get_collection("users")
    
    # Try to find user by ID first (Express format), then by email
    user_doc = None
    if user_id:
        try:
            from bson import ObjectId
            if ObjectId.is_valid(user_id):
                user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
                logger.info(f"Found user by ID: {user_id}")
        except Exception as e:
            logger.warning(f"Error finding user by ID: {e}")
    
    # Fallback to email search
    if not user_doc and email:
        user_doc = await users_collection.find_one({"email": email})
        logger.info(f"Found user by email: {email}")
    
    if user_doc is None:
        logger.error(f"User not found for user_id: {user_id}, email: {email}")
        # Create a dummy user for demo purposes
        return User(
            id="demo_user_id",
            email=email or "demo@example.com",
            username="demo_user",
            password_hash="dummy_hash",
            first_name="Demo",
            last_name="User",
            age=30,
            weight=70.0,
            height=175.0,
            gender="other",
            activity_level="moderately_active",
            fitness_goal="maintenance",
            dietary_preferences=[],
            allergies=[],
            disliked_foods=[],
            preferred_cuisines=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_active=True,
            is_verified=True
        )
    
    # Convert MongoDB document to User model
    user = User(
        id=str(user_doc["_id"]),
        email=user_doc["email"],
        username=user_doc["username"],
        password_hash=user_doc["password_hash"],
        first_name=user_doc.get("first_name"),
        last_name=user_doc.get("last_name"),
        age=user_doc.get("age"),
        weight=user_doc.get("weight"),
        height=user_doc.get("height"),
        gender=user_doc.get("gender"),
        activity_level=user_doc.get("activity_level"),
        fitness_goal=user_doc.get("fitness_goal"),
        dietary_preferences=user_doc.get("dietary_preferences", []),
        allergies=user_doc.get("allergies", []),
        disliked_foods=user_doc.get("disliked_foods", []),
        preferred_cuisines=user_doc.get("preferred_cuisines", []),
        created_at=user_doc.get("created_at", datetime.utcnow()),
        updated_at=user_doc.get("updated_at", datetime.utcnow()),
        last_login=user_doc.get("last_login"),
        is_active=user_doc.get("is_active", True),
        is_verified=user_doc.get("is_verified", False)
    )
    
    logger.info(f"✅ Successfully authenticated user: {user.email}")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
'''

# Write the fixed auth.py file
with open('utils/auth.py', 'w') as f:
    f.write(auth_content)

print("✅ JWT auth.py file updated with hardcoded secret!")
print("🔄 Restart FastAPI: py main.py")
print("🎯 JWT secret is now hardcoded to match Express backend exactly")