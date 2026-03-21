/**
 * ========================================
 * AUTH SERVICE
 * ========================================
 * 
 * Lớp service xử lý các API call liên quan đến authentication
 * Gọi các endpoints từ backend
 * 
 * Exported functions:
 * - login(email, password)
 * - register(name, email, password, confirmPassword)
 * - getProfile()
 * - refreshToken(refreshToken)
 * - logout()
 * 
 * Sử dụng instance axios từ api.js (có interceptor JWT)
 */

import api from './api';

// ============================================
// HẰNG SỐ
// ============================================
// Base URL cho auth endpoints
const AUTH_URL = '/auth';

// ============================================
// FUNCTION: ĐĂNG NHẬP
// ============================================
/**
 * Đăng nhập
 * 
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise} - Response từ backend
 * 
 * Endpoint: POST /auth/login
 * Response: { status, message, data: { id, name, email, token } }
 * 
 * Cách sử dụng:
 * const response = await login('user@example.com', 'password123');
 * const { token } = response.data; // Lấy token
 */
export const login = async (email, password) => {
  try {
    const response = await api.post(`${AUTH_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    // Re-throw error để component handle
    throw error;
  }
};

// ============================================
// FUNCTION: ĐĂNG KÝ
// ============================================
/**
 * Đăng ký tài khoản mới
 * 
 * @param {string} name - Tên người dùng
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @param {string} passwordConfirm - Xác nhận mật khẩu
 * @returns {Promise} - Response từ backend
 * 
 * Endpoint: POST /auth/register
 * Response: { status, message, data: { id, name, email, token } }
 */
export const register = async (
  name,
  email,
  password,
  passwordConfirm
) => {
  try {
    const response = await api.post(`${AUTH_URL}/register`, {
      name,
      email,
      password,
      passwordConfirm,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// FUNCTION: LẤY THÔNG TIN NGƯỜI DÙNG
// ============================================
/**
 * Lấy thông tin cá nhân người dùng (Protected)
 * 
 * @returns {Promise} - Response từ backend
 * 
 * Endpoint: GET /auth/profile
 * Header: Authorization: Bearer <token>
 * Response: { status, data: { id, name, email } }
 * 
 * Yêu cầu: Phải có JWT token hợp lệ trong Authorization header
 */
export const getProfile = async () => {
  try {
    const response = await api.get(`${AUTH_URL}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// FUNCTION: REFRESH TOKEN
// ============================================
/**
 * Cấp JWT token mới từ refresh token
 * Dùng khi access token hết hạn
 * 
 * @param {string} refreshToken - Refresh token cũ
 * @returns {Promise} - Response từ backend
 * 
 * Endpoint: POST /auth/refresh
 * Response: { status, data: { token } }
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post(`${AUTH_URL}/refresh`, {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// FUNCTION: ĐĂNG XUẤT
// ============================================
/**
 * Đăng xuất
 * 
 * @returns {Promise} - Response từ backend
 * 
 * Endpoint: POST /auth/logout
 * Header: Authorization: Bearer <token>
 * Response: { status, message }
 * 
 * Lưu ý: Backend không "revoke" token
 * Frontend sẽ xóa token từ localStorage
 */
export const logout = async () => {
  try {
    const response = await api.post(`${AUTH_URL}/logout`);
    return response.data;
  } catch (error) {
    // Nếu logout fail, vẫn cho phép xóa token ở client
    console.warn('⚠️ Logout request failed:', error);
    return null;
  }
};

// ============================================
// EXPORT
// ============================================
export default {
  login,
  register,
  getProfile,
  refreshToken,
  logout,
};
