import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests in future (when auth is implemented)
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Extract data and handle errors centrally
api.interceptors.response.use(
  (response) => {
    // Backend returns { success: true, message: "...", data: {...} }
    // Extract just the data for easier use in components
    return response.data.data || response.data;
  },
  (error) => {
    // Handle errors centrally
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi không xác định';

    // Log error for debugging
    console.error('API Error:', error.response || error);

    return Promise.reject(new Error(message));
  }
);

export default api;