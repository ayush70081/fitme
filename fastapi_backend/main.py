from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from routes.mealplan import router as mealplan_router
from routes.auth import router as auth_router
from routes.test_mealplan import router as test_mealplan_router
from routes.debug import router as debug_router
from routes.aicoach import router as aicoach_router
from utils.database import init_db

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database on startup
    await init_db()
    yield
    # Place any shutdown cleanup here if needed

app = FastAPI(
    title="Fitness Tracker API",
    description="FastAPI backend for Fitness Tracker with AI-powered meal planning",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Database initialization moved to lifespan handler

# Include routers
app.include_router(mealplan_router, prefix="/api/mealplan", tags=["mealplan"])
app.include_router(test_mealplan_router, prefix="/api/mealplan", tags=["test-mealplan"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(debug_router, prefix="/api/debug", tags=["debug"])
app.include_router(aicoach_router, prefix="/api/aicoach", tags=["aicoach"])

@app.get("/")
async def root():
    return {"message": "Fitness Tracker FastAPI Backend"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)