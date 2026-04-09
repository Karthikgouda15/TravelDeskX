// /Users/karthikgouda/Desktop/TravelDesk/client/src/services/api.js
import axios from 'axios';

// Vite proxy will pass this to the backend server
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Condition for token refresh mechanism
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      error.config.url !== '/auth/login' &&
      error.config.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshErr) {
        // Redux can listen to 401s and log user out if refresh fails
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
