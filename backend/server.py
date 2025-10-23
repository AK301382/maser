"""
MASER Backend - Optimized Version
A crowd-sourced mapping platform with advanced features
Version: 2.0 - Production Ready
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Query
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
import logging
from typing import Optional

# Local imports
from config import CORS_ORIGINS, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, COINS_PER_APPROVED_ROAD
from database import db, init_database, close_database, get_database_stats
from middleware import RateLimitMiddleware, SecurityHeadersMiddleware, RequestLoggingMiddleware
from models import (
    User, UserCreate, UserLogin, TokenResponse,
    RoadSubmission, RoadSubmissionCreate,
    POI, POICreate,
    PersonalLocation, PersonalLocationCreate,
    Notification, NotificationBroadcast,
    PaginatedResponse
)
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MASER API",
    description="Crowd-sourced Mapping Platform",
    version="2.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# API Router with prefix
api_router = APIRouter(prefix="/api")


# ==================== Helper Functions ====================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_id,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="توکن منقضی شده است")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")


async def get_current_user(authorization: str = Header(None)) -> dict:
    """Get current authenticated user"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")
    
    token = authorization.replace('Bearer ', '')
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="کاربر یافت نشد")
    
    return user


async def create_notification(user_id: str, title: str, message: str):
    """Helper function to create a notification"""
    try:
        notif = Notification(user_id=user_id, title=title, message=message)
        notif_dict = notif.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
    except Exception as e:
        logger.error(f"Error creating notification: {e}")


# ==================== Authentication Routes ====================

@api_router.post("/auth/register", response_model=TokenResponse, tags=["Authentication"])
async def register(user_data: UserCreate):
    """
    Register a new user
    - Email must be unique
    - Password minimum 6 characters
    - Returns access token
    """
    try:
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="این ایمیل قبلا ثبت شده است")
        
        # Create user
        hashed_pwd = hash_password(user_data.password)
        user_obj = User(email=user_data.email, full_name=user_data.full_name)
        user_dict = user_obj.model_dump()
        user_dict['password'] = hashed_pwd
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        
        await db.users.insert_one(user_dict)
        
        # Create token
        token = create_access_token(user_obj.id)
        
        logger.info(f"New user registered: {user_data.email}")
        
        return TokenResponse(access_token=token, user=user_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="خطا در ثبت‌نام")


@api_router.post("/auth/login", response_model=TokenResponse, tags=["Authentication"])
async def login(credentials: UserLogin):
    """
    Login existing user
    - Returns access token on success
    """
    try:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user or not verify_password(credentials.password, user['password']):
            raise HTTPException(status_code=401, detail="ایمیل یا رمز عبور اشتباه است")
        
        token = create_access_token(user['id'])
        user_obj = User(**user)
        
        logger.info(f"User logged in: {credentials.email}")
        
        return TokenResponse(access_token=token, user=user_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="خطا در ورود")


@api_router.get("/auth/me", response_model=User, tags=["Authentication"])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return User(**current_user)


# ==================== Road Submission Routes ====================

