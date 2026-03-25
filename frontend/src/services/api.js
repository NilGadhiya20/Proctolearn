import axios from 'axios';
import toast from 'react-hot-toast';

const normalizeApiBase = (rawUrl) => {
  if (!rawUrl) return '';
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;
};

const envApiUrl = normalizeApiBase(import.meta.env.VITE_API_URL);
const fallbackApiUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;
const API_URL = envApiUrl || fallbackApiUrl;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', config.url, 'Token preview:', token.substring(0, 20) + '...');
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
let isRedirecting = false; // Prevent multiple redirects

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const status = error.response?.status;
    const responseData = error.response?.data;
    
    console.error('❌ API Error:', url, status, responseData);
    
    // Only handle 401 if it's an authentication error, not other issues
    if (status === 401 && !isRedirecting) {
      const errorMessage = (responseData?.message || '').toLowerCase();
      console.log('🔐 401 Error - Full response:', responseData);
      console.log('🔐 401 Error - Message check:', errorMessage);
      
      // Check if it's actually an auth/token error (not just validation)
      const isAuthError = errorMessage.includes('token') || 
                         errorMessage.includes('authentication') || 
                         errorMessage.includes('unauthorized') ||
                         errorMessage.includes('no authentication');
      
      if (isAuthError) {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on login/register page
        if (currentPath !== '/login' && currentPath !== '/register') {
          console.log('🚪 Redirecting to login - auth error detected');
          isRedirecting = true;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.', { id: 'session-expired' });
          
          // Use setTimeout to avoid multiple redirects
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
      } else {
        console.log('⚠️ 401 but NOT an auth error - allowing error to propagate');
        // Don't show toast for non-auth 401 errors, let the component handle it
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
