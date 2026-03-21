/**
 * ========================================
 * AXIOS API INSTANCE
 * ========================================
 * 
 * Cấu hình Axios instance:
 * - Base URL: http://localhost:3000
 * - Request interceptor: Tự động thêm JWT token vào Authorization header
 * - Response interceptor: Handle error responses
 * - Timeout: 5 giây
 * 
 * Sử dụng:
 * import api from './api';
 * api.get('/auth/profile');  // Tự động thêm token
 * 
 * Cơ chế Interceptor:
 * 1. Trước khi gửi request → Kiểm tra token ở localStorage
 * 2. Nếu có token → Thêm vào Authorization header
 * 3. Sau khi nhận response → Kiểm tra lỗi 401 (token hết hạn)
 * 4. Nếu 401 → Refresh token và gửi lại request
 */

import axios from 'axios';

// ============================================
// HẰNG SỐ
// ============================================
// Base URL của backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Timeout cho request (5 giây)
const REQUEST_TIMEOUT = 5000;

// ============================================
// TẠO AXIOS INSTANCE
// ============================================
/**
 * Tạo Axios instance với cấu hình mặc định
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
/**
 * Middleware chạy TRƯỚC khi gửi request
 * 
 * Công việc:
 * 1. Lấy JWT token từ localStorage
 * 2. Thêm token vào Authorization header (nếu có)
 * 3. Tiếp tục gửi request
 */
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');

    // Nếu có token → Thêm vào header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Nếu có lỗi khi setup request
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
/**
 * Middleware chạy SAU khi nhận response
 * 
 * Công việc:
 * 1. Kiểm tra status code của response
 * 2. Nếu 401 (Unauthorized) → Token hết hạn, cần refresh
 * 3. Nếu lỗi khác → Trả lỗi
 * 4. Nếu thành công → Trả response
 * 
 * Lưu ý: Hiện tại chưa implement auto-refresh token
 * Có thể implement sau nếu cần
 */
api.interceptors.response.use(
  (response) => {
    // Nếu response thành công (2xx)
    return response;
  },
  (error) => {
    // Nếu có error

    // Kiểm tra nếu là lỗi 401 (token hết hạn hoặc không hợp lệ)
    if (error.response?.status === 401) {
      // Xóa token hết hạn
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect về login page
      window.location.href = '/login';

      // Ẩn message error "Token hết hạn"
      return Promise.reject(
        new Error('Token hết hạn, vui lòng đăng nhập lại')
      );
    }

    // Nếu là lỗi khác
    if (error.response?.status === 500) {
      return Promise.reject(
        new Error('Lỗi server, vui lòng liên hệ với admin')
      );
    }

    // Nếu là lỗi mạng (không kết nối được)
    if (!error.response) {
      return Promise.reject(
        new Error('Lỗi kết nối, vui lòng kiểm tra internet')
      );
    }

    // Nếu backend return error message
    const errorMessage = error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

// ============================================
// EXPORT
// ============================================
export default api;