@api_router.post("/roads", response_model=RoadSubmission, tags=["Roads"])
async def submit_road(
    road_data: RoadSubmissionCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a new road
    - Requires authentication
    - Coordinates must have at least 2 points
    - Road will be pending until admin approval
    """
    try:
        road_obj = RoadSubmission(
            user_id=current_user['id'],
            road_name=road_data.road_name,
            road_type=road_data.road_type,
            coordinates=road_data.coordinates
        )
        
        road_dict = road_obj.model_dump()
        road_dict['created_at'] = road_dict['created_at'].isoformat()
        
        await db.roads.insert_one(road_dict)
        
        # Create notification
        await create_notification(
            current_user['id'],
            "مسیر ثبت شد",
            "مسیر شما با موفقیت ثبت شد و بعد از تایید، سکه به شما اضافه خواهد شد."
        )
        
        logger.info(f"Road submitted by user {current_user['id']}: {road_data.road_name}")
        
        return road_obj
        
    except Exception as e:
        logger.error(f"Error submitting road: {e}")
        raise HTTPException(status_code=500, detail="خطا در ثبت مسیر")


@api_router.get("/roads", tags=["Roads"])
async def get_roads(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)
):
    """
    Get list of roads with pagination
    - Filter by status (pending, approved, rejected)
    - Paginated results
    """
    try:
        query = {}
        if status:
            query['status'] = status
        
        # Count total
        total = await db.roads.count_documents(query)
        
        # Calculate pagination
        skip = (page - 1) * page_size
        total_pages = (total + page_size - 1) // page_size
        
        # Fetch roads
        roads = await db.roads.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(page_size)\
            .to_list(page_size)
        
        # Convert datetime strings
        for road in roads:
            if isinstance(road['created_at'], str):
                road['created_at'] = datetime.fromisoformat(road['created_at'])
        
        return {
            "items": roads,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Error fetching roads: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت مسیرها")


@api_router.get("/roads/user", response_model=list[RoadSubmission], tags=["Roads"])
async def get_user_roads(current_user: dict = Depends(get_current_user)):
    """Get all roads submitted by current user"""
    try:
        roads = await db.roads.find(
            {"user_id": current_user['id']},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
        
        for road in roads:
            if isinstance(road['created_at'], str):
                road['created_at'] = datetime.fromisoformat(road['created_at'])
        
        return roads
        
    except Exception as e:
        logger.error(f"Error fetching user roads: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت مسیرها")


# ==================== POI Routes ====================

@api_router.post("/pois", response_model=POI, tags=["POIs"])
async def create_poi(
    poi_data: POICreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new Point of Interest"""
    try:
        poi_obj = POI(
            user_id=current_user['id'],
            name=poi_data.name,
            category=poi_data.category,
            poi_type=poi_data.poi_type,
            location=poi_data.location
        )
        
        poi_dict = poi_obj.model_dump()
        poi_dict['created_at'] = poi_dict['created_at'].isoformat()
        
        await db.pois.insert_one(poi_dict)
        
        logger.info(f"POI created by user {current_user['id']}: {poi_data.name}")
        
        return poi_obj
        
    except Exception as e:
        logger.error(f"Error creating POI: {e}")
        raise HTTPException(status_code=500, detail="خطا در ثبت مکان")


@api_router.get("/pois", tags=["POIs"])
async def get_pois(
    status: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE)
):
    """Get list of POIs with pagination and filters"""
    try:
        query = {}
        if status:
            query['status'] = status
        if category:
            query['category'] = category
        
        total = await db.pois.count_documents(query)
        skip = (page - 1) * page_size
        total_pages = (total + page_size - 1) // page_size
        
        pois = await db.pois.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(page_size)\
            .to_list(page_size)
        
        for poi in pois:
            if isinstance(poi['created_at'], str):
                poi['created_at'] = datetime.fromisoformat(poi['created_at'])
        
        return {
            "items": pois,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }
        
    except Exception as e:
        logger.error(f"Error fetching POIs: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت مکان‌ها")


# ==================== Personal Location Routes ====================

