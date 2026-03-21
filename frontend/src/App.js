/**
 * ========================================
 * APP COMPONENT - MAIN ROUTING
 * ========================================
 * 
 * Component chính của ứng dụng
 * Cấu hình:
 * - Routes (public & private)
 * - Layout cho từng route
 * - AuthProvider wrapper (toàn bộ app)
 * 
 * Routes:
 * 1. /login - Trang đăng nhập (public)
 * 2. /register - Trang đăng ký (public)
 * 3. /dashboard - Trang chính (protected)
 * 4. * - 404 Not Found
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';


// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Styles
import './App.css';

import Dashboard from './pages/Dashboard';

/**
 * Main App Component
 * 
 * Cấu trúc:
 * <Router>
 *   <AuthProvider>
 *     <Routes>
 *       - Public routes (login, register)
 *       - Private routes (dashboard)
 *       - Catch-all (404)
 *     </Routes>
 *   </AuthProvider>
 * </Router>
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* ============================================
              PUBLIC ROUTES (Không cần xác thực)
              ============================================ */}

          {/* Redirect root sang login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Trang Đăng Nhập */}
          <Route path="/login" element={<Login />} />

          {/* Trang Đăng Ký */}
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />

          {/* ============================================
              PRIVATE ROUTES (Cần xác thực)
              ============================================ */}

          {/* Trang Dashboard (MainLayout wrapper) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* ============================================
              CATCH-ALL (404 Page)
              ============================================ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
