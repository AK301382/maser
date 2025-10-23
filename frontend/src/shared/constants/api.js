/**
 * Shared API Constants
 * Used by both Admin Panel and Web App
 */

// Road Types
export const ROAD_TYPES = [
  'خیابان اصلی',
  'خیابان فرعی',
  'کوچه',
  'بزرگراه',
];

// POI Categories
export const POI_CATEGORIES = [
  'عمومی',
  'خصوصی',
];

// Status Types
export const STATUS_TYPES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  
  // Roads
  ROADS: '/roads',
  ROADS_USER: '/roads/user',
  
  // POIs
  POIS: '/pois',
  
  // Locations
  PERSONAL_LOCATIONS: '/locations/personal',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ: (id) => `/notifications/${id}/read`,
  
  // Admin
  ADMIN_ROADS_APPROVE: (id) => `/admin/roads/${id}/approve`,
  ADMIN_ROADS_REJECT: (id) => `/admin/roads/${id}/reject`,
  ADMIN_POIS_APPROVE: (id) => `/admin/pois/${id}/approve`,
  ADMIN_POIS_REJECT: (id) => `/admin/pois/${id}/reject`,
  ADMIN_NOTIFICATIONS_BROADCAST: '/admin/notifications/broadcast',
  ADMIN_STATS: '/admin/stats',
  
  // Health
  HEALTH: '/health',
};

// Coins Configuration
export const COINS_CONFIG = {
  PER_APPROVED_ROAD: 1,
  PER_APPROVED_POI: 1,
};

export default {
  ROAD_TYPES,
  POI_CATEGORIES,
  STATUS_TYPES,
  API_ENDPOINTS,
  COINS_CONFIG,
};
