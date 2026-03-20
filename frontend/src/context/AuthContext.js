/**
 * File: AuthContext - Context API để quản lý xác thực
 * 
 * Nhiệm vụ:
 * - Quản lý trạng thái đăng nhập
 * - Lưu trữ thông tin user hiện tại
 * - Cung cấp hàm login/logout
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

/**
 * Tạo Context
 */
const AuthContext = createContext();

/**
 * AuthProvider Component
 * - Bọc ứng dụng để cung cấp auth data
 * - Sử dụng props: children
 */
export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Effect: Kiểm tra có token hay không khi app mount
   */
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * Hàm đăng nhập
   * @param {object} userData - Thông tin user từ login response
   * @param {string} token - JWT token
   */
  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Hàm đăng xuất
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Hàm cập nhật thông tin user
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Value cung cấp
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook: Sử dụng AuthContext
 * @returns {object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
};
