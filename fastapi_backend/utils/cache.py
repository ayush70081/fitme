import json
import logging
from typing import Any, Optional
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = None
        self.memory_cache = {}  # In-memory cache
        self.memory_cache_ttl = {}
        self.max_memory_cache_size = 1000
        logger.info("CacheManager initialized with in-memory cache")
    
    async def _get_redis_client(self):
        """Redis is disabled for now due to compatibility issues"""
        return None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            # Use memory cache only
            if key in self.memory_cache:
                # Check TTL
                if key in self.memory_cache_ttl:
                    if datetime.utcnow() > self.memory_cache_ttl[key]:
                        # Expired
                        del self.memory_cache[key]
                        del self.memory_cache_ttl[key]
                        return None
                return self.memory_cache[key]
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cache value for key '{key}': {e}")
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Set value in cache with expiration"""
        try:
            # Use memory cache only
            self._cleanup_memory_cache()
            self.memory_cache[key] = value
            self.memory_cache_ttl[key] = datetime.utcnow() + timedelta(seconds=expire)
            return True
            
        except Exception as e:
            logger.error(f"Error setting cache value for key '{key}': {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            # Remove from memory cache
            if key in self.memory_cache:
                del self.memory_cache[key]
            if key in self.memory_cache_ttl:
                del self.memory_cache_ttl[key]
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting cache key '{key}': {e}")
            return False
    
    async def clear(self) -> bool:
        """Clear all cache"""
        try:
            # Clear memory cache
            self.memory_cache.clear()
            self.memory_cache_ttl.clear()
            
            return True
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return False
    
    def _cleanup_memory_cache(self):
        """Clean up expired entries and limit size"""
        now = datetime.utcnow()
        
        # Remove expired entries
        expired_keys = []
        for key, ttl in self.memory_cache_ttl.items():
            if now > ttl:
                expired_keys.append(key)
        
        for key in expired_keys:
            if key in self.memory_cache:
                del self.memory_cache[key]
            del self.memory_cache_ttl[key]
        
        # Limit cache size (remove oldest entries)
        while len(self.memory_cache) > self.max_memory_cache_size:
            # Find the oldest entry
            oldest_key = min(self.memory_cache_ttl.keys(), 
                           key=lambda k: self.memory_cache_ttl[k])
            del self.memory_cache[oldest_key]
            del self.memory_cache_ttl[oldest_key]
    
    async def close(self):
        """Close cache connections"""
        # No Redis connection to close
        pass