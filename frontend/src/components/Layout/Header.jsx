/**
 * Header Component - Thanh điều hướng cố định phía trên (ĐÃ CÓ PHÂN QUYỀN)
 *
 * Chức năng:
 * - Logo + tên thương hiệu
 * - Nav links điều hướng giữa các trang (ẨN/HIỆN theo role)
 * - Dropdown hồ sơ người dùng:
 *   + Hiển thị tên, email và ROLE từ localStorage
 *   + Xem Hồ Sơ (modal inline)
 *   + Đăng Xuất (xóa token + user khỏi localStorage, reload trang)
 *
 * 📌 PHÂN QUYỀN:
 * - Staff: Chỉ thấy Dashboard, Bàn, Đơn hàng
 * - Admin: Thấy tất cả (thêm Thực đơn, Báo cáo)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { isAdmin } from '../../utils/auth'; // Import helper function
import NotificationContainer from '../common/NotificationContainer'; // ✨ Import component thông báo

const Header = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  // Trạng thái dropdown profile (click để mở, click ngoài để đóng)
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Trạng thái modal Hồ Sơ
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Ref để detect click bên ngoài dropdown
  const profileRef = useRef(null);

  // Lấy user từ localStorage — không cần AuthContext
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; }
    catch { return null; }
  })();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: kiểm tra route đang active
  const isActiveRoute = (path) => location.pathname === path;

  /**
   * Xử lý đăng xuất
   * 1. Xóa token và thông tin user khỏi localStorage
   * 2. Chuyển hướng về trang login (hoặc reload về /)
   */
  const handleLogout = () => {
    // Xóa tất cả dữ liệu xác thực khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Đóng dropdown
    setIsProfileOpen(false);

    // Chuyển về trang đăng nhập sau khi đăng xuất
    window.location.href = '/login';
  };

  /**
   * Lấy chữ cái đầu của tên để làm avatar chữ
   * nếu không có tên → dùng ký tự đầu của email
   */
  const getAvatarInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <>
      {/* ===== HEADER CHÍNH ===== */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#fafaf9]/70 backdrop-blur-lg border-b border-stone-200/60 transition-all">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo + tên thương hiệu */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shadow-sm">
                <Icon icon="solar:cup-hot-linear" className="text-white text-lg" />
              </div>
              <span className="font-semibold tracking-tighter uppercase text-base text-stone-900">
                Roast<span className="text-amber-600">.</span>
              </span>
            </Link>

            {/* Nav links giữa (Desktop) - Ẩn/hiện theo role */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-500">
              {/* Dashboard - TẤT CẢ user đều thấy */}
              <Link
                to="/dashboard"
                className={`${
                  isActiveRoute('/dashboard')
                    ? 'text-stone-900 relative group'
                    : 'hover:text-stone-900 transition-colors duration-200'
                }`}
              >
                Dashboard
                {isActiveRoute('/dashboard') && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md" />
                )}
              </Link>

              {/* Bàn - TẤT CẢ user đều thấy */}
              <Link
                to="/tables"
                className={`${
                  isActiveRoute('/') || isActiveRoute('/tables')
                    ? 'text-stone-900 relative group'
                    : 'hover:text-stone-900 transition-colors duration-200'
                }`}
              >
                Bàn
                {(isActiveRoute('/') || isActiveRoute('/tables')) && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md" />
                )}
              </Link>

              {/* Đơn hàng - TẤT CẢ user đều thấy */}
              <Link
                to="/orders"
                className={`${
                  isActiveRoute('/orders')
                    ? 'text-stone-900 relative group'
                    : 'hover:text-stone-900 transition-colors duration-200'
                }`}
              >
                Đơn Hàng
                {isActiveRoute('/orders') && (
                  <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md" />
                )}
              </Link>

              {/* Thực đơn - CHỈ ADMIN mới thấy 🔒 */}
              {isAdmin() && (
                <Link
                  to="/menu"
                  className={`${
                    isActiveRoute('/menu')
                      ? 'text-stone-900 relative group'
                      : 'hover:text-stone-900 transition-colors duration-200'
                  }`}
                >
                  Thực Đơn
                  {isActiveRoute('/menu') && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md" />
                  )}
                </Link>
              )}

              {/* Báo cáo - CHỈ ADMIN mới thấy 🔒 */}
              {isAdmin() && (
                <Link
                  to="/reports"
                  className={`${
                    isActiveRoute('/reports')
                      ? 'text-stone-900 relative group'
                      : 'hover:text-stone-900 transition-colors duration-200'
                  }`}
                >
                  Báo Cáo
                  {isActiveRoute('/reports') && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md" />
                  )}
                </Link>
              )}
            </nav>

            {/* Vùng bên phải: Thông báo + Profile */}
            <div className="flex items-center gap-4">

              {/* 
                🔔 HỆ THỐNG THÔNG BÁO MỚI
                - Icon chuông với badge đỏ hiển thị số thông báo chưa đọc
                - Click để mở dropdown danh sách thông báo
                - Tự động cập nhật realtime (interval 30s)
                - Hỗ trợ đánh dấu đã đọc, xóa thông báo
                - Phân quyền: Staff và Admin đều xem được thông báo của mình
              */}
              <NotificationContainer />

              {/* ---- DROPDOWN HỒ SƠ ---- */}
              <div className="relative" ref={profileRef}>

                {/* Nút mở dropdown — hiển thị avatar chữ hoặc ảnh */}
                <button
                  onClick={() => setIsProfileOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border border-stone-200 bg-white hover:border-stone-300 transition-colors"
                >
                  {/* Avatar: chữ cái đầu với gradient */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-black">
                    {getAvatarInitials()}
                  </div>
                  <Icon
                    icon="solar:alt-arrow-down-linear"
                    className={`text-stone-400 text-xs transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Menu dropdown (click-activated, không phải hover) */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-stone-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                    {/* Thông tin user ở đầu dropdown */}
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900 truncate">
                        {user?.name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {user?.email || 'Chưa đăng nhập'}
                      </p>
                      {/* Hiển thị role với badge màu */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user?.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user?.role === 'admin' ? '👑 Admin' : '👤 Staff'}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5">
                      {/* Xem Hồ Sơ */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
                      >
                        <Icon icon="solar:user-linear" />
                        Hồ Sơ Cá Nhân
                      </button>

                      {/* Cài Đặt */}
                      <button
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
                      >
                        <Icon icon="solar:settings-linear" />
                        Cài Đặt
                      </button>

                      {/* Đường kẻ phân cách */}
                      <div className="h-px bg-stone-100 my-1 mx-2" />

                      {/* Đăng Xuất */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Icon icon="solar:logout-2-linear" />
                        Đăng Xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ===== MODAL HỒ SƠ CÁ NHÂN ===== */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsProfileModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            {/* Header modal */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-700 p-6 text-white relative">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <Icon icon="solar:close-circle-linear" className="text-xl" />
              </button>

              {/* Avatar lớn */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-lg">
                {getAvatarInitials()}
              </div>

              {/* Tên người dùng */}
              <h2 className="text-xl font-bold">{user?.name || 'Người dùng'}</h2>
              <p className="text-white/60 text-sm mt-0.5">{user?.email || '—'}</p>
            </div>

            {/* Nội dung hồ sơ */}
            <div className="p-6 space-y-4">

              {/* Thông tin chi tiết */}
              {[
                { icon: 'solar:user-id-linear',   label: 'Họ và tên',    value: user?.name   || 'Chưa cập nhật' },
                { icon: 'solar:letter-linear',     label: 'Email',        value: user?.email  || 'Chưa cập nhật' },
                { icon: 'solar:shield-user-linear',label: 'Vai trò',      value: user?.role === 'admin' ? '👑 Quản trị viên' : '👤 Nhân viên' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon icon={icon} className="text-stone-600 text-lg" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-400 font-medium">{label}</p>
                    <p className="text-sm font-semibold text-stone-900 mt-0.5 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: nút đăng xuất */}
            <div className="px-6 pb-6">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-semibold text-sm hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="solar:logout-2-linear" />
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;