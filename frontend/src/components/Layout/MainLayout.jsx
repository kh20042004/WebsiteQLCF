/**
 * Component: MainLayout - Layout chính
 * 
 * Nhiệm vụ:
 * - Bao quanh tất cả các trang
 * - Chứa Header, Sidebar, Footer
 * - <Outlet /> để hiển thị các trang con
 * 
 * Props: (none)
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/MainLayout.css';

function MainLayout() {
  // State để kiểm soát sidebar (thumb-nail/mở)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hàm toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <Header />

      {/* Main content container */}
      <div className="layout-body">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Nội dung chính */}
        <main className="layout-main">
          {/* Button toggle sidebar (mobile) */}
          <button 
            className="btn-toggle-sidebar"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          {/* Outlet - React Router sẽ render trang hiện tại ở đây */}
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
