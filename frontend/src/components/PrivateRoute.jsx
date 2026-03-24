/**
 * PrivateRoute Component - Bảo vệ các trang cần đăng nhập
 *
 * Cách hoạt động:
 * - Kiểm tra localStorage xem có token không
 * - Có token → cho phép truy cập trang (render children)
 * - Không có token → chuyển hướng về /login ngay lập tức
 *
 * Được dùng trong App.jsx để bọc toàn bộ layout chính
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Kiểm tra token có tồn tại trong localStorage không
  // Đây là chuẩn đơn giản nhất — phù hợp với cấu trúc app hiện tại
  const token = localStorage.getItem('token');

  if (!token) {
    // Chưa đăng nhập → chuyển về trang login
    // replace=true để không lưu trang bị chặn vào history (tránh nút Back quay lại)
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập → hiển thị nội dung bình thường
  return children;
};

export default PrivateRoute;
