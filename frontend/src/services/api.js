/**
 * Web App API Service
 * All API calls for user operations
 */
import { createApiClient } from '../shared/utils/apiClient';
import { API_ENDPOINTS } from '../shared/constants/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const api = createApiClient(BACKEND_URL);

// ==================== Authentication APIs ====================
export const authAPI = {
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH_REGISTER, userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH_ME);
    return response.data;
  },
};

// ==================== Road APIs ====================
export const roadAPI = {
  submit: async (roadData) => {
    const response = await api.post(API_ENDPOINTS.ROADS, roadData);
    return response.data;
  },

  getAll: async (params = {}) => {
    const { status, page = 1, page_size = 20 } = params;
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('page', page);
    queryParams.append('page_size', page_size);
    
    const response = await api.get(`${API_ENDPOINTS.ROADS}?${queryParams.toString()}`);
    return response.data;
  },

  getUserRoads: async () => {
    const response = await api.get(API_ENDPOINTS.ROADS_USER);
    return response.data;
  },
};

// ==================== POI APIs ====================
export const poiAPI = {
  create: async (poiData) => {
    const response = await api.post(API_ENDPOINTS.POIS, poiData);
    return response.data;
  },

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

// ==================== Personal Location APIs ====================
export const locationAPI = {
  create: async (locationData) => {
    const response = await api.post(API_ENDPOINTS.PERSONAL_LOCATIONS, locationData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.PERSONAL_LOCATIONS);
    return response.data;
  },
};

// ==================== Notification APIs ====================
export const notificationAPI = {
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS_READ(notificationId));
    return response.data;
  },
};

export default api;
