/**
 * Component: Header - Thanh tiêu đề / Navigation chính
 * 
 * Nhiệm vụ:
 * - Hiển thị logo và tên ứng dụng
 * - Menu navigation chính
 * - Nút đăng xuất
 * - Hiển thị thông tin người dùng đang đăng nhập
 * 
 * Props: (none)
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  const navigate = useNavigate();
  
  // Lấy thông tin người dùng từ localStorage (hoặc context)
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // Xóa token và thông tin người dùng
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect về trang đăng nhập
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Container header */}
      <div className="header-container">
        {/* Logo và tên app */}
        <div className="header-brand">
          <Link to="/" className="header-logo">
            <span className="logo-icon">☕</span>
            <span className="logo-text">Quản Lý Café</span>
          </Link>
        </div>

        {/* Navigation menu */}
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/categories" className="nav-link">Danh Mục</Link>
          <Link to="/items" className="nav-link">Menu</Link>
          <Link to="/tables" className="nav-link">Bàn</Link>
          <Link to="/orders" className="nav-link">Đơn Hàng</Link>
          <Link to="/reports" className="nav-link">Báo Cáo</Link>
        </nav>

        {/* User section - Bên phải header */}
        <div className="header-user">
          {user ? (
            <>
              {/* Hiển thị tên người dùng */}
              <span className="user-name">
                👤 {user.name}
              </span>
              
              {/* Nút đăng xuất */}
              <button 
                onClick={handleLogout} 
                className="btn-logout"
              >
                Đăng Xuất
              </button>
            </>
          ) : (
            <>
              {/* Nút đăng nhập nếu chưa login */}
              <Link to="/login" className="btn-login">
                Đăng Nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
