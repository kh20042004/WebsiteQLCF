import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TableProvider } from './context/TableContext';
import { UIProvider } from './context/UIContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import BillPanel from './components/modals/BillPanel';
import AddTableModal from './components/modals/AddTableModal';
import ReportsPage from './pages/ReportsPage';

// Placeholder pages for other nav items
const DashboardPage = () => (
  <div className="flex-grow flex items-center justify-center text-stone-500">
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2">Bảng Điều Khiển</h2>
      <p>Đang phát triển...</p>
    </div>
  </div>
);

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
      <TableProvider>
        <UIProvider>
          <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917] selection:bg-amber-100 selection:text-amber-900">
            <Header />

            <Routes>
              <Route path="/" element={<TablesPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Footer />

            {/* Global Modals */}
            <BillPanel />
            <AddTableModal />
          </div>
        </UIProvider>
      </TableProvider>
    </BrowserRouter>
  );
}

export default App;