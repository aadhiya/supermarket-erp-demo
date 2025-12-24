import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export const API_BASE = 'http://localhost:5261';

const apiClient = axios.create({ 
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach token from AuthContext
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // or from AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 (basic version)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh (implement refresh endpoint later)
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
