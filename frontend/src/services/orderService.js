import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Lấy danh sách đơn hàng
export const getOrders = () => {
    return api.get(API_ENDPOINTS.ORDERS.LIST);
};

// Gọi API Thanh toán (Checkout)
export const checkoutOrder = (orderId, paymentMethod = 'Cash') => {
    return api.post(`${API_ENDPOINTS.ORDERS.LIST}/${orderId}/checkout`, { paymentMethod });
};