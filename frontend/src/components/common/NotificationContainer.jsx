/**
 * Component: NotificationContainer.jsx
 * 
 * MÔ TẢ:
 * - Component cha kết hợp NotificationBell và NotificationDropdown
 * - Quản lý state mở/đóng dropdown
 * - Xử lý communication giữa bell và dropdown
 * - Tích hợp vào Header component
 * 
 * TÍNH NĂNG:
 * - 🔔 Icon chuông với badge số thông báo
 * - 📋 Dropdown danh sách thông báo
 * - 🔄 Tự động refresh số thông báo
 * - 📱 Responsive cho mobile và desktop
 * 
 * SỬ DỤNG:
 * <NotificationContainer /> // Trong Header.jsx
 */

import React, { useState } from 'react';
import NotificationBell from './NotificationBell';
import NotificationDropdown from './NotificationDropdown';

const NotificationContainer = () => {
    // ---- STATE QUẢN LÝ ----
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown mở/đóng

    /**
     * HÀM TOGGLE DROPDOWN
     * 
     * Được gọi khi user click vào icon chuông
     * Mở dropdown nếu đang đóng, đóng nếu đang mở
     * 
     * @param {boolean} isOpen - Trạng thái mở mới (optional)
     */
    const handleToggleDropdown = (isOpen) => {
        const newState = typeof isOpen === 'boolean' ? isOpen : !isDropdownOpen;
        setIsDropdownOpen(newState);
    };

    /**
     * HÀM ĐÓNG DROPDOWN
     * 
     * Được gọi khi:
     * - User click bên ngoài dropdown
     * - User click vào icon X đóng dropdown
     * - User click vào 1 thông báo (và có actionUrl)
     */
    const handleCloseDropdown = () => {
        setIsDropdownOpen(false);
    };

    /**
     * HÀM XỬ LÝ KHI SỐ THÔNG BÁO THAY ĐỔI
     * 
     * Được gọi từ NotificationDropdown khi:
     * - User đánh dấu thông báo đã đọc/chưa đọc
     * - User xóa thông báo
     * - Có thông báo mới từ Socket.IO (sẽ implement sau)
     * 
     * Sẽ trigger refresh lại badge trên NotificationBell
     */
    const handleUnreadCountChange = () => {
        // Đây sẽ trigger useEffect trong NotificationBell để fetch lại unread count
        // Có thể implement bằng cách expose function từ NotificationBell
    };

    return (
        <div className="relative">
            {/* 
                NOTIFICATION BELL - ICON CHUÔNG VỚI BADGE
                - Hiển thị icon chuông FontAwesome
                - Badge đỏ với số thông báo chưa đọc
                - Click để toggle dropdown
                - Auto refresh số thông báo mỗi 30 giây
            */}
            <NotificationBell
                onToggle={handleToggleDropdown}
                isOpen={isDropdownOpen}
            />

            {/* 
                NOTIFICATION DROPDOWN - DANH SÁCH THÔNG BÁO
                - Chỉ hiển thị khi isDropdownOpen = true
                - Danh sách thông báo có phân trang
                - Các action: đánh dấu đã đọc, xóa, click to navigate
                - Click outside để đóng dropdown
            */}
            <NotificationDropdown
                isOpen={isDropdownOpen}
                onClose={handleCloseDropdown}
                onUnreadCountChange={handleUnreadCountChange}
            />
        </div>
    );
};

export default NotificationContainer;