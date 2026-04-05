/**
 * Component: AdminRoute
 * 
 * Nhiệm vụ: Bảo vệ các route chỉ dành cho ADMIN
 * 
 * Cách hoạt động:
 * 1. Kiểm tra user đã đăng nhập chưa → chưa thì redirect về /login
 * 2. Kiểm tra user có phải admin không → không phải thì hiện thông báo lỗi
 * 3. Nếu pass cả 2 bước → render children (trang được bảo vệ)
 * 
 * Sử dụng:
 * <Route path="/menu" element={<AdminRoute><MenuPage /></AdminRoute>} />
 * <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';

const AdminRoute = ({ children }) => {
  // Bước 1: Kiểm tra đã đăng nhập chưa
  if (!isAuthenticated()) {
    // Chưa đăng nhập → redirect về login
    return <Navigate to="/login" replace />;
  }

  // Bước 2: Kiểm tra có phải admin không
  if (!isAdmin()) {
    // Không phải admin → hiện trang lỗi
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon cảnh báo */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>

          {/* Tiêu đề lỗi */}
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            ⛔ Truy cập bị từ chối
          </h2>

          {/* Thông báo chi tiết */}
          <p className="text-stone-600 mb-6">
            Bạn không có quyền truy cập trang này. 
            <br />
            Chỉ <strong className="text-red-600">Quản trị viên (Admin)</strong> mới có thể xem trang này.
          </p>

          {/* Nút quay lại */}
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Bước 3: User là admin → cho phép truy cập
  return children;
};

export default AdminRoute;
