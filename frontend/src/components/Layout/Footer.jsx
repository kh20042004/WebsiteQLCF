import React from 'react';
import { Icon } from '@iconify/react';

const Footer = () => {
  return (
    <footer className="bg-[#171412] text-stone-400 py-12 border-t border-stone-800 mt-auto">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center">
                <Icon icon="solar:cup-hot-linear" className="text-stone-300" />
              </div>
              <span className="font-semibold tracking-tighter uppercase text-sm text-stone-200">
                Roast<span className="text-amber-600">.</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs mb-6 text-stone-500">
              Hệ thống quản lý quán cà phê cao cấp. Được thiết kế để vận hành mượt mà, từ đặt hàng đến thanh toán cuối cùng.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Icon icon="solar:global-linear" className="text-lg" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Icon icon="solar:letter-linear" className="text-lg" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-stone-200 text-xs font-semibold uppercase tracking-wider mb-4">
              Liên Kết Nhanh
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quản Lý Thực Đơn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tổng Quan Bàn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Lịch Sử Đơn Hàng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Bảng Điều Khiển Nhân Viên
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-stone-200 text-xs font-semibold uppercase tracking-wider mb-4">
              Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trung Tâm Trợ Giúp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Trạng Thái Hệ Thống
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Chính Sách Bảo Mật
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom section */}
        <div className="border-t border-stone-800/60 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-stone-500">
            © 2023 Roast Quản Lý Quán Cà Phê. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-4 text-[11px] text-stone-500">
            <span>Phiên Bản 2.4.1</span>
            <span>Latte UI System</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;