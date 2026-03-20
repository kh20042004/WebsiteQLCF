/**
 * File: Service xác thực
 * 
 * Nhiệm vụ:
 * - Gửi request đăng nhập/đăng ký
 * - Xác thực JWT token
 * - Lấy thông tin profile
 */

import { apiPost, apiGet } from './api';

/**
 * Service Auth - Đăng ký tài khoản
 * @param {object} data - { name, email, password, confirmPassword }
 * @returns {Promise} - Response từ server
 */
export const authRegister = (data) => {
  return apiPost('/auth/register', data);
};

/**
 * Service Auth - Đăng nhập
 * @param {object} data - { email, password }
 * @returns {Promise} - Response chứa token và user info
 */
export const authLogin = (data) => {
  return apiPost('/auth/login', data);
};

/**
 * Service Auth - Lấy thông tin profile
 * @returns {Promise} - Response chứa user info
 */
export const authGetProfile = () => {
  return apiGet('/auth/me');
};

/**
 * Hàm helper - Lưu token khi đăng nhập thành công
 * @param {string} token - JWT token
 * @param {object} user - Thông tin user
 */
export const saveAuthToken = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Hàm helper - Xóa token khi đăng xuất
 */
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Hàm helper - Kiểm tra xem có token hay không
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Hàm helper - Lấy thông tin user hiện tại
 * @returns {object|null}
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
