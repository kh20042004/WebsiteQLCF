/**
 * App.jsx - Cấu hình routing chính của ứng dụng
 *
 * Cấu trúc route:
 * - /login         → Trang đăng nhập (công khai, không cần token)
 * - /* (còn lại)  → Bọc bởi PrivateRoute → yêu cầu đăng nhập
 *   - /            → TablesPage (trang Tổng Quan Bàn)
 *   - /tables      → TablesPage
 *   - /dashboard   → Dashboard
 *   - /menu        → MenuPage
 *   - /orders      → OrdersPage
 *   - /reports     → ReportsPage
 *   - *            → 404 NotFound
 *
 * Cơ chế bảo vệ:
 * PrivateRoute kiểm tra token trong localStorage.
 * Nếu không có → redirect /login tự động.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TableProvider } from './context/TableContext';
import { UIProvider } from './context/UIContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import BillPanel from './components/modals/BillPanel';
import AddTableModal from './components/modals/AddTableModal';
import ReportsPage from './pages/ReportsPage';
import Dashboard from './pages/Dashboard';

// Trang 404 — hiển thị khi không tìm thấy route
const NotFound = () => (
  <div className="flex-grow flex items-center justify-center text-stone-500">
    <div className="text-center">
      <h2 className="text-6xl font-bold mb-4">404</h2>
      <p className="text-xl">Trang không tồn tại</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---- ROUTE CÔNG KHAI: Trang đăng nhập ---- */}
        {/* Không cần token — ai cũng truy cập được */}
        <Route path="/login" element={<Login />} />

        {/* ---- ROUTE BẢO MẬT: Toàn bộ app chính ---- */}
        {/* PrivateRoute kiểm tra localStorage.token, redirect /login nếu chưa đăng nhập */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <TableProvider>
                <UIProvider>
                  {/* Layout wrapper: Header cố định + nội dung + Footer */}
                  <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917] selection:bg-amber-100 selection:text-amber-900">
                    <Header />

                    {/* Các trang con được render tại đây */}
                    <Routes>
                      {/* Trang mặc định → Tổng Quan Bàn */}
                      <Route path="/" element={<TablesPage />} />
                      <Route path="/tables" element={<TablesPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/menu" element={<MenuPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      {/* Redirect /login về / nếu đã đăng nhập (tránh truy cập login khi đã có token) */}
                      <Route path="/login" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>

                    <Footer />

                    {/* Modal toàn cục — luôn render sẵn, hiện/ẩn theo UIContext */}
                    <BillPanel />
                    <AddTableModal />
                  </div>
                </UIProvider>
              </TableProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;