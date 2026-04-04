/**
 * Component: NotificationDropdown.jsx
 * 
 * MÔ TẢ:
 * - Dropdown hiển thị danh sách thông báo khi click vào icon chuông
 * - Hiển thị thông báo với phân trang, lọc theo trạng thái
 * - Cho phép đánh dấu đã đọc/chưa đọc từng thông báo hoặc tất cả
 * - Có link action để redirect đến trang liên quan
 * 
 * TÍNH NĂNG:
 * - 📋 Danh sách thông báo có phân trang
 * - 🔍 Lọc theo loại thông báo (success, warning, error, info, order, system)
 * - ✅ Đánh dấu đã đọc/chưa đọc
 * - 🗑️ Xóa thông báo
 * - 📱 Responsive design
 * - ⏰ Hiển thị thời gian tương đối (2 phút trước, 1 giờ trước)
 * - 🔗 Link action để chuyển trang
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
} from '../../services/notificationService'; // ✨ Sử dụng service riêng

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
     * HÀM LẤY DANH SÁCH THÔNG BÁO TỪ API
     * 
     * Gọi API GET /notifications với query params:
     * - page: trang hiện tại
     * - limit: số thông báo mỗi trang (10)
     * - isRead: filter theo trạng thái đọc
     */
    const fetchNotifications = async (page = 1, filter = selectedFilter) => {
        try {
            setIsLoading(true);
            setError('');

            // Xây dựng params object
            const params = {
                page,
                limit: 10
            };

            // Thêm filter isRead nếu cần
            if (filter === 'unread') {
                params.isRead = false;
            } else if (filter === 'read') {
                params.isRead = true;
            }

            // API interceptor đã tự động extract response.data.data
            // → data = { notifications, pagination }
            const data = await getNotifications(params);
            
            if (data && data.notifications) {
                const { notifications: newNotifications, pagination } = data;
                
                setNotifications(newNotifications);
                setCurrentPage(pagination.currentPage);
                setTotalPages(pagination.totalPages);
                setTotalCount(pagination.totalCount);
            } else {
                throw new Error('Định dạng dữ liệu không hợp lệ');
            }
        } catch (error) {
            console.error('💥 Lỗi lấy thông báo:', error);
            setError('Không thể tải thông báo. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * HÀM ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC
     * 
     * @param {string} notificationId - ID của thông báo
     * @param {boolean} isRead - Trạng thái đọc mới
     */
    const markAsRead = async (notificationId, isRead = true) => {
        try {
            console.log(`📖 Đánh dấu thông báo ${notificationId} ${isRead ? 'đã đọc' : 'chưa đọc'}`);

            const response = await markNotificationAsRead(notificationId, isRead);
            
            if (response.data.status) {
                // Cập nhật state local
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead, readAt: isRead ? new Date().toISOString() : null }
                            : notification
                    )
                );

                // Thông báo cho component cha để cập nhật badge
                if (onUnreadCountChange) {
                    onUnreadCountChange();
                }

                console.log('✅ Đánh dấu thành công');
            } else {
                throw new Error(response.data.message || 'Đánh dấu thất bại');
            }
        } catch (error) {
            console.error('💥 Lỗi đánh dấu thông báo:', error);
            alert('Có lỗi khi đánh dấu thông báo. Vui lòng thử lại.');
        }
    };

    /**
     * HÀM ĐÁNH DẤU TẤT CẢ THÔNG BÁO ĐÃ ĐỌC
     * 
     * Gọi API PUT /notifications/mark-all-read
     * Sau đó refresh lại danh sách thông báo
     */
    const markAllAsRead = async () => {
        try {
            console.log('📖📖 Đánh dấu tất cả thông báo đã đọc');

            const response = await apiClient.put('/notifications/mark-all-read');
            
            if (response.data.status) {
                console.log(`✅ Đã đánh dấu ${response.data.data.modifiedCount} thông báo`);
                
                // Refresh danh sách thông báo
                await fetchNotifications(currentPage, selectedFilter);
                
                // Thông báo cho component cha để reset badge về 0
                if (onUnreadCountChange) {
                    onUnreadCountChange();
                }

                alert(`Đã đánh dấu ${response.data.data.modifiedCount} thông báo là đã đọc`);
            } else {
                throw new Error(response.data.message || 'Đánh dấu tất cả thất bại');
            }
        } catch (error) {
            console.error('💥 Lỗi đánh dấu tất cả:', error);
            alert('Có lỗi khi đánh dấu tất cả thông báo. Vui lòng thử lại.');
        }
    };

    /**
     * HÀM XÓA THÔNG BÁO
     * 
     * @param {string} notificationId - ID của thông báo cần xóa
     */
    const deleteNotification = async (notificationId) => {
        if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
            return;
        }

        try {
            console.log(`🗑️ Xóa thông báo ${notificationId}`);

            const response = await apiClient.delete(`/notifications/${notificationId}`);
            
            if (response.data.status) {
                console.log('✅ Xóa thành công');
                
                // Refresh danh sách thông báo
                await fetchNotifications(currentPage, selectedFilter);
                
                // Thông báo cho component cha để cập nhật badge
                if (onUnreadCountChange) {
                    onUnreadCountChange();
                }
            } else {
                throw new Error(response.data.message || 'Xóa thông báo thất bại');
            }
        } catch (error) {
            console.error('💥 Lỗi xóa thông báo:', error);
            alert('Có lỗi khi xóa thông báo. Vui lòng thử lại.');
        }
    };

    /**
     * HÀM XỬ LÝ CLICK VÀO THÔNG BÁO
     * 
     * - Đánh dấu đã đọc nếu chưa đọc
     * - Chuyển trang nếu có actionUrl
     * - Đóng dropdown
     */
    const handleNotificationClick = async (notification) => {
        console.log('🖱️ User click vào thông báo:', notification.title);

        // Đánh dấu đã đọc nếu chưa đọc
        if (!notification.isRead) {
            await markAsRead(notification._id, true);
        }

        // Chuyển trang nếu có actionUrl
        if (notification.actionUrl) {
            console.log(`🔗 Chuyển đến: ${notification.actionUrl}`);
            navigate(notification.actionUrl);
        }

        // Đóng dropdown
        if (onClose) {
            onClose();
        }
    };

    /**
     * HÀM THAY ĐỔI BỘ LỌC
     * 
     * @param {string} filter - all, unread, read
     */
    const handleFilterChange = (filter) => {
        console.log(`🔍 Thay đổi filter thành: ${filter}`);
        setSelectedFilter(filter);
        setCurrentPage(1); // Reset về trang 1
        fetchNotifications(1, filter);
    };

    /**
     * HÀM CHUYỂN TRANG
     * 
     * @param {number} newPage - Trang mới
     */
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            console.log(`📄 Chuyển sang trang ${newPage}`);
            setCurrentPage(newPage);
            fetchNotifications(newPage, selectedFilter);
        }
    };

    /**
     * HÀM ĐỊNH DẠNG THỜI GIAN TƯƠNG ĐỐI
     * 
     * @param {string} dateString - ISO date string
     * @returns {string} - "2 phút trước", "1 giờ trước", etc.
     */
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const notificationTime = new Date(dateString);
        const diffMs = now - notificationTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} giờ trước`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return notificationTime.toLocaleDateString('vi-VN');
    };

    /**
     * HÀM HIỂN THỊ ICON THEO LOẠI THÔNG BÁO
     * 
     * @param {string} type - success, warning, error, info, order, system
     * @returns {string} - FontAwesome icon class
     */
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return 'fas fa-check-circle text-green-500';
            case 'warning': return 'fas fa-exclamation-triangle text-yellow-500';
            case 'error': return 'fas fa-times-circle text-red-500';
            case 'order': return 'fas fa-shopping-cart text-blue-500';
            case 'system': return 'fas fa-cog text-gray-500';
            default: return 'fas fa-info-circle text-blue-500';
        }
    };

    /**
     * EFFECT: TỰ ĐỘNG LẤY THÔNG BÁO KHI MỞ DROPDOWN
     */
    useEffect(() => {
        if (isOpen) {
            fetchNotifications(1, 'all'); // Reset về trang 1, filter all
        }
    }, [isOpen]);

    /**
     * EFFECT: XỬ LÝ CLICK BÊN NGOÀI DROPDOWN ĐỂ ĐÓNG
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                console.log('🖱️ Click bên ngoài → đóng dropdown');
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Không render gì nếu dropdown đóng
    if (!isOpen) return null;

    return (
        <>
            {/* OVERLAY ĐỂ ĐÓNG DROPDOWN KHI CLICK */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>

            {/* DROPDOWN CONTAINER */}
            <div
                ref={dropdownRef}
                className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
            >
                {/* HEADER DROPDOWN */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                            🔔 Thông báo
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Đóng"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* BỘ LỌC THÔNG BÁO */}
                    <div className="flex space-x-2">
                        {[
                            { key: 'all', label: 'Tất cả', count: totalCount },
                            { key: 'unread', label: 'Chưa đọc', count: notifications.filter(n => !n.isRead).length },
                            { key: 'read', label: 'Đã đọc', count: notifications.filter(n => n.isRead).length }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => handleFilterChange(filter.key)}
                                className={`
                                    px-3 py-1 rounded-full text-sm font-medium transition-colors
                                    ${selectedFilter === filter.key 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                {filter.label}
                                {filter.count > 0 && (
                                    <span className="ml-1 text-xs">({filter.count})</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* NÚT ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC */}
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            ✅ Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>

                {/* NỘI DUNG DROPDOWN */}
                <div className="max-h-64 overflow-y-auto">
                    {/* LOADING STATE */}
                    {isLoading && (
                        <div className="p-4 text-center">
                            <i className="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                            <span className="text-gray-500">Đang tải thông báo...</span>
                        </div>
                    )}

                    {/* ERROR STATE */}
                    {error && (
                        <div className="p-4 text-center">
                            <p className="text-red-500 text-sm">{error}</p>
                            <button
                                onClick={() => fetchNotifications(currentPage, selectedFilter)}
                                className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                            >
                                🔄 Thử lại
                            </button>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!isLoading && !error && notifications.length === 0 && (
                        <div className="p-8 text-center">
                            <i className="fas fa-bell-slash text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray-500">
                                {selectedFilter === 'unread' ? 'Không có thông báo chưa đọc' : 
                                 selectedFilter === 'read' ? 'Không có thông báo đã đọc' : 
                                 'Chưa có thông báo nào'}
                            </p>
                        </div>
                    )}

                    {/* DANH SÁCH THÔNG BÁO */}
                    {!isLoading && !error && notifications.length > 0 && (
                        <div>
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`
                                        p-4 border-b border-gray-100 cursor-pointer transition-colors
                                        ${notification.isRead 
                                            ? 'bg-white hover:bg-gray-50' 
                                            : 'bg-blue-50 hover:bg-blue-100'
                                        }
                                    `}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* ICON THÔNG BÁO */}
                                        <div className="flex-shrink-0">
                                            {notification.icon ? (
                                                <i className={notification.icon}></i>
                                            ) : (
                                                <i className={getNotificationIcon(notification.type)}></i>
                                            )}
                                        </div>

                                        {/* NỘI DUNG THÔNG BÁO */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`
                                                    text-sm truncate
                                                    ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}
                                                `}>
                                                    {notification.title}
                                                </h4>
                                                
                                                {/* BADGE CHƯA ĐỌC */}
                                                {!notification.isRead && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                                )}
                                            </div>

                                            <p className={`
                                                text-sm mt-1 line-clamp-2
                                                ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}
                                            `}>
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-gray-400">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>

                                                {/* CÁC HÀNH ĐỘNG */}
                                                <div className="flex space-x-2">
                                                    {/* NÚT ĐÁNH DẤU ĐÃ ĐỌC/CHƯA ĐỌC */}
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

                                                    {/* NÚT XÓA */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification._id);
                                                        }}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                        title="Xóa thông báo"
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

                {/* FOOTER PHÂN TRANG */}
                {totalPages > 1 && (
                    <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                            Trang {currentPage} / {totalPages}
                        </span>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded text-xs text-blue-600 disabled:text-gray-400"
                            >
                                ◀ Trước
                            </button>
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 rounded text-xs text-blue-600 disabled:text-gray-400"
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