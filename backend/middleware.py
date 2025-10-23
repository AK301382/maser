""" 
Custom middleware for MASER application
Includes rate limiting, security headers, and request logging
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from datetime import datetime, timedelta
from collections import defaultdict
import time
import logging
from config import RATE_LIMIT_PER_MINUTE, RATE_LIMIT_PER_HOUR, SECURITY_HEADERS

logger = logging.getLogger(__name__)

# In-memory rate limiting store (use Redis in production)
rate_limit_store = defaultdict(lambda: {'minute': [], 'hour': []})


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent abuse
    Limits requests per IP address
    """
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health check endpoints
        if request.url.path in ['/api/', '/api/health']:
            return await call_next(request)
        
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean old entries
        rate_limit_store[client_ip]['minute'] = [
            t for t in rate_limit_store[client_ip]['minute'] 
            if current_time - t < 60
        ]
        rate_limit_store[client_ip]['hour'] = [
            t for t in rate_limit_store[client_ip]['hour'] 
            if current_time - t < 3600
        ]
        
        # Check rate limits
        minute_count = len(rate_limit_store[client_ip]['minute'])
        hour_count = len(rate_limit_store[client_ip]['hour'])
        
        if minute_count >= RATE_LIMIT_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} (per minute)")
            raise HTTPException(
                status_code=429,
                detail="تعداد درخواست‌ها بیش از حد مجاز است. لطفا کمی صبر کنید."
            )
        
        if hour_count >= RATE_LIMIT_PER_HOUR:
            logger.warning(f"Rate limit exceeded for IP: {client_ip} (per hour)")
            raise HTTPException(
                status_code=429,
                detail="تعداد درخواست‌های ساعتی شما به حد مجاز رسیده است."
            )
        
        # Add current request
        rate_limit_store[client_ip]['minute'].append(current_time)
        rate_limit_store[client_ip]['hour'].append(current_time)
        
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers['X-RateLimit-Limit-Minute'] = str(RATE_LIMIT_PER_MINUTE)
        response.headers['X-RateLimit-Remaining-Minute'] = str(RATE_LIMIT_PER_MINUTE - minute_count - 1)
        response.headers['X-RateLimit-Limit-Hour'] = str(RATE_LIMIT_PER_HOUR)
        response.headers['X-RateLimit-Remaining-Hour'] = str(RATE_LIMIT_PER_HOUR - hour_count - 1)
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log all incoming requests for monitoring and debugging
    """
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host}"
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} "
            f"in {process_time:.2f}s"
        )
        
        # Add process time header
        response.headers['X-Process-Time'] = f"{process_time:.4f}"
        
        return response
