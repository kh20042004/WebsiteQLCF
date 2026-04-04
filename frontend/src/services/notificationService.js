/**
 * Service: notificationService.js
 * 
 * MÔ TẢ:
 * - Các hàm gọi API liên quan đến hệ thống thông báo
 * - Wrapping axios calls với error handling
 * - Export các methods để component sử dụng
 * 
 * CHỨC NĂNG:
 * - Lấy danh sách thông báo có phân trang
 * - Đếm số thông báo chưa đọc
 * - Đánh dấu đã đọc/chưa đọc
 * - Tạo thông báo mới (admin only)
 * - Xóa thông báo
 * - Lấy thống kê thông báo
 * 
 * SỬ DỤNG:
 * import { getNotifications, markAsRead } from '../services/notificationService';
 */

import api from './api';

/**
 * LẤY DANH SÁCH THÔNG BÁO CỦA USER HIỆN TẠI
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.limit - Số thông báo mỗi trang (default: 10)
 * @param {string} params.type - Lọc theo loại (success, warning, error, info, order, system)
 * @param {boolean} params.isRead - Lọc theo trạng thái đọc (true/false)
 * 
 * @returns {Promise<Object>} Response với danh sách thông báo + pagination
 */
export const getNotifications = async (params = {}) => {
    try {
        // Xây dựng query string từ params
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.type) queryParams.append('type', params.type);
        if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

        // API interceptor đã tự động extract response.data.data
        const data = await api.get(`/notifications?${queryParams.toString()}`);
        
        return data; // Trả về data đã được extract: { notifications, pagination }
        
    } catch (error) {
        console.error('💥 Lỗi lấy thông báo:', error.message);
        throw new Error(error.message || 'Lỗi khi lấy danh sách thông báo');
    }
};

/**
 * ĐẾM SỐ THÔNG BÁO CHƯA ĐỌC CỦA USER HIỆN TẠI
 * 
 * RESPONSE TỪ API:
 * {
 *   status: true,
 *   message: 'Lấy số thông báo chưa đọc thành công',
 *   data: {
 *     unreadCount: 5,
 *     hasUnread: true
 *   }
 * }
 * 
 * API INTERCEPTOR ĐÃ TỰ ĐỘNG EXTRACT response.data.data
 * → Trả về: { unreadCount: 5, hasUnread: true }
 * 
 * @returns {Promise<Object>} Data đã extract: { unreadCount, hasUnread }
 */
export const getUnreadCount = async () => {
    try {
        // API interceptor đã tự động extract response.data.data
        const data = await api.get('/notifications/count');
        
        return data; // { unreadCount, hasUnread }
        
    } catch (error) {
        console.error('💥 Lỗi đếm thông báo:', error.message);
        throw new Error(error.message || 'Lỗi khi đếm thông báo chưa đọc');
    }
};

/**
 * ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC/CHƯA ĐỌC
 * 
 * @param {string} notificationId - ID của thông báo
 * @param {boolean} isRead - Trạng thái đọc mới (default: true)
 * 
 * @returns {Promise<Object>} Response với thông báo đã cập nhật
 */
export const markAsRead = async (notificationId, isRead = true) => {
    try {
        console.log(`📖 API: Đánh dấu thông báo ${notificationId} ${isRead ? 'đã đọc' : 'chưa đọc'}`);
        
        const response = await api.put(`/notifications/${notificationId}/read`, { isRead });
        
        console.log('✅ API: Đánh dấu thành công:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('💥 API: Lỗi đánh dấu thông báo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu thông báo');
    }
};

/**
 * ĐÁNH DẤU TẤT CẢ THÔNG BÁO ĐÃ ĐỌC
 * 
 * @returns {Promise<Object>} Response với số lượng thông báo đã đánh dấu
 */
export const markAllAsRead = async () => {
    try {
        console.log('📖📖 API: Đánh dấu tất cả thông báo đã đọc');
        
        const response = await api.put('/notifications/mark-all-read');
        
        console.log('✅ API: Đánh dấu tất cả thành công:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('💥 API: Lỗi đánh dấu tất cả thông báo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Lỗi khi đánh dấu tất cả thông báo');
    }
};

/**
 * TẠO THÔNG BÁO MỚI (CHỈ ADMIN)
 * 
 * @param {Object} notificationData - Dữ liệu thông báo
 * @param {string} notificationData.title - Tiêu đề thông báo
 * @param {string} notificationData.message - Nội dung thông báo
 * @param {string} notificationData.type - Loại thông báo (success, warning, error, info, order, system)
 * @param {string|null} notificationData.userId - ID user nhận (null = broadcast)
 * @param {number} notificationData.priority - Độ ưu tiên 1-5 (default: 3)
 * @param {string} notificationData.actionUrl - URL để redirect khi click
 * @param {string} notificationData.icon - Icon class hoặc URL
 * @param {string} notificationData.expiresAt - Thời gian hết hạn (ISO string)
 * 
 * @returns {Promise<Object>} Response với thông báo đã tạo
 */
export const createNotification = async (notificationData) => {
    try {
        console.log('📢 API: Tạo thông báo mới:', notificationData);
        
        const response = await api.post('/notifications', notificationData);
        
        console.log('✅ API: Tạo thông báo thành công:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('💥 API: Lỗi tạo thông báo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Lỗi khi tạo thông báo');
    }
};

/**
 * XÓA THÔNG BÁO (SOFT DELETE)
 * 
 * @param {string} notificationId - ID của thông báo cần xóa
 * 
 * @returns {Promise<Object>} Response xác nhận xóa thành công
 */
export const deleteNotification = async (notificationId) => {
    try {
        console.log(`🗑️ API: Xóa thông báo ${notificationId}`);
        
        const response = await api.delete(`/notifications/${notificationId}`);
        
        console.log('✅ API: Xóa thành công:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('💥 API: Lỗi xóa thông báo:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
    }
};

/**
 * LẤY THỐNG KÊ THÔNG BÁO (CHỈ ADMIN)
 * 
 * @returns {Promise<Object>} Response với thống kê theo loại thông báo
 */
export const getNotificationStats = async () => {
    try {
        console.log('📊 API: Lấy thống kê thông báo');
        
        const response = await api.get('/notifications/stats');
        
        console.log('✅ API: Lấy thống kê thành công:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('💥 API: Lỗi lấy thống kê:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy thống kê thông báo');
    }
};

/**
 * HÀM HELPER TẠO THÔNG BÁO NHANH
 * 
 * Tạo các thông báo thường dùng với params đã setup sẵn
 */

/**
 * Tạo thông báo thành công
 */
export const createSuccessNotification = (title, message, actionUrl = null) => {
    return createNotification({
        title,
        message,
        type: 'success',
        userId: null, // Broadcast cho tất cả
        priority: 3,
        actionUrl,
        icon: 'fas fa-check-circle'
    });
};

/**
 * Tạo thông báo cảnh báo
 */
export const createWarningNotification = (title, message, actionUrl = null) => {
    return createNotification({
        title,
        message,
        type: 'warning',
        userId: null, // Broadcast cho tất cả
        priority: 4,
        actionUrl,
        icon: 'fas fa-exclamation-triangle'
    });
};

/**
 * Tạo thông báo lỗi
 */
export const createErrorNotification = (title, message, actionUrl = null) => {
    return createNotification({
        title,
        message,
        type: 'error',
        userId: null, // Broadcast cho tất cả
        priority: 5,
        actionUrl,
        icon: 'fas fa-times-circle'
    });
};

/**
 * Tạo thông báo đơn hàng
 */
export const createOrderNotification = (title, message, actionUrl = null) => {
    return createNotification({
        title,
        message,
        type: 'order',
        userId: null, // Broadcast cho tất cả
        priority: 4,
        actionUrl,
        icon: 'fas fa-shopping-cart'
    });
};

/**
 * Tạo thông báo hệ thống
 */
export const createSystemNotification = (title, message, actionUrl = null) => {
    return createNotification({
        title,
        message,
        type: 'system',
        userId: null, // Broadcast cho tất cả
        priority: 2,
        actionUrl,
        icon: 'fas fa-cog'
    });
};

export default {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getNotificationStats,
    createSuccessNotification,
    createWarningNotification,
    createErrorNotification,
    createOrderNotification,
    createSystemNotification
};