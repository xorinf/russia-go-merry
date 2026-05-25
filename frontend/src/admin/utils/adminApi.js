import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://yaksha-faq-backend.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('yaksha_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yaksha_token');
      localStorage.removeItem('yaksha_user');
      window.location.href = '/admin/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
