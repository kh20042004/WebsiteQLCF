/**
 * Page: Dashboard - Trang chủ / Dashboard
 * 
 * Đây là một template page cho các member tham khảo
 * Hãy xóa hoặc sửa theo nhu cầu
 * 
 * Hiển thị:
 * - Thống kê cơ bản
 * - Chào mừng user
 * - Menu quick access
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import { useFetch } from '../hooks/useFetch';
import { apiGet } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  // Lấy user từ Auth context
  const { user } = useAuth();
  const [showAlert, setShowAlert] = useState(false);

  // Fetch thống kê (ví dụ)
  const { data: stats, loading } = useFetch(
    () => apiGet('/reports/statistics'),
    { dependencies: [] }
  );

  if (loading) return <Loading />;

  return (
    <div className="dashboard">
      {/* Alert ví dụ */}
      {showAlert && (
        <Alert 
          type="success" 
          message="Dữ liệu đã được cập nhật!" 
          autoClose={3000}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header section */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">
          Chào mừng, <strong>{user?.name || 'Người dùng'}</strong>! 👋
        </p>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        {/* Thẻ thống kê 1 */}
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-label">Tổng Doanh Thu</h3>
            <p className="stat-value">
              {stats?.totalRevenue || '0'} ₫
            </p>
          </div>
        </div>

        {/* Thẻ thống kê 2 */}
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-label">Đơn Hàng Hôm Nay</h3>
            <p className="stat-value">
              {stats?.todayOrders || '0'}
            </p>
          </div>
        </div>

        {/* Thẻ thống kê 3 */}
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <h3 className="stat-label">Bàn Đang Sử Dụng</h3>
            <p className="stat-value">
              {stats?.occupiedTables || '0'}/{stats?.totalTables || '0'}
            </p>
          </div>
        </div>

        {/* Thẻ thống kê 4 */}
        <div className="stat-card">
          <div className="stat-icon">🍰</div>
          <div className="stat-content">
            <h3 className="stat-label">Sản Phẩm</h3>
            <p className="stat-value">
              {stats?.totalItems || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <h2>Thao Tác Nhanh</h2>
        <div className="actions-grid">
          <a href="/orders" className="action-btn action-btn-primary">
            ➕ Tạo Đơn Hàng Mới
          </a>
          <a href="/categories" className="action-btn action-btn-secondary">
            📂 Quản Lý Danh Mục
          </a>
          <a href="/items" className="action-btn action-btn-secondary">
            🍰 Quản Lý Sản Phẩm
          </a>
          <a href="/tables" className="action-btn action-btn-secondary">
            🪑 Quản Lý Bàn
          </a>
          <a href="/reports" className="action-btn action-btn-secondary">
            📊 Xem Báo Cáo
          </a>
          <button 
            onClick={() => setShowAlert(true)}
            className="action-btn action-btn-secondary"
          >
            🔄 Refresh Dữ Liệu
          </button>
        </div>
      </div>

      {/* Info section */}
      <div className="info-section">
        <h2>Hướng Dẫn Sử Dụng</h2>
        <ul className="info-list">
          <li>
            <strong>Dashboard:</strong> Xem thống kê tổng quan
          </li>
          <li>
            <strong>Danh Mục:</strong> Quản lý các danh mục sản phẩm
          </li>
          <li>
            <strong>Sản Phẩm:</strong> Tạo, chỉnh sửa, xóa sản phẩm
          </li>
          <li>
            <strong>Bàn:</strong> Quản lý trạng thái các bàn
          </li>
          <li>
            <strong>Đơn Hàng:</strong> Tạo và theo dõi đơn hàng
          </li>
          <li>
            <strong>Báo Cáo:</strong> Xem thống kê doanh thu và bán hàng
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
