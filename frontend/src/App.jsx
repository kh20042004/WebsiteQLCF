/**
 * App.jsx - Cấu hình routing chính của ứng dụng (ĐÃ CÓ PHÂN QUYỀN)
 *
 * Cấu trúc route:
 * - /login         → Trang đăng nhập (công khai, không cần token)
 * - /register      → Trang đăng ký (công khai)
 * - /* (còn lại)   → Bọc bởi PrivateRoute → yêu cầu đăng nhập
 *   - /            → TablesPage (trang Tổng Quan Bàn)
 *   - /tables      → TablesPage (Staff + Admin)
 *   - /dashboard   → Dashboard (Staff + Admin - nội dung khác nhau theo role)
 *   - /menu        → MenuPage (CHỈ ADMIN - quản lý thực đơn) 🔒
 *   - /orders      → OrdersPage (Staff + Admin)
 *   - /reports     → ReportsPage (CHỈ ADMIN - báo cáo doanh thu) 🔒
 *   - /promotions  → PromotionsPage (CHỈ ADMIN - quản lý khuyến mãi) 🔒
 *   - /inventory   → InventoryPage (CHỈ ADMIN - quản lý kho) 🔒
 *   - *            → 404 NotFound
 *
 * 📌 PHÂN QUYỀN:
 * - PrivateRoute: Kiểm tra đã đăng nhập chưa (token)
 * - AdminRoute: Kiểm tra phải là admin (role = 'admin')
 * 
 * Cơ chế bảo vệ:
 * - PrivateRoute kiểm tra token trong localStorage
 * - AdminRoute kiểm tra role = 'admin'
 * - Nếu không pass → redirect hoặc hiện thông báo lỗi
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TableProvider } from './context/TableContext';
import { UIProvider } from './context/UIContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; // Import AdminRoute mới tạo
import Login from './pages/Login';
import Register from './pages/Register';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import BillPanel from './components/modals/BillPanel';
import AddTableModal from './components/modals/AddTableModal';
import ReportsPage from './pages/ReportsPage';
import Dashboard from './pages/Dashboard';
import PromotionsPage from './pages/PromotionsPage';  // ✨ Trang quản lý khuyến mãi
import InventoryPage from './pages/InventoryPage';    // ✨ Trang quản lý kho nguyên liệu
import ShiftsPage from './pages/ShiftsPage';          // ✨ Trang quản lý ca làm việc

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

        {/* ---- ROUTE CÔNG KHAI: Đăng nhập & Đăng ký ---- */}
        {/* Không cần token — ai cũng truy cập được */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
                      {/* ===== TRANG CHO TẤT CẢ USER (Staff + Admin) ===== */}
                      
                      {/* Trang mặc định → Tổng Quan Bàn */}
                      <Route path="/" element={<TablesPage />} />
                      
                      {/* Trang Bàn */}
                      <Route path="/tables" element={<TablesPage />} />
                      
                      {/* Dashboard - nội dung sẽ khác nhau theo role (xử lý bên trong Dashboard.jsx) */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Trang Đơn hàng */}
                      <Route path="/orders" element={<OrdersPage />} />


                      {/* ===== TRANG CHỈ DÀNH CHO ADMIN ===== */}
                      
                      {/* Trang Thực đơn - CHỈ ADMIN (quản lý menu: CRUD categories + items) 🔒 */}
                      <Route 
                        path="/menu" 
                        element={
                          <AdminRoute>
                            <MenuPage />
                          </AdminRoute>
                        } 
                      />
                      
                      {/* Trang Báo cáo - CHỈ ADMIN (doanh thu, thống kê kinh doanh) 🔒 */}
                      <Route 
                        path="/reports" 
                        element={
                          <AdminRoute>
                            <ReportsPage />
                          </AdminRoute>
                        } 
                      />

                      {/* Trang Khuyến mãi - Staff + Admin (Staff xem, Admin CRUD) */}
                      <Route path="/promotions" element={<PromotionsPage />} />

                      {/* Trang Kho - Staff + Admin (Staff xem + nhập hàng, Admin CRUD) */}
                      <Route path="/inventory" element={<InventoryPage />} />

                      {/* Trang Ca làm việc - Staff + Admin (Staff xem + check-in/out, Admin CRUD) */}
                      <Route path="/shifts" element={<ShiftsPage />} />


                      {/* Redirect /login về / nếu đã đăng nhập (tránh truy cập login khi đã có token) */}
                      <Route path="/login" element={<Navigate to="/" replace />} />
                      
                      {/* 404 - Trang không tồn tại */}
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