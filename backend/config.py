"""
Configuration module for MASER backend
Contains all application settings and constants
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'masir_database')

# Security Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production-masir-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

# CORS Configuration
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')

# Rate Limiting Configuration
RATE_LIMIT_PER_MINUTE = int(os.environ.get('RATE_LIMIT_PER_MINUTE', '60'))
RATE_LIMIT_PER_HOUR = int(os.environ.get('RATE_LIMIT_PER_HOUR', '1000'))

# Pagination Configuration
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Coin System Configuration
COINS_PER_APPROVED_ROAD = 1
COINS_PER_APPROVED_POI = 1

# Security Headers
SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
}
