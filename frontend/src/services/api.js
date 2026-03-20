/**
 * File: Cấu hình Axios client
 * 
 * Nhiệm vụ:
 * - Khởi tạo instance axios
 * - Cấu hình base URL từ .env
 * - Setup interceptor cho token JWT
 * - Xử lý lỗi chung
 */

import axios from 'axios';

/**
 * Khởi tạo Axios instance
 * - Base URL trỏ đến backend API
 * - Cấu hình timeout 10 giây
 */
const API_CLIENT = axios.create({
  // Sử dụng biến môi trường, nếu không có thì dùng localhost
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor: Request
 * - Thêm JWT token vào header Authorization trước mỗi request
 */
API_CLIENT.interceptors.request.use(
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
 * - Xử lý lỗi chung
 * - Nếu token hết hạn (401), redirect về login
 */
API_CLIENT.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu lỗi 401 (Unauthorized) - token hết hạn hoặc invalid
    if (error.response?.status === 401) {
      // Xóa token và user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect về login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Hàm API GET
 * @param {string} endpoint - Đường dẫn API (vd: /auth/me)
 * @param {object} config - Cấu hình thêm (headers, params, ...)
 * @returns {Promise}
 */
export const apiGet = (endpoint, config = {}) => {
  return API_CLIENT.get(endpoint, config);
};

/**
 * Hàm API POST
 * @param {string} endpoint - Đường dẫn API
 * @param {object} data - Dữ liệu gửi lên
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiPost = (endpoint, data = {}, config = {}) => {
  return API_CLIENT.post(endpoint, data, config);
};

/**
 * Hàm API PUT
 * @param {string} endpoint - Đường dẫn API
 * @param {object} data - Dữ liệu cập nhật
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiPut = (endpoint, data = {}, config = {}) => {
  return API_CLIENT.put(endpoint, data, config);
};

/**
 * Hàm API DELETE
 * @param {string} endpoint - Đường dẫn API
 * @param {object} config - Cấu hình thêm
 * @returns {Promise}
 */
export const apiDelete = (endpoint, config = {}) => {
  return API_CLIENT.delete(endpoint, config);
};

export default API_CLIENT;