@api_router.post("/locations/personal", response_model=PersonalLocation, tags=["Personal Locations"])
async def create_personal_location(
    location_data: PersonalLocationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a personal location (home, work, etc.)"""
    try:
        loc_obj = PersonalLocation(
            user_id=current_user['id'],
            name=location_data.name,
            location=location_data.location
        )
        
        loc_dict = loc_obj.model_dump()
        loc_dict['created_at'] = loc_dict['created_at'].isoformat()
        
        await db.personal_locations.insert_one(loc_dict)
        
        return loc_obj
        
    except Exception as e:
        logger.error(f"Error creating personal location: {e}")
        raise HTTPException(status_code=500, detail="خطا در ثبت مکان شخصی")


@api_router.get("/locations/personal", response_model=list[PersonalLocation], tags=["Personal Locations"])
async def get_personal_locations(current_user: dict = Depends(get_current_user)):
    """Get all personal locations for current user"""
    try:
        locations = await db.personal_locations.find(
            {"user_id": current_user['id']},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        for loc in locations:
            if isinstance(loc['created_at'], str):
                loc['created_at'] = datetime.fromisoformat(loc['created_at'])
        
        return locations
        
    except Exception as e:
        logger.error(f"Error fetching personal locations: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت مکان‌های شخصی")


# ==================== Notification Routes ====================

@api_router.get("/notifications", response_model=list[Notification], tags=["Notifications"])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Get all notifications for current user"""
    try:
        notifications = await db.notifications.find(
            {"user_id": current_user['id']},
            {"_id": 0}
        ).sort("created_at", -1).limit(100).to_list(100)
        
        for notif in notifications:
            if isinstance(notif['created_at'], str):
                notif['created_at'] = datetime.fromisoformat(notif['created_at'])
        
        return notifications
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت اعلان‌ها")


@api_router.put("/notifications/{notification_id}/read", tags=["Notifications"])
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        result = await db.notifications.update_one(
            {"id": notification_id, "user_id": current_user['id']},
            {"$set": {"read": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="اعلان یافت نشد")
        
        return {"message": "اعلان خوانده شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="خطا در به‌روزرسانی اعلان")


# ==================== Admin Routes ====================

@api_router.put("/admin/roads/{road_id}/approve", tags=["Admin"])
async def approve_road(road_id: str):
    """
    Approve a road submission
    - Awards coin to user
    - Sends notification
    """
    try:
        road = await db.roads.find_one({"id": road_id})
        if not road:
            raise HTTPException(status_code=404, detail="مسیر یافت نشد")
        
        # Update road status
        await db.roads.update_one(
            {"id": road_id},
            {"$set": {"status": "approved", "coin_awarded": True}}
        )
        
        # Award coin to user
        await db.users.update_one(
            {"id": road['user_id']},
            {"$inc": {"coins": COINS_PER_APPROVED_ROAD}}
        )
        
        # Send notification
        await create_notification(
            road['user_id'],
            "سکه دریافت شد!",
            f"تبریک! مسیر '{road['road_name']}' شما تایید شد و {COINS_PER_APPROVED_ROAD} سکه مسیر به شما اضافه شد."
        )
        
        logger.info(f"Road approved: {road_id}")
        
        return {"message": "مسیر تایید شد و سکه اضافه شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving road: {e}")
        raise HTTPException(status_code=500, detail="خطا در تایید مسیر")


@api_router.put("/admin/roads/{road_id}/reject", tags=["Admin"])
async def reject_road(road_id: str):
    """Reject a road submission"""
    try:
        road = await db.roads.find_one({"id": road_id})
        if not road:
            raise HTTPException(status_code=404, detail="مسیر یافت نشد")
        
        await db.roads.update_one(
            {"id": road_id},
            {"$set": {"status": "rejected"}}
        )
        
        # Send notification
        await create_notification(
            road['user_id'],
            "مسیر رد شد",
            f"متاسفانه مسیر '{road['road_name']}' ثبت شده شما تایید نشد."
        )
        
        logger.info(f"Road rejected: {road_id}")
        
        return {"message": "مسیر رد شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting road: {e}")
        raise HTTPException(status_code=500, detail="خطا در رد مسیر")


@api_router.put("/admin/pois/{poi_id}/approve", tags=["Admin"])
async def approve_poi(poi_id: str):
    """Approve a POI submission"""
    try:
        poi = await db.pois.find_one({"id": poi_id})
        if not poi:
            raise HTTPException(status_code=404, detail="مکان یافت نشد")
        
        await db.pois.update_one(
            {"id": poi_id},
            {"$set": {"status": "approved"}}
        )
        
        logger.info(f"POI approved: {poi_id}")
        
        return {"message": "مکان تایید شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving POI: {e}")
        raise HTTPException(status_code=500, detail="خطا در تایید مکان")


@api_router.put("/admin/pois/{poi_id}/reject", tags=["Admin"])
async def reject_poi(poi_id: str):
    """Reject a POI submission"""
    try:
        poi = await db.pois.find_one({"id": poi_id})
        if not poi:
            raise HTTPException(status_code=404, detail="مکان یافت نشد")
        
        await db.pois.update_one(
            {"id": poi_id},
            {"$set": {"status": "rejected"}}
        )
        
        logger.info(f"POI rejected: {poi_id}")
        
        return {"message": "مکان رد شد"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting POI: {e}")
        raise HTTPException(status_code=500, detail="خطا در رد مکان")


@api_router.post("/admin/notifications/broadcast", tags=["Admin"])
async def broadcast_notification(data: NotificationBroadcast):
    """
    Broadcast notification to all users or specific user
    - userId: "all" for all users, or specific user ID
    """
    try:
        if data.userId == "all":
            # Send to all users
            users = await db.users.find({}, {"_id": 0, "id": 1}).to_list(10000)
            for user in users:
                await create_notification(user['id'], data.title, data.message)
            
            logger.info(f"Broadcast notification sent to {len(users)} users")
        else:
            # Send to specific user
            await create_notification(data.userId, data.title, data.message)
            logger.info(f"Notification sent to user: {data.userId}")
        
        return {"message": "اعلان ارسال شد"}
        
    except Exception as e:
        logger.error(f"Error broadcasting notification: {e}")
        raise HTTPException(status_code=500, detail="خطا در ارسال اعلان")


@api_router.get("/admin/stats", tags=["Admin"])
async def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        stats = await get_database_stats()
        return stats
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="خطا در دریافت آمار")


# ==================== Health Check ====================

@api_router.get("/", tags=["Health"])
async def root():
    """API health check"""
    return {
        "message": "مسیر - سیستم نقشه‌برداری جمعی",
        "version": "2.0",
        "status": "healthy"
    }


@api_router.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    try:
        # Check database connection
        await db.command('ping')
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": "2.0"
    }


# ==================== Application Setup ====================

# Include API router
app.include_router(api_router)

# Add middleware (order matters!)
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses
app.add_middleware(SecurityHeadersMiddleware)  # Security headers
app.add_middleware(RequestLoggingMiddleware)  # Logging
app.add_middleware(RateLimitMiddleware)  # Rate limiting

# CORS middleware (must be last)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting MASER API v2.0...")
    await init_database()
    logger.info("MASER API ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down MASER API...")
    await close_database()
    logger.info("MASER API stopped")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "خطای سرور. لطفا دوباره تلاش کنید."}
    )
