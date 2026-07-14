import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${import.meta.env.VITE_BACKEND_URL}/api`,
});

// Global interceptor for handling 401 Unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
