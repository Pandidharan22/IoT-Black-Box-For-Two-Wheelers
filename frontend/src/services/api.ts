import axios from 'axios';
import type { Device, DeviceLocation } from '../types/device';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Device API calls
export const deviceApi = {
  getAll: async (): Promise<Device[]> => {
    const response = await apiClient.get<Device[]>('/api/devices');
    return response.data;
  },
  getById: async (deviceId: string): Promise<Device> => {
    const response = await apiClient.get<Device>(`/api/devices/${deviceId}`);
    return response.data;
  },
  create: (data: Partial<Device>) => apiClient.post('/api/devices', data),
  update: (deviceId: string, data: Partial<Device>) => apiClient.patch(`/api/devices/${deviceId}`, data),
  getStatus: (deviceId: string) => apiClient.get(`/api/devices/${deviceId}/status`),
};

// Event API calls
export const eventApi = {
  getCrashes: (params?: any) => apiClient.get('/api/events/crashes', { params }),
  getCrashById: (eventId: string) => apiClient.get(`/api/events/crashes/${eventId}`),
  updateCrash: (eventId: string, data: any) => apiClient.patch(`/api/events/crashes/${eventId}`, data),
  
  getPanics: (params?: any) => apiClient.get('/api/events/panics', { params }),
  getPanicById: (eventId: string) => apiClient.get(`/api/events/panics/${eventId}`),
  updatePanic: (eventId: string, data: any) => apiClient.patch(`/api/events/panics/${eventId}`, data),
};

// Telemetry API calls
export const telemetryApi = {
  getByDevice: (deviceId: string, params?: any) => 
    apiClient.get(`/api/telemetry/device/${deviceId}`, { params }),
  getLastLocation: async (deviceId: string): Promise<DeviceLocation | null> => {
    try {
      const response = await apiClient.get<DeviceLocation>(`/api/telemetry/${deviceId}/location`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get location for device ${deviceId}:`, error);
      return null;
    }
  },
  create: (data: any) => apiClient.post('/api/telemetry', data),
};

export default apiClient;
