from fastapi import APIRouter, HTTPException
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/env-check")
async def check_environment():
    """Check environment variables for debugging"""
    try:
        gemini_key = os.getenv("GEMINI_API_KEY")
        usda_key = os.getenv("USDA_API_KEY")
        
        return {
            "gemini_api_key_configured": bool(gemini_key and gemini_key != "your_gemini_api_key_here"),
            "gemini_api_key_preview": gemini_key[:20] + "..." if gemini_key else None,
            "usda_api_key_configured": bool(usda_key and usda_key != "your_usda_api_key_here"),
            "usda_api_key_preview": usda_key[:10] + "..." if usda_key else None,
        }
    except Exception as e:
        logger.error(f"Error checking environment: {e}")
        return {"error": str(e)}

@router.get("/gemini-status")
async def gemini_status():
    """Check Gemini API status and configuration"""
    try:
        from services.nutrition_service import GENAI_AVAILABLE
        
        # Check module availability
        status = {
            "genai_module_available": GENAI_AVAILABLE,
            "api_key_configured": bool(os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here"),
            "api_key_preview": os.getenv("GEMINI_API_KEY", "")[:20] + "..." if os.getenv("GEMINI_API_KEY") else "Not set"
        }
        
        # Try to initialize nutrition service
        try:
            from services.nutrition_service import NutritionService
            nutrition_service = NutritionService()
            status["nutrition_service_initialized"] = True
            status["gemini_model_available"] = nutrition_service.gemini_model is not None
            
            if nutrition_service.gemini_model:
                status["gemini_model_type"] = str(type(nutrition_service.gemini_model))
            
        except Exception as e:
            status["nutrition_service_initialized"] = False
            status["nutrition_service_error"] = str(e)
        
        return status
        
    except Exception as e:
        logger.error(f"Error checking Gemini status: {e}")
        raise HTTPException(status_code=500, detail=f"Error checking Gemini status: {str(e)}")

@router.post("/test-gemini")
async def test_gemini():
    """Test Gemini API with a simple request"""
    try:
        from services.nutrition_service import NutritionService
        
        nutrition_service = NutritionService()
        
        if not nutrition_service.gemini_model:
            return {
                "success": False,
                "message": "Gemini model not available",
                "suggestion": "Check API key and internet connection"
            }
        
        # Test with a simple nutrition request
        result = await nutrition_service.get_ingredient_nutrition("100g banana")
        
        if result:
            return {
                "success": True,
                "message": "Gemini API is working",
                "test_result": {
                    "calories": result.calories,
                    "protein": result.protein,
                    "carbs": result.carbs,
                    "fat": result.fat
                }
            }
        else:
            return {
                "success": False,
                "message": "Gemini API call failed",
                "suggestion": "Check logs for detailed error information"
            }
            
    except Exception as e:
        logger.error(f"Error testing Gemini: {e}")
        return {
            "success": False,
            "message": f"Error testing Gemini: {str(e)}",
            "suggestion": "Check logs for detailed error information"
        }

@router.get("/test-nutrition/{food_name}")
async def test_nutrition_analysis(food_name: str):
    """Test nutrition analysis for a specific food"""
    try:
        from services.nutrition_service import NutritionService
        
        nutrition_service = NutritionService()
        result = await nutrition_service.get_ingredient_nutrition(f"100g {food_name}")
        
        if result:
            return {
                "success": True,
                "food": food_name,
                "nutrition": {
                    "calories": result.calories,
                    "protein": result.protein,
                    "carbs": result.carbs,
                    "fat": result.fat,
                    "fiber": result.fiber,
                    "sugar": result.sugar,
                    "sodium": result.sodium
                }
            }
        else:
            return {
                "success": False,
                "food": food_name,
                "message": "No nutrition data found"
            }
            
    except Exception as e:
        logger.error(f"Error testing nutrition analysis: {e}")
        return {
            "success": False,
            "food": food_name,
            "error": str(e)
        }