/**
 * Component: Sidebar - Thanh bên trái navigation
 * 
 * Nhiệm vụ:
 * - Hiển thị menu secondary
 * - Navigation phụ cho các module
 * - Có thể thu gọn/mở rộng
 * 
 * Props:
 * - isOpen: boolean - Sidebar có mở hay không
 */

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ isOpen = true }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Menu items */}
      <nav className="sidebar-nav">
        {/* Nhóm: Quản lý cơ bản */}
        <div className="nav-group">
          <h3 className="nav-group-title">Quản Lý Cơ Bản</h3>
          <ul className="nav-items">
            <li>
              <Link to="/categories" className="nav-item">
                📂 Danh Mục
              </Link>
            </li>
            <li>
              <Link to="/items" className="nav-item">
                🍰 Sản Phẩm
              </Link>
            </li>
            <li>
              <Link to="/tables" className="nav-item">
                🪑 Bàn
              </Link>
            </li>
          </ul>
        </div>

        {/* Nhóm: Kinh doanh */}
        <div className="nav-group">
          <h3 className="nav-group-title">Kinh Doanh</h3>
          <ul className="nav-items">
            <li>
              <Link to="/orders" className="nav-item">
                📋 Đơn Hàng
              </Link>
            </li>
            <li>
              <Link to="/reports" className="nav-item">
                📊 Báo Cáo
              </Link>
            </li>
            <li>
              <Link to="/revenue" className="nav-item">
                💰 Doanh Thu
              </Link>
            </li>
          </ul>
        </div>

        {/* Nhóm: Cài đặt */}
        <div className="nav-group">
          <h3 className="nav-group-title">Cài Đặt</h3>
          <ul className="nav-items">
            <li>
              <Link to="/users" className="nav-item">
                👥 Người Dùng
              </Link>
            </li>
            <li>
              <Link to="/settings" className="nav-item">
                ⚙️ Cài Đặt
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
