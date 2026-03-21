/**
 * Page: Dashboard - Trang chủ / Dashboard
 * * Đây là một template page cho các member tham khảo
 * Hãy xóa hoặc sửa theo nhu cầu
 * * Hiển thị:
 * - Thống kê cơ bản
 * - Chào mừng user
 * - Menu quick access
 */


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading/Loading';
import Alert from '../components/Alert/Alert';
import { useFetch } from '../hooks/useFetch';
import { apiGet } from '../services/api';
import { getDailyReport, getTopItems } from '../services/reportService';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [reportData, setReportData] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [topItems, setTopItems] = useState([]);
  const [isReportLoading, setIsReportLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsReportLoading(true);
      try {
        const dailyRes = await getDailyReport(selectedDate);
        const topRes = await getTopItems(selectedDate);

        setReportData({
          totalRevenue: dailyRes.totalRevenue || 0,
          totalOrders: dailyRes.totalOrders || 0
        });
        setTopItems(topRes || []);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu report:", error);
      } finally {
        setIsReportLoading(false);
      }
    };
    fetchReport();
  }, [selectedDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const { data: stats, loading } = useFetch(
    () => apiGet('/reports/statistics'),
    { dependencies: [] }
  );

  if (loading || isReportLoading) return <Loading />;

  return (
    <div className="dashboard">
      {showAlert && (
        <Alert
          type="success"
          message="Dữ liệu đã được cập nhật!"
          autoClose={3000}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Chào mừng, <strong>{user?.name || 'Người dùng'}</strong>! 👋
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 10px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <label style={{ fontWeight: 'bold' }}>Ngày thống kê:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ border: 'none', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-label">Tổng Doanh Thu</h3>
            <p className="stat-value" style={{ color: '#10b981' }}>
              {formatCurrency(reportData.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3 className="stat-label">Đơn Hàng Đã Xong</h3>
            <p className="stat-value" style={{ color: '#3b82f6' }}>
              {reportData.totalOrders}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <h3 className="stat-label">Bàn Đang Sử Dụng</h3>
            <p className="stat-value">
              {stats?.occupiedTables || '0'}/{stats?.totalTables || '0'}
            </p>
          </div>
        </div>

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

      <div className="info-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2>🏆 Top 5 Món Bán Chạy Nhất</h2>
        {topItems.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>Chưa có đơn hàng nào trong ngày này.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 0' }}>Hạng</th>
                <th style={{ padding: '10px 0' }}>Tên món</th>
                <th style={{ padding: '10px 0', textAlign: 'right' }}>Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0', fontWeight: 'bold', color: index < 3 ? '#f59e0b' : '#666' }}>#{index + 1}</td>
                  <td style={{ padding: '10px 0' }}>{item.name}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{item.totalSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

      <div className="info-section">
        <h2>Hướng Dẫn Sử Dụng</h2>
        <ul className="info-list">
          <li><strong>Dashboard:</strong> Xem thống kê tổng quan</li>
          <li><strong>Danh Mục:</strong> Quản lý các danh mục sản phẩm</li>
          <li><strong>Sản Phẩm:</strong> Tạo, chỉnh sửa, xóa sản phẩm</li>
          <li><strong>Bàn:</strong> Quản lý trạng thái các bàn</li>
          <li><strong>Đơn Hàng:</strong> Tạo và theo dõi đơn hàng</li>
          <li><strong>Báo Cáo:</strong> Xem thống kê doanh thu và bán hàng</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;