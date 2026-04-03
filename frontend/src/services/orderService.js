import api from './api';

/**
 * Service: orderService
 * Gọi đúng 7 API Order từ backend
 */
const orderService = {
  /**
   * 1. Lấy danh sách tất cả đơn hàng
   * GET /orders?status=...&tableId=...
   */
  getAllOrders: async (params = {}) => {
    return api.get('/orders', { params });
  },

  /**
   * 2. Lấy chi tiết 1 đơn hàng
   * GET /orders/:id
   */
  getOrderById: async (id) => {
    return api.get(`/orders/${id}`);
  },

  /**
   * 3. Tạo đơn hàng mới
   * POST /orders
   * Body: { tableId, note? }
   */
  createOrder: async (orderData) => {
    return api.post('/orders', orderData);
  },

  /**
   * 4. Thêm món vào đơn hàng
   * POST /orders/:id/items
   * Body: { itemId, quantity, price, name }
   */
  addItemToOrder: async (orderId, itemData) => {
    return api.post(`/orders/${orderId}/items`, itemData);
  },

  /**
   * 5. Cập nhật số lượng món trong đơn
   * PUT /orders/:id/items/:itemId
   * Body: { quantity }
   */
  updateItemInOrder: async (orderId, orderItemId, quantity) => {
    return api.put(`/orders/${orderId}/items/${orderItemId}`, { quantity });
  },

  /**
   * 6. Xóa món khỏi đơn hàng
   * DELETE /orders/:id/items/:itemId
   * Body (optional): { quantity } để giảm bớt thay vì xóa hẳn
   */
  removeItemFromOrder: async (orderId, orderItemId, quantity = null) => {
    const body = quantity ? { quantity } : {};
    return api.delete(`/orders/${orderId}/items/${orderItemId}`, { data: body });
  },

  /**
   * 7. Cập nhật trạng thái đơn hàng
   * PATCH /orders/:id/status
   * Body: { status: 'pending'|'serving'|'done'|'cancelled' }
   */
  updateOrderStatus: async (orderId, status) => {
    return api.patch(`/orders/${orderId}/status`, { status });
  },
};

export default orderService;
