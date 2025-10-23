/**
 * Admin Panel API Service
 * All API calls for admin operations
 */
import { createApiClient } from './shared/utils/apiClient';
import { API_ENDPOINTS } from './shared/constants/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const api = createApiClient(BACKEND_URL);

// ==================== Authentication APIs ====================
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH_ME);
    return response.data;
  },
};

// ==================== Admin APIs ====================
export const adminAPI = {
  approveRoad: async (roadId) => {
    const response = await api.put(API_ENDPOINTS.ADMIN_ROADS_APPROVE(roadId));
    return response.data;
  },

  rejectRoad: async (roadId) => {
    const response = await api.put(API_ENDPOINTS.ADMIN_ROADS_REJECT(roadId));
    return response.data;
  },

  approvePOI: async (poiId) => {
    const response = await api.put(API_ENDPOINTS.ADMIN_POIS_APPROVE(poiId));
    return response.data;
  },

  rejectPOI: async (poiId) => {
    const response = await api.put(API_ENDPOINTS.ADMIN_POIS_REJECT(poiId));
    return response.data;
  },

  broadcastNotification: async (data) => {
    const response = await api.post(API_ENDPOINTS.ADMIN_NOTIFICATIONS_BROADCAST, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN_STATS);
    return response.data;
  },
};

// ==================== Roads APIs ====================
export const roadAPI = {
  getAll: async (params = {}) => {
    const { status, page = 1, page_size = 100 } = params;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('page_size', page_size);
    
    const response = await api.get(`${API_ENDPOINTS.ROADS}?${queryParams.toString()}`);
    return response.data;
  },
};

// ==================== POIs APIs ====================
export const poiAPI = {
  getAll: async (params = {}) => {
    const { status, category, page = 1, page_size = 100 } = params;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    if (category) queryParams.append('category', category);
    queryParams.append('page', page);
    queryParams.append('page_size', page_size);
    
    const response = await api.get(`${API_ENDPOINTS.POIS}?${queryParams.toString()}`);
    return response.data;
  },
};

export default api;
