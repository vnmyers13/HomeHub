import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Dynamically import to avoid circular dependency
      const { useAuthStore } = await import('../stores/auth');
      useAuthStore.getState().clearUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
