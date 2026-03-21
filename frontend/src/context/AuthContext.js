/**
 * ========================================
 * AUTH CONTEXT
 * ========================================
 * 
 * Quản lý state xác thực toàn bộ app
 * Cung cấp:
 * - user: Thông tin người dùng đang đăng nhập
 * - isAuthenticated: Người dùng đã đăng nhập chưa
 * - isLoading: Đang load data
 * - login(email, password): Hàm đăng nhập
 * - register(name, email, password, confirmPassword): Hàm đăng ký
 * - logout(): Hàm đăng xuất
 * - checkAuth(): Kiểm tra người dùng có token không (dùng khi refresh page)
 * 
 * Sử dụng:
 * const { user, isAuthenticated, login, logout } = useContext(AuthContext);
 */

import React, { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

// Tạo Context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  // ============================================
  // STATE
  // ============================================

  // Thông tin người dùng hiện tại
  const [user, setUser] = useState(null);

  // Trạng thái load
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái xác thực
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ============================================
  // FUNCTION: KIỂM TRA AUTH KHI LOAD TRANG
  // ============================================
  /**
   * Chạy lần đầu khi app load
   * Kiểm tra xem có token lưu ở localStorage không
   * Nếu có → lấy user info từ API
   */
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      // Nếu có token → set authenticated
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Lỗi kiểm tra auth:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FUNCTION: ĐĂNG NHẬP
  // ============================================
  /**
   * Đăng nhập người dùng
   * 
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * 
   * Các bước:
   * 1. Gọi API login
   * 2. Lưu token vào localStorage
   * 3. Lưu user info vào localStorage + state
   * 4. Set isAuthenticated = true
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      // Gọi API login từ authService
      const response = await authService.login(email, password);

      // Lấy token từ response
      const { token, ...userInfo } = response.data;

      // Lưu token vào localStorage (dùng cho axios interceptor)
      localStorage.setItem('token', token);

      // Lưu user info vào localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Update state
      setUser(userInfo);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      // Nếu login fail, throw error
      throw new Error(
        error.response?.data?.message || 'Đăng nhập thất bại'
      );
    } finally {
      setIsLoading(false);
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
   * @param {string} confirmPassword - Xác nhận mật khẩu
   * 
   * Các bước:
   * 1. Gọi API register
   * 2. Lưu token + user info
   * 3. Set authenticated = true (tương tự như login)
   */
  const register = async (name, email, password, confirmPassword) => {
    try {
      setIsLoading(true);

      // Verify password match (double check ở client)
      if (password !== confirmPassword) {
        throw new Error('Mật khẩu không khớp');
      }

      // Gọi API register
      const response = await authService.register(
        name,
        email,
        password,
        confirmPassword
      );

      // Lấy token
      const { token, ...userInfo } = response.data;

      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Update state
      setUser(userInfo);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 'Đăng ký thất bại'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // FUNCTION: ĐĂNG XUẤT
  // ============================================
  /**
   * Đăng xuất người dùng
   * 
   * Các bước:
   * 1. Gọi API logout (optional, server không làm gì)
   * 2. Xóa token + user từ localStorage
   * 3. Reset state
   */
  const logout = async () => {
    try {
      setIsLoading(true);

      // Gọi API logout (nếu backend cần)
      await authService.logout();
    } catch (error) {
      console.error('❌ Lỗi logout:', error);
    } finally {
      // Xóa token + user từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // ============================================
  // VALUE PROVIDER
  // ============================================
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
