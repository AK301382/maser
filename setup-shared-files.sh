#!/bin/bash

# Script to setup shared files in frontend and admin-panel
# Run this after cloning the project

echo "🔧 Setting up shared files..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to create shared files in a directory
setup_shared() {
    local dir=$1
    echo "📁 Setting up shared files in $dir..."
    
    # Create directories
    mkdir -p "$dir/src/shared/utils"
    mkdir -p "$dir/src/shared/constants"
    
    # Create apiClient.js
    cat > "$dir/src/shared/utils/apiClient.js" << 'EOF'
/**
 * Shared API Client
 */
import axios from 'axios';

export const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL: `${baseURL}/api`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default createApiClient;
EOF

    # Create api.js (constants)
    cat > "$dir/src/shared/constants/api.js" << 'EOF'
/**
 * Shared API Constants
 */

export const ROAD_TYPES = [
  'خیابان اصلی',
  'خیابان فرعی',
  'کوچه',
  'بزرگراه',
];

export const POI_CATEGORIES = ['عمومی', 'خصوصی'];

export const STATUS_TYPES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const API_ENDPOINTS = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_ME: '/auth/me',
  ROADS: '/roads',
  ROADS_USER: '/roads/user',
  POIS: '/pois',
  PERSONAL_LOCATIONS: '/locations/personal',
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_READ: (id) => `/notifications/${id}/read`,
  ADMIN_ROADS_APPROVE: (id) => `/admin/roads/${id}/approve`,
  ADMIN_ROADS_REJECT: (id) => `/admin/roads/${id}/reject`,
  ADMIN_POIS_APPROVE: (id) => `/admin/pois/${id}/approve`,
  ADMIN_POIS_REJECT: (id) => `/admin/pois/${id}/reject`,
  ADMIN_NOTIFICATIONS_BROADCAST: '/admin/notifications/broadcast',
  ADMIN_STATS: '/admin/stats',
  HEALTH: '/health',
};

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
EOF

    echo -e "${GREEN}✅ Shared files created in $dir${NC}"
}

# Setup for frontend
if [ -d "frontend" ]; then
    setup_shared "frontend"
else
    echo -e "${RED}❌ frontend directory not found!${NC}"
fi

# Setup for admin-panel
if [ -d "admin-panel" ]; then
    setup_shared "admin-panel"
else
    echo -e "${RED}⚠️  admin-panel directory not found (optional)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. cd frontend && yarn install"
echo "2. cd backend && pip install -r requirements.txt"
echo "3. Create .env files (see SETUP_GUIDE_FA.md)"
echo "4. Run the project (see QUICK_START.md)"
