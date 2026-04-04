/**
 * Component: NotificationDropdown.jsx (✨ SỬA SỬ DỤNG SERVICE)
 * 
 * MÔ TẢ:
 * - Dropdown hiển thị danh sách thông báo khi click vào icon chuông
 * - Sử dụng notificationService thay vì gọi API trực tiếp
 * - Comment chi tiết bằng tiếng Việt
 * 
 * SỬ DỤNG:
 * <NotificationDropdown isOpen={true} onClose={() => setIsOpen(false)} />
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getNotifications, 
    markAsRead as markNotificationAsRead, 
    markAllAsRead as markAllNotificationsAsRead, 
    deleteNotification 
} from '../../services/notificationService'; // ✨ Service thông báo

const NotificationDropdown = ({ isOpen, onClose, onUnreadCountChange }) => {
    // ---- REFS VÀ HOOKS ----
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // ---- STATE QUẢN LÝ ----
    const [notifications, setNotifications] = useState([]); // Danh sách thông báo
    const [isLoading, setIsLoading] = useState(false);      // Loading state
    const [currentPage, setCurrentPage] = useState(1);     // Trang hiện tại
    const [totalPages, setTotalPages] = useState(1);       // Tổng số trang
    const [totalCount, setTotalCount] = useState(0);       // Tổng số thông báo
    const [selectedFilter, setSelectedFilter] = useState('all'); // Bộ lọc (all, unread, read)
    const [error, setError] = useState('');                // Thông báo lỗi

    /**
     * HÀM LẤY DANH SÁCH THÔNG BÁO (✨ SỬ DỤNG SERVICE)
     */
    const fetchNotifications = async (page = 1, filter = selectedFilter) => {
        try {
            setIsLoading(true);
            setError('');
            console.log(`📋 Lấy thông báo trang ${page}, filter: ${filter}`);

            // Xây dựng params cho service
            const params = { page, limit: 10 };
            if (filter === 'unread') params.isRead = false;
            else if (filter === 'read') params.isRead = true;

            const response = await getNotifications(params);
            
            if (response.status) {
                const { notifications: newNotifications, pagination } = response.data;
                setNotifications(newNotifications);
                setCurrentPage(pagination.currentPage);
                setTotalPages(pagination.totalPages);
                setTotalCount(pagination.totalCount);
                console.log(`✅ Loaded ${newNotifications.length} thông báo`);
            }
        } catch (error) {
            console.error('💥 Lỗi lấy thông báo:', error);
            setError('Không thể tải thông báo. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * HÀM ĐÁNH DẤU ĐÃ ĐỌC (✨ SỬ DỤNG SERVICE)
     */
    const markAsRead = async (notificationId, isRead = true) => {
        try {
            console.log(`📖 Đánh dấu thông báo ${notificationId} ${isRead ? 'đã đọc' : 'chưa đọc'}`);
            await markNotificationAsRead(notificationId, isRead);
            
            // Cập nhật state local
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, isRead, readAt: isRead ? new Date().toISOString() : null }
                        : notification
                )
            );
            if (onUnreadCountChange) onUnreadCountChange();
            console.log('✅ Đánh dấu thành công');
        } catch (error) {
            console.error('💥 Lỗi đánh dấu thông báo:', error);
            alert('Có lỗi khi đánh dấu thông báo.');
        }
    };

    /**
     * HÀM ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC (✨ SỬ DỤNG SERVICE)
     */
    const markAllAsRead = async () => {
        try {
            console.log('📖📖 Đánh dấu tất cả đã đọc');
            const response = await markAllNotificationsAsRead();
            
            if (response.status) {
                await fetchNotifications(currentPage, selectedFilter);
                if (onUnreadCountChange) onUnreadCountChange();
                alert(`Đã đánh dấu ${response.data.modifiedCount} thông báo`);
            }
        } catch (error) {
            console.error('💥 Lỗi đánh dấu tất cả:', error);
            alert('Có lỗi khi đánh dấu tất cả thông báo.');
        }
    };

    /**
     * HÀM XÓA THÔNG BÁO (✨ SỬ DỤNG SERVICE)
     */
    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;

        try {
            console.log(`🗑️ Xóa thông báo ${notificationId}`);
            await deleteNotification(notificationId);
            await fetchNotifications(currentPage, selectedFilter);
            if (onUnreadCountChange) onUnreadCountChange();
            console.log('✅ Xóa thành công');
        } catch (error) {
            console.error('💥 Lỗi xóa thông báo:', error);
            alert('Có lỗi khi xóa thông báo.');
        }
    };

    /**
     * HÀM CLICK VÀO THÔNG BÁO
     */
    const handleNotificationClick = async (notification) => {
        console.log('🖱️ Click thông báo:', notification.title);

        // Đánh dấu đã đọc nếu chưa đọc
        if (!notification.isRead) {
            await markAsRead(notification._id, true);
        }

        // Chuyển trang nếu có actionUrl
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }

        // Đóng dropdown
        if (onClose) onClose();
    };

    /**
     * CÁC HELPER FUNCTIONS
     */
    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
        fetchNotifications(1, filter);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchNotifications(newPage, selectedFilter);
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const time = new Date(dateString);
        const diffMins = Math.floor((now - time) / 60000);
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} ngày trước`;
    };

    const getNotificationIcon = (type) => {
        const icons = {
            success: 'fas fa-check-circle text-green-500',
            warning: 'fas fa-exclamation-triangle text-yellow-500',
            error: 'fas fa-times-circle text-red-500',
            order: 'fas fa-shopping-cart text-blue-500',
            system: 'fas fa-cog text-gray-500',
        };
        return icons[type] || 'fas fa-info-circle text-blue-500';
    };

    /**
     * EFFECTS
     */
    useEffect(() => {
        if (isOpen) fetchNotifications(1, 'all');
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* OVERLAY */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>

            {/* DROPDOWN */}
            <div
                ref={dropdownRef}
                className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden"
            >
                {/* HEADER */}
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">🔔 Thông báo</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* FILTERS */}
                    <div className="flex space-x-2">
                        {[
                            { key: 'all', label: 'Tất cả' },
                            { key: 'unread', label: 'Chưa đọc' },
                            { key: 'read', label: 'Đã đọc' }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => handleFilterChange(filter.key)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedFilter === filter.key 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* MARK ALL AS READ */}
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            ✅ Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* CONTENT */}
                <div className="max-h-64 overflow-y-auto">
                    {/* LOADING */}
                    {isLoading && (
                        <div className="p-4 text-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Đang tải...
                        </div>
                    )}

                    {/* ERROR */}
                    {error && (
                        <div className="p-4 text-center">
                            <p className="text-red-500 text-sm">{error}</p>
                            <button
                                onClick={() => fetchNotifications(currentPage, selectedFilter)}
                                className="mt-2 text-blue-600 text-sm"
                            >
                                🔄 Thử lại
                            </button>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!isLoading && !error && notifications.length === 0 && (
                        <div className="p-8 text-center">
                            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500">Chưa có thông báo</p>
                        </div>
                    )}

                    {/* NOTIFICATIONS LIST */}
                    {!isLoading && !error && notifications.length > 0 && (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b cursor-pointer transition-colors ${
                                        notification.isRead 
                                            ? 'bg-white hover:bg-gray-50' 
                                            : 'bg-blue-50 hover:bg-blue-100'
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* ICON */}
                                        <div className="flex-shrink-0">
                                            <i className={notification.icon || getNotificationIcon(notification.type)}></i>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm truncate ${
                                                    notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'
                                                }`}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                                )}
                                            </div>

                                            <p className={`text-sm mt-1 line-clamp-2 ${
                                                notification.isRead ? 'text-gray-500' : 'text-gray-700'
                                            }`}>
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>

                                                {/* ACTIONS */}
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification._id, !notification.isRead);
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                        title={notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'}
                                                    >
                                                        {notification.isRead ? '📭' : '📬'}
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteNotification(notification._id);
                                                        }}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                        title="Xóa"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="p-3 border-t flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            Trang {currentPage} / {totalPages}
                        </span>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 text-xs text-blue-600 disabled:text-gray-400"
                            >
                                ◀ Trước
                            </button>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 text-xs text-blue-600 disabled:text-gray-400"
                            >
                                Sau ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationDropdown;