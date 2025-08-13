from datetime import datetime, timedelta
from typing import Optional
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import User, TokenData
from utils.database import get_collection
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Security configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT configuration - Compatible with Express backend
raw_jwt_secret = os.getenv("JWT_SECRET")

# Use the same JWT secret as Express backend for consistency
# Both backends must use the same secret for JWT token compatibility
SECRET_KEY = raw_jwt_secret or "your-fallback-secret-key"
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))

# Avoid logging sensitive JWT configuration in production

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
        
        # Decode token without verification to see payload
        # Do not log unverified token payloads or secrets
        
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
            # Decoded Express backend token
        except JWTError as e:
            logger.debug("Express token format decode failed; trying FastAPI format")
            try:
                # Try FastAPI format (without issuer/audience)
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                # Decoded FastAPI token
            except JWTError as e2:
                logger.error("Both token formats failed")
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
        
        # Avoid logging token contents
        
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise credentials_exception
    
    # Get user from database
    users_collection = await get_collection("users")
    
    # Enhanced user lookup with detailed logging
    user_doc = None
    logger.debug("Searching for user by id/email")
    
    # Try to find user by ID first (Express format)
    if user_id:
        try:
            from bson import ObjectId
            if ObjectId.is_valid(user_id):
                query = {"_id": ObjectId(user_id)}
                logger.debug("Searching by ObjectId")
                user_doc = await users_collection.find_one(query)
                if user_doc:
                    logger.debug("Found user by ID")
                else:
                    logger.debug("No user found with ID")
            else:
                logger.debug("Invalid ObjectId format")
        except Exception as e:
            logger.error(f"Error finding user by ID: {e}")
    
    # Fallback to email search
    if not user_doc and email:
        try:
            query = {"email": email}
            logger.debug("Searching by email")
            user_doc = await users_collection.find_one(query)
            if user_doc:
                logger.debug("Found user by email")
            else:
                logger.debug("No user found with email")
        except Exception as e:
            logger.error(f"Error finding user by email: {e}")
    
    if user_doc is None:
        logger.debug("User not found in FastAPI database; creating temporary user object from JWT token data")
        
        # Since the JWT token is valid and issued by our Express backend,
        # create a temporary user object with the token data
        try:
            username = payload.get("username", email.split('@')[0] if email else "User")
            
            temp_user = User(
                id=user_id or "temp_user_id",
                email=email or "unknown@example.com",
                username=username,
                password_hash="temp_hash",
                first_name=username,
                last_name="",
                age=25,  # Default age
                weight=70.0,  # Default weight
                height=170.0,  # Default height
                gender="other",  # Default gender
                activity_level="moderately_active",  # Default activity level
                fitness_goal=None,  # Will be set by the enum system
                dietary_preferences=[],
                allergies=[],
                disliked_foods=[],
                preferred_cuisines=[],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                is_active=True,
                is_verified=True
            )
            
            logger.debug("Created temporary user object")
            return temp_user
        except Exception as e:
            logger.error(f"❌ Error creating temporary user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user session"
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
    
    logger.info(f"Successfully authenticated user: {user.email}")
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user