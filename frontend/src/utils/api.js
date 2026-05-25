import axios from 'axios';

// 1. Create a centralized Axios instance
// Uses the environment variable for the API URL, falling back to the production URL if missing
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://yaksha-faq-backend.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});

// 2. Request Interceptor
// Intercepts every outgoing API request to automatically attach the user's JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yaksha_token');
  
  // If a token exists in local storage, append it to the Authorization header
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  return config;
});

// 3. Response Interceptor
// Globally intercepts incoming API responses to catch authentication errors
api.interceptors.response.use(
  (res) => res, // Pass through successful responses unchanged
  (error) => {
    // If the backend returns a 401 Unauthorized (e.g., token expired or invalid)
    if (error.response?.status === 401) {
      // Clear stale credentials from local storage
      localStorage.removeItem('yaksha_token');
      localStorage.removeItem('yaksha_user');
      
      // Force a hard redirect to the login page
      window.location.href = '/login';
    }
    
    // Reject the promise so individual components can still catch and handle specific errors
    return Promise.reject(error);
  }
);

export default api;
