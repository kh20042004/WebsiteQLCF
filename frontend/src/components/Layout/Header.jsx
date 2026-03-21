import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Header = () => {
  const location = useLocation();

  // Helper function to check if route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#fafaf9]/70 backdrop-blur-lg border-b border-stone-200/60 transition-all">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center shadow-sm">
              <Icon icon="solar:cup-hot-linear" className="text-white text-lg" />
            </div>
            <span className="font-semibold tracking-tighter uppercase text-base text-stone-900">
              Roast<span className="text-amber-600">.</span>
            </span>
          </div>

          {/* Center Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-stone-500">
            <Link
              to="/dashboard"
              className={`${
                isActiveRoute('/dashboard')
                  ? 'text-stone-900 relative group'
                  : 'hover:text-stone-900 transition-colors duration-200'
              }`}
            >
              Bảng Điều Khiển / Người Dùng
              {isActiveRoute('/dashboard') && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md"></span>
              )}
            </Link>

            <Link
              to="/menu"
              className={`${
                isActiveRoute('/menu')
                  ? 'text-stone-900 relative group'
                  : 'hover:text-stone-900 transition-colors duration-200'
              }`}
            >
              Quản Lý Thực Đơn
              {isActiveRoute('/menu') && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md"></span>
              )}
            </Link>

            {/* Active State for Tables (Member 3) */}
            <Link
              to="/tables"
              className={`${
                isActiveRoute('/') || isActiveRoute('/tables')
                  ? 'text-stone-900 relative group'
                  : 'hover:text-stone-900 transition-colors duration-200'
              }`}
            >
              Tổng Quan Bàn
              {(isActiveRoute('/') || isActiveRoute('/tables')) && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md"></span>
              )}
            </Link>

            <Link
              to="/orders"
              className={`${
                isActiveRoute('/orders')
                  ? 'text-stone-900 relative group'
                  : 'hover:text-stone-900 transition-colors duration-200'
              }`}
            >
              Đơn Hàng Mới
              {isActiveRoute('/orders') && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md"></span>
              )}
            </Link>

            <Link
              to="/reports"
              className={`${
                isActiveRoute('/reports')
                  ? 'text-stone-900 relative group'
                  : 'hover:text-stone-900 transition-colors duration-200'
              }`}
            >
              Thanh Toán & Báo Cáo
              {isActiveRoute('/reports') && (
                <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-amber-600 rounded-t-md"></span>
              )}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100">
              <Icon icon="solar:bell-linear" className="text-xl" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>

            {/* Profile Dropdown (Hover Activated) */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full border border-stone-200 bg-white hover:border-stone-300 transition-colors">
                <img
                  src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <Icon icon="solar:alt-arrow-down-linear" className="text-stone-400 text-xs" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 ease-out z-50">
                <div className="p-1.5">
                  <a
                    href="#"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
                  >
                    <Icon icon="solar:user-linear" /> Hồ Sơ
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 rounded-lg transition-colors"
                  >
                    <Icon icon="solar:settings-linear" /> Cài Đặt
                  </a>
                  <div className="h-px bg-stone-100 my-1 mx-2"></div>
                  <a
                    href="#"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Icon icon="solar:logout-2-linear" /> Đăng Xuất
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;