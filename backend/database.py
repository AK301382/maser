""" 
Database connection and initialization module
Handles MongoDB connection, indexing, and connection pooling
"""
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URL, DB_NAME
import logging

logger = logging.getLogger(__name__)

# MongoDB client with connection pooling
client = AsyncIOMotorClient(
    MONGO_URL,
    maxPoolSize=50,  # Maximum number of connections
    minPoolSize=10,  # Minimum number of connections
    maxIdleTimeMS=45000,  # Close connections idle for 45 seconds
    serverSelectionTimeoutMS=5000,  # Timeout for server selection
)

db = client[DB_NAME]


async def init_database():
    """
    Initialize database with indexes for better performance
    This should be called on application startup
    """
    try:
        logger.info("Initializing database indexes...")
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.users.create_index("created_at")
        
        # Roads collection indexes
        await db.roads.create_index("id", unique=True)
        await db.roads.create_index("user_id")
        await db.roads.create_index("status")
        await db.roads.create_index([("status", 1), ("created_at", -1)])
        await db.roads.create_index([("user_id", 1), ("created_at", -1)])
        
        # POIs collection indexes
        await db.pois.create_index("id", unique=True)
        await db.pois.create_index("user_id")
        await db.pois.create_index("status")
        await db.pois.create_index([("status", 1), ("category", 1)])
        await db.pois.create_index([("user_id", 1), ("created_at", -1)])
        
        # Personal locations collection indexes
        await db.personal_locations.create_index("id", unique=True)
        await db.personal_locations.create_index("user_id")
        await db.personal_locations.create_index([("user_id", 1), ("created_at", -1)])
        
        # Notifications collection indexes
        await db.notifications.create_index("id", unique=True)
        await db.notifications.create_index("user_id")
        await db.notifications.create_index([("user_id", 1), ("read", 1)])
        await db.notifications.create_index([("user_id", 1), ("created_at", -1)])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating database indexes: {e}")


async def close_database():
    """
    Close database connection
    This should be called on application shutdown
    """
    try:
        client.close()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")


async def get_database_stats():
    """
    Get database statistics for monitoring
    """
    try:
        stats = {
            'users': await db.users.count_documents({}),
            'roads_total': await db.roads.count_documents({}),
            'roads_pending': await db.roads.count_documents({'status': 'pending'}),
            'roads_approved': await db.roads.count_documents({'status': 'approved'}),
            'pois_total': await db.pois.count_documents({}),
            'pois_pending': await db.pois.count_documents({'status': 'pending'}),
            'total_coins': sum([
                user.get('coins', 0) 
                async for user in db.users.find({}, {'coins': 1})
            ]),
        }
        return stats
    except Exception as e:
        logger.error(f"Error getting database stats: {e}")
        return {}
