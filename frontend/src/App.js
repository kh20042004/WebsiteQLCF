/**
 * File: Component App - Thành phần chính của ứng dụng
 * 
 * Nhiệm vụ:
 * - Định nghĩa routes
 * - Setup AuthContext để quản lý xác thực
 * - Render MainLayout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Import pages (sẽ được tạo sau)
// import Home from './pages/Home';
// import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang chính với MainLayout */}
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Các routes khác sẽ được thêm vào đây */}
          {/* Example: <Route path="/categories" element={<Categories />} /> */}
          
          {/* Default route - redirect về dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Route 404 - Trang không tìm thấy */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
