from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import List
import logging

from models.aicoach import ChatRequest, ChatResponse, SuggestionsResponse
from models.user import User
from services.aicoach_service import AICoachService
from utils.auth import get_current_active_user

logger = logging.getLogger(__name__)

# Initialize AI Coach service
ai_coach_service = AICoachService()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_with_ai_coach(
    request: Request,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Send message to AI Coach and get response"""
    try:
        logger.info(f"AI Coach chat request from user: {current_user.email}")
        logger.info(f"Message: {chat_request.message[:100]}...")
        
        # Validate message
        if not chat_request.message or not chat_request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message is required"
            )
        
        # Generate AI response
        response = await ai_coach_service.generate_chat_response(chat_request, current_user)
        
        logger.info(f"AI Coach response generated successfully for user: {current_user.email}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI Coach chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI response"
        )

@router.get("/suggestions", response_model=SuggestionsResponse) 
async def get_suggested_questions(
    current_user: User = Depends(get_current_active_user)
):
    """Get personalized question suggestions for the user"""
    try:
        logger.info(f"Getting suggestions for user: {current_user.email}")
        
        suggestions = ai_coach_service.get_suggested_questions(current_user)
        
        return SuggestionsResponse(
            success=True,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )

@router.get("/suggestions-bypass")
async def get_suggested_questions_bypass():
    """TEMPORARY: Get suggestions without authentication for testing"""
    try:
        # Create a mock user for testing
        from models.user import User
        from datetime import datetime
        
        mock_user = User(
            id="test_user",
            email="test@example.com", 
            username="testuser",
            password_hash="dummy",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_active=True,
            is_verified=True
        )
        
        suggestions = ai_coach_service.get_suggested_questions(mock_user)
        
        return SuggestionsResponse(
            success=True,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error getting suggestions (bypass): {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )

@router.get("/suggestions-original", response_model=SuggestionsResponse)
async def get_suggested_questions_original(
    current_user: User = Depends(get_current_active_user)
):
    """Get personalized question suggestions for the user"""
    try:
        logger.info(f"Getting suggestions for user: {current_user.email}")
        
        suggestions = ai_coach_service.get_suggested_questions(current_user)
        
        return SuggestionsResponse(
            success=True,
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for AI Coach service"""
    return {
        "status": "healthy",
        "service": "AI Coach",
        "gemini_configured": ai_coach_service.model is not None
    }

@router.get("/auth-test")
async def test_authentication(current_user: User = Depends(get_current_active_user)):
    """Test endpoint to verify authentication is working"""
    return {
        "status": "authenticated",
        "user_id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "message": "Authentication successful!"
    }

@router.get("/debug-jwt")
async def debug_jwt_config():
    """Debug endpoint to check JWT configuration"""
    from utils.auth import SECRET_KEY, ALGORITHM
    import os
    import jwt
    from datetime import datetime, timedelta
    
    # Create a test token with FastAPI's secret
    test_payload = {
        "userId": "test123",
        "email": "test@example.com",
        "username": "testuser",
        "type": "access",
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
        "iss": "fitness-tracker-api",
        "aud": "fitness-tracker-client"
    }
    
    test_token = jwt.encode(test_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    # Test verifying it
    try:
        verified = jwt.decode(
            test_token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            issuer="fitness-tracker-api",
            audience="fitness-tracker-client"
        )
        verification_status = "SUCCESS"
    except Exception as e:
        verification_status = f"FAILED: {e}"
    
    return {
        "fastapi_jwt_secret": SECRET_KEY,  # TEMPORARY - for debugging
        "jwt_secret_length": len(SECRET_KEY),
        "jwt_algorithm": ALGORITHM,
        "env_jwt_secret": os.getenv("JWT_SECRET", "NOT_FOUND"),
        "test_token": test_token,
        "verification_test": verification_status
    }

@router.get("/test-with-fastapi-token")
async def test_with_fastapi_token():
    """Create a token with FastAPI secret and test it"""
    from utils.auth import SECRET_KEY, ALGORITHM, get_current_active_user
    import jwt
    from datetime import datetime, timedelta
    
    # Create token with FastAPI secret
    test_payload = {
        "userId": "68679cecb82154dd9ac54c21",  # Use real user ID from logs
        "email": "vayu@gmail.com",
        "username": "vayu", 
        "type": "access",
        "iat": int(datetime.utcnow().timestamp()),
        "exp": int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
        "iss": "fitness-tracker-api",
        "aud": "fitness-tracker-client"
    }
    
    fastapi_token = jwt.encode(test_payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return {
        "message": "Use this token in Authorization header to test FastAPI auth",
        "fastapi_token": fastapi_token,
        "instructions": "Add 'Authorization: Bearer {token}' header to your requests"
    }