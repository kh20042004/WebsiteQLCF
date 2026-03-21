/**
 * File: Cấu hình Axios client
 * 
 * Nhiệm vụ:
 * - Khởi tạo instance axios
 * - Cấu hình base URL từ .env (Vite: import.meta.env)
 * - Setup interceptor cho token JWT
 * - Xử lý lỗi chung
 */

import axios from 'axios';

/**
 * Khởi tạo Axios instance
 * - Base URL trỏ đến backend API
 * - Cấu hình timeout 10 giây
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor: Request
 * - Thêm JWT token vào header Authorization trước mỗi request
 */
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Nếu có token, thêm vào header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor: Response
 * - Extract data từ response backend ({ success, message, data })
 * - Nếu token hết hạn (401), redirect về login
 */
api.interceptors.response.use(
  (response) => {
    // Backend trả về { success: true, message: "...", data: {...} }
    // Extract data để dùng dễ hơn trong components
    return response.data.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    // Nếu lỗi 401 (Unauthorized) - token hết hạn hoặc invalid
    if (error.response?.status === 401) {
      // Xóa token và user
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect về login
      window.location.href = '/login';
    }

    // Lấy message lỗi từ response
    const message =
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi không xác định';

    // Log error để debug
    console.error('API Error:', error.response || error);

    return Promise.reject(new Error(message));
  }
);

/**
 * Hàm API GET
 * @param {string} endpoint - Đường dẫn API (vd: /tables)
 * @param {object} config - Cấu hình thêm (headers, params, ...)
 * @returns {Promise}
 */
export const apiGet = (endpoint, config = {}) => {
  return api.get(endpoint, config);
};

/**
 * Hàm API POST
 * @param {string} endpoint - Đường dẫn API
 * @param {object} data - Dữ liệu gửi lên
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiPost = (endpoint, data = {}, config = {}) => {
  return api.post(endpoint, data, config);
};

/**
 * Hàm API PUT
 * @param {string} endpoint - Đường dẫn API
 * @param {object} data - Dữ liệu cập nhật
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiPut = (endpoint, data = {}, config = {}) => {
  return api.put(endpoint, data, config);
};

/**
 * Hàm API DELETE
 * @param {string} endpoint - Đường dẫn API
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiDelete = (endpoint, config = {}) => {
  return api.delete(endpoint, config);
};

export default api;
