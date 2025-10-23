/**
 * Shared API Client
 * Reusable axios instance configuration
 * Can be used in Admin Panel, Web App, and Mobile App
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

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
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
