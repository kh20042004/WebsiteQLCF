/**
 * ========================================
 * PRIVATE ROUTE (PROTECTED ROUTE)
 * ========================================
 * 
 * Component để bảo vệ các route cần xác thực
 * Chỉ cho phép người dùng đã đăng nhập truy cập
 * 
 * Cơ chế:
 * 1. Kiểm tra isAuthenticated từ AuthContext
 * 2. Nếu authenticated → Render component
 * 3. Nếu chưa authenticated → Redirect sang Login
 * 4. Nếu đang load → Show loading spinner
 * 
 * Cách sử dụng:
 * <PrivateRoute>
 *   <Dashboard />
 * </PrivateRoute>
 */

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loading } from '../components/Loading/Loading';

/**
 * Component PrivateRoute
 * 
 * @param {React.ReactNode} children - Component cần bảo vệ
 * @returns {React.ReactNode} - Component hoặc redirect
 */
const PrivateRoute = ({ children }) => {
  // Lấy auth state từ context
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // Nếu đang load → Show loading spinner
  if (isLoading) {
    return <Loading />;
  }

  // Nếu authenticated → Render component
  if (isAuthenticated) {
    return children;
  }

  // Nếu chưa authenticated → Redirect sang Login
  // replace=true: Không lưu lại history (để không quay lại)
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
