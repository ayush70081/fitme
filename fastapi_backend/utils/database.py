import motor.motor_asyncio
import os
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)

class Database:
    client: motor.motor_asyncio.AsyncIOMotorClient = None
    database = None

db = Database()

async def get_database():
    """Get database instance"""
    return db.database

async def init_db():
    """Initialize database connection"""
    try:
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/fitness_tracker")
        
        # Create async client
        db.client = motor.motor_asyncio.AsyncIOMotorClient(mongodb_uri)
        
        # For MongoDB Atlas URIs, just use a simple database name
        database_name = "fitness_tracker"
        db.database = db.client[database_name]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info(f"Connected to MongoDB database: {database_name}")
        
        # Create indexes if needed
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def create_indexes():
    """Create database indexes"""
    try:
        # User collection indexes
        await db.database.users.create_index("email", unique=True)
        await db.database.users.create_index("username", unique=True)
        
        # Meal plan collection indexes
        await db.database.meal_plans.create_index("user_id")
        await db.database.meal_plans.create_index("created_at")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")

async def close_db():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Database connection closed")

# Collection helpers
async def get_collection(collection_name: str):
    """Get a specific collection"""
    database = await get_database()
    return database[collection_name]