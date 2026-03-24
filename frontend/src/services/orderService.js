import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Lấy danh sách tất cả đơn hàng
export const getOrders = () => {
    return api.get(API_ENDPOINTS.ORDERS.LIST);
};

// Gọi API Thanh toán (Checkout) — đổi trạng thái thành 'done' và giải phóng bàn
export const checkoutOrder = (orderId, paymentMethod = 'Cash') => {
    return api.post(`${API_ENDPOINTS.ORDERS.LIST}/${orderId}/checkout`, { paymentMethod });
};

// Xóa đơn hàng
export const deleteOrder = (orderId) => {
    return api.delete(`${API_ENDPOINTS.ORDERS.LIST}/${orderId}`);
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {string} status  - Trạng thái mới: 'pending' | 'serving' | 'done' | 'cancelled'
 */
export const updateOrderStatus = (orderId, status) => {
    return api.patch(`${API_ENDPOINTS.ORDERS.LIST}/${orderId}/status`, { status });
};