"""  
Pydantic models for request/response validation
All data models used in the API
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import re


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    coins: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if len(v) < 2:
            raise ValueError('نام باید حداقل 2 کاراکتر باشد')
        if len(v) > 100:
            raise ValueError('نام نباید بیشتر از 100 کاراکتر باشد')
        return v.strip()


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('رمز عبور باید حداقل 6 کاراکتر باشد')
        if len(v) > 100:
            raise ValueError('رمز عبور نباید بیشتر از 100 کاراکتر باشد')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


class RoadSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    road_name: str
    road_type: str
    coordinates: List[List[float]]
    status: str = "pending"
    coin_awarded: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('road_name')
    @classmethod
    def validate_road_name(cls, v):
        if len(v) < 2:
            raise ValueError('نام جاده باید حداقل 2 کاراکتر باشد')
        if len(v) > 200:
            raise ValueError('نام جاده نباید بیشتر از 200 کاراکتر باشد')
        return v.strip()
    
    @field_validator('road_type')
    @classmethod
    def validate_road_type(cls, v):
        allowed_types = ['خیابان اصلی', 'خیابان فرعی', 'کوچه', 'بزرگراه']
        if v not in allowed_types:
            raise ValueError(f'نوع جاده باید یکی از موارد زیر باشد: {", ".join(allowed_types)}')
        return v
    
    @field_validator('coordinates')
    @classmethod
    def validate_coordinates(cls, v):
        if len(v) < 2:
            raise ValueError('حداقل 2 نقطه برای مسیر لازم است')
        if len(v) > 1000:
            raise ValueError('تعداد نقاط نباید بیشتر از 1000 باشد')
        for coord in v:
            if len(coord) != 2:
                raise ValueError('هر نقطه باید شامل دو مقدار (عرض و طول جغرافیایی) باشد')
            lat, lng = coord
            if not (-90 <= lat <= 90):
                raise ValueError('عرض جغرافیایی باید بین -90 تا 90 باشد')
            if not (-180 <= lng <= 180):
                raise ValueError('طول جغرافیایی باید بین -180 تا 180 باشد')
        return v


class RoadSubmissionCreate(BaseModel):
    road_name: str
    road_type: str
    coordinates: List[List[float]]


class POI(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    category: str
    poi_type: str
    location: List[float]
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 2:
            raise ValueError('نام مکان باید حداقل 2 کاراکتر باشد')
        if len(v) > 200:
            raise ValueError('نام مکان نباید بیشتر از 200 کاراکتر باشد')
        return v.strip()
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed_categories = ['عمومی', 'خصوصی']
        if v not in allowed_categories:
            raise ValueError(f'دسته‌بندی باید یکی از موارد زیر باشد: {", ".join(allowed_categories)}')
        return v
    
    @field_validator('location')
    @classmethod
    def validate_location(cls, v):
        if len(v) != 2:
            raise ValueError('موقعیت باید شامل دو مقدار (عرض و طول جغرافیایی) باشد')
        lat, lng = v
        if not (-90 <= lat <= 90):
            raise ValueError('عرض جغرافیایی باید بین -90 تا 90 باشد')
        if not (-180 <= lng <= 180):
            raise ValueError('طول جغرافیایی باید بین -180 تا 180 باشد')
        return v


class POICreate(BaseModel):
    name: str
    category: str
    poi_type: str
    location: List[float]


class PersonalLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    location: List[float]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) < 1:
            raise ValueError('نام مکان نمی‌تواند خالی باشد')
        if len(v) > 100:
            raise ValueError('نام مکان نباید بیشتر از 100 کاراکتر باشد')
        return v.strip()


class PersonalLocationCreate(BaseModel):
    name: str
    location: List[float]


class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class NotificationBroadcast(BaseModel):
    userId: str
    title: str
    message: str
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if len(v) < 1:
            raise ValueError('عنوان نمی‌تواند خالی باشد')
        if len(v) > 200:
            raise ValueError('عنوان نباید بیشتر از 200 کاراکتر باشد')
        return v.strip()
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if len(v) < 1:
            raise ValueError('پیام نمی‌تواند خالی باشد')
        if len(v) > 1000:
            raise ValueError('پیام نباید بیشتر از 1000 کاراکتر باشد')
        return v.strip()


class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    page_size: int
    total_pages: int
