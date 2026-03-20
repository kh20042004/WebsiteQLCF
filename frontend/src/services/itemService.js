import api from './api';

/**
 * Item Service - All API calls for menu item management
 * Integrates with backend endpoints: http://localhost:3000/api/items
 */

export const itemService = {
  /**
   * GET /api/items
   * Lấy danh sách món, có thể filter theo search query và category
   * @param {Object} params - { search, category, status }
   * @returns {Promise<Array>} Danh sách món
   */
  getAllItems: (params = {}) => {
    return api.get('/items', { params });
  },

  /**
   * GET /api/items/:id
   * Lấy chi tiết 1 món
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Thông tin món
   */
  getItemById: (id) => {
    return api.get(`/items/${id}`);
  },

  /**
   * POST /api/items
   * Tạo món mới
   * @param {Object} itemData - { name, category, price, image, status, description }
   * @returns {Promise<Object>} Món vừa tạo
   */
  createItem: (itemData) => {
    return api.post('/items', itemData);
  },

  /**
   * PUT /api/items/:id
   * Cập nhật thông tin món
   * @param {string} id - Item ID
   * @param {Object} itemData - { name, category, price, image, status, description }
   * @returns {Promise<Object>} Món đã cập nhật
   */
  updateItem: (id, itemData) => {
    return api.put(`/items/${id}`, itemData);
  },

  /**
   * DELETE /api/items/:id
   * Xóa món
   * @param {string} id - Item ID
   * @returns {Promise<Object>} Món đã xóa
   */
  deleteItem: (id) => {
    return api.delete(`/items/${id}`);
  }
};

export default itemService;
