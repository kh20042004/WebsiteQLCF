/**
 * Component: NotificationBell.jsx
 * 
 * MÔ TẢ: 
 * - Icon chuông thông báo hiển thị ở header
 * - Hiển thị badge đỏ với số thông báo chưa đọc
 * - Click để mở/đóng dropdown danh sách thông báo
 * - Tự động cập nhật số lượng thông báo realtime
 * 
 * TÍNH NĂNG:
 * - 🔔 Icon chuông Iconify (solar:bell-linear)
 * - 🔴 Badge đỏ hiển thị số thông báo chưa đọc
 * - 📱 Responsive cho mobile và desktop
 * - 🎨 Animation khi có thông báo mới
 * - ⚡ Tự động fetch số lượng thông báo từ API mỗi 30 giây
 * 
 * SỬ DỤNG:
 * <NotificationBell onToggle={setShowDropdown} isOpen={isOpen} />
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react'; // ✨ Import Iconify thay vì FontAwesome
import { getUnreadCount } from '../../services/notificationService'; // ✨ Sử dụng service riêng

const NotificationBell = ({ onToggle, isOpen = false }) => {
    // ---- STATE QUẢN LÝ ----
    const [unreadCount, setUnreadCount] = useState(0); // Số thông báo chưa đọc
    const [isLoading, setIsLoading] = useState(false);  // Trạng thái loading
    const [hasNewNotification, setHasNewNotification] = useState(false); // Có thông báo mới (để animation)

    /**
     * HÀM LẤY SỐ LƯỢNG THÔNG BÁO CHƯA ĐỌC
     * 
     * Gọi API GET /notifications/count để lấy số thông báo chưa đọc
     * Cập nhật badge số đỏ trên icon chuông
     */
    const fetchUnreadCount = async () => {
        try {
            setIsLoading(true);
            console.log('🔄 Đang lấy số thông báo chưa đọc...');

            const data = await getUnreadCount();
            
            /**
             * QUAN TRỌNG: API interceptor (frontend/src/services/api.js line 69) 
             * đã tự động extract response.data.data
             * → data = { unreadCount: 0, hasUnread: false }
             * → KHÔNG CÓ field `status` nữa, chỉ còn data thuần!
             */
            if (data && data.unreadCount !== undefined) {
                const newCount = data.unreadCount;
                
                // Nếu số thông báo tăng → có thông báo mới → trigger animation
                if (newCount > unreadCount) {
                    setHasNewNotification(true);
                    console.log(`🆕 Có ${newCount - unreadCount} thông báo mới!`);
                    
                    // Tắt animation sau 2 giây
                    setTimeout(() => setHasNewNotification(false), 2000);
                }
                
                setUnreadCount(newCount);
                console.log(`📊 Tổng thông báo chưa đọc: ${newCount}`);
            }
        } catch (error) {
            console.error('💥 Lỗi lấy số thông báo:', error);
            // Không hiển thị lỗi cho user, chỉ log để debug
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * EFFECT: TỰ ĐỘNG LẤY SỐ THÔNG BÁO KHI COMPONENT MOUNT
     * 
     * - Lấy số thông báo ngay khi component được render
     * - Thiết lập interval để cập nhật định kỳ mỗi 30 giây
     * - Cleanup interval khi component unmount
     */
    useEffect(() => {
        // Lấy ngay lần đầu
        fetchUnreadCount();

        // Thiết lập interval cập nhật định kỳ (30 giây)
        const interval = setInterval(() => {
            console.log('⏰ Cập nhật số thông báo định kỳ...');
            fetchUnreadCount();
        }, 30000); // 30 giây

        // Cleanup khi component unmount
        return () => {
            console.log('🧹 Dọn dẹp interval thông báo');
            clearInterval(interval);
        };
    }, []); // Chỉ chạy 1 lần khi mount

    /**
     * HÀM XỬ LÝ CLICK VÀO ICON CHUÔNG
     * 
     * - Toggle dropdown thông báo (mở/đóng)
     * - Làm mới số thông báo chưa đọc
     * - Thông báo cho component cha thông qua callback
     */
    const handleBellClick = () => {
        // Gọi callback để toggle dropdown
        if (onToggle) {
            onToggle(!isOpen);
        }

        // Làm mới số thông báo khi mở dropdown
        if (!isOpen) {
            fetchUnreadCount();
        }
    };

    /**
     * HÀM RESET SỐ THÔNG BÁO (Gọi từ component cha)
     * 
     * Được gọi khi user đánh dấu tất cả thông báo đã đọc
     */
    const resetUnreadCount = () => {
        setUnreadCount(0);
        setHasNewNotification(false);
    };

    return (
        <div className="relative">
            {/* 
                BUTTON ICON CHUÔNG
                - Hiển thị icon FontAwesome bell
                - Có class active khi dropdown đang mở
                - Loading state khi đang fetch API
            */}
            <button
                className={`
                    relative p-2 rounded-lg transition-all duration-200 
                    ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'} 
                    ${hasNewNotification ? 'animate-bounce' : ''} 
                    ${isLoading ? 'opacity-50' : ''}
                `}
                onClick={handleBellClick}
                disabled={isLoading}
                title={`${unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}`}
                aria-label={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ''}`}
            >
                {/* 
                    ICON CHUÔNG
                    - Sử dụng Iconify (solar:bell-linear)
                    - Thay đổi màu khi có thông báo mới
                */}
                <Icon 
                    icon="solar:bell-linear" 
                    className={`text-xl ${hasNewNotification ? 'text-yellow-500' : ''}`}
                />

                {/* 
                    BADGE ĐỎ HIỂN THỊ SỐ THÔNG BÁO
                    - Chỉ hiển thị khi có thông báo chưa đọc (unreadCount > 0)
                    - Hiển thị tối đa 99, nếu hơn thì hiển thị "99+"
                    - Có animation bounce khi có thông báo mới
                */}
                {unreadCount > 0 && (
                    <span 
                        className={`
                            absolute -top-1 -right-1 
                            bg-red-500 text-white text-xs 
                            rounded-full h-5 w-5 
                            flex items-center justify-center 
                            font-bold border-2 border-white
                            ${hasNewNotification ? 'animate-pulse' : ''}
                        `}
                        aria-live="polite"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* 
                    LOADING INDICATOR
                    - Hiển thị spinner nhỏ khi đang fetch API
                    - Chỉ hiển thị khi isLoading = true
                */}
                {isLoading && (
                    <div className="absolute top-0 right-0">
                        <Icon icon="svg-spinners:ring-resize" className="text-xs text-blue-500" />
                    </div>
                )}
            </button>
        </div>
    );
};

export default NotificationBell;