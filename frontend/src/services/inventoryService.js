/**
 * Service: inventoryService.js
 *
 * Quản lý các API call liên quan đến nguyên liệu / kho hàng
 *
 * Các hàm:
 * - getAllInventory()      → Lấy danh sách nguyên liệu (có phân trang, tìm kiếm)
 * - getInventoryById()    → Lấy chi tiết 1 nguyên liệu
 * - createInventory()     → Tạo nguyên liệu mới (Admin)
 * - updateInventory()     → Cập nhật nguyên liệu (Admin)
 * - deleteInventory()     → Xóa nguyên liệu (Admin)
 * - restockInventory()    → Nhập thêm hàng (Staff + Admin)
 * - getInventoryStats()   → Thống kê tổng quan kho (Admin)
 * - getLowStockItems()    → Nguyên liệu sắp hết (cảnh báo)
 */

import api from './api';

const inventoryService = {

  /**
   * Lấy danh sách nguyên liệu (có hỗ trợ tìm kiếm, lọc, phân trang)
   * @param {Object} params - Tham số query { search, category, status, page, limit }
   * @returns {Promise} Danh sách nguyên liệu + metadata phân trang
   */
  getAllInventory: async (params = {}) => {
    return api.get('/inventory', { params });
  },

  /**
   * Lấy chi tiết 1 nguyên liệu theo ID
   * @param {string} id - ID nguyên liệu
   * @returns {Promise} Thông tin chi tiết nguyên liệu
   */
  getInventoryById: async (id) => {
    return api.get(`/inventory/${id}`);
  },

  /**
   * Tạo nguyên liệu mới (CHỈ ADMIN)
   * @param {Object} inventoryData - Dữ liệu nguyên liệu
   * @returns {Promise} Nguyên liệu vừa tạo
   */
  createInventory: async (inventoryData) => {
    return api.post('/inventory', inventoryData);
  },

  /**
   * Cập nhật thông tin nguyên liệu (CHỈ ADMIN)
   * @param {string} id - ID nguyên liệu
   * @param {Object} inventoryData - Dữ liệu cập nhật
   * @returns {Promise} Nguyên liệu đã cập nhật
   */
  updateInventory: async (id, inventoryData) => {
    return api.put(`/inventory/${id}`, inventoryData);
  },

  /**
   * Xóa nguyên liệu - Soft delete (CHỈ ADMIN)
   * @param {string} id - ID nguyên liệu
   * @returns {Promise} Kết quả xóa
   */
  deleteInventory: async (id) => {
    return api.delete(`/inventory/${id}`);
  },

  /**
   * Nhập thêm hàng / Restock (Staff + Admin)
   * @param {string} id - ID nguyên liệu
   * @param {Object} restockData - Dữ liệu nhập hàng { quantity, price, note }
   * @returns {Promise} Nguyên liệu đã cập nhật
   */
  restockInventory: async (id, restockData) => {
    return api.post(`/inventory/${id}/restock`, restockData);
  },

  /**
   * Lấy thống kê tổng quan kho hàng (CHỈ ADMIN)
   * @returns {Promise} Số liệu thống kê (tổng, còn hàng, sắp hết, hết hàng)
   */
  getInventoryStats: async () => {
    return api.get('/inventory/stats');
  },

  /**
   * Lấy danh sách nguyên liệu sắp hết (cảnh báo)
   * @returns {Promise} Danh sách nguyên liệu cần nhập thêm
   */
  getLowStockItems: async () => {
    return api.get('/inventory/low-stock');
  }
};

export default inventoryService;
