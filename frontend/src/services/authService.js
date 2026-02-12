import apiClient from './api.js';

// Register
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

// Login
export const loginUser = async (credentials) => {
  try {
    console.log('🔐 Auth Service: Posting to /auth/login', credentials);
    const response = await apiClient.post('/auth/login', credentials);
    console.log('✅ Auth Service: Login response received', response.data);
    
    if (response.data.success && response.data.data) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      
      console.log('💾 Auth Service: Saving token to localStorage');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Auth Service: Token and user saved');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Auth Service: Login error', error.response?.data || error.message);
    throw error;
  }
};

// Google Login
export const googleLogin = async ({ idToken, institutionCode }) => {
  try {
    const payload = { idToken, institutionCode };
    console.log('🔐 Auth Service: Posting to /auth/google');
    const response = await apiClient.post('/auth/google', payload);
    console.log('✅ Auth Service: Google login response', response.data);

    if (response.data.success && response.data.data) {
      const token = response.data.data.token;
      const user = response.data.data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  } catch (error) {
    console.error('❌ Auth Service: Google login error', error.response?.data || error.message);
    throw error;
  }
};

// Get Current User
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Refresh Token
export const refreshAccessToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh-token', { refreshToken });
  if (response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};
