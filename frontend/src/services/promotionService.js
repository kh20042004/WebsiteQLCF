/**
 * Service: promotionService.js
 *
 * Quản lý các API call liên quan đến khuyến mãi / mã giảm giá
 *
 * Các hàm:
 * - getAllPromotions()  → Lấy danh sách khuyến mãi (có phân trang, tìm kiếm)
 * - getPromotionById() → Lấy chi tiết 1 khuyến mãi
 * - createPromotion()  → Tạo khuyến mãi mới (Admin)
 * - updatePromotion()  → Cập nhật khuyến mãi (Admin)
 * - deletePromotion()  → Xóa khuyến mãi (Admin)
 * - applyPromotion()   → Kiểm tra và áp dụng mã giảm giá
 */

import api from './api';

const promotionService = {

  /**
   * Lấy danh sách khuyến mãi (có hỗ trợ tìm kiếm, lọc, phân trang)
   * @param {Object} params - Tham số query { search, type, isActive, page, limit }
   * @returns {Promise} Danh sách khuyến mãi + metadata phân trang
   */
  getAllPromotions: async (params = {}) => {
    return api.get('/promotions', { params });
  },

  /**
   * Lấy chi tiết 1 khuyến mãi theo ID
   * @param {string} id - ID khuyến mãi
   * @returns {Promise} Thông tin chi tiết khuyến mãi
   */
  getPromotionById: async (id) => {
    return api.get(`/promotions/${id}`);
  },

  /**
   * Tạo khuyến mãi mới (CHỈ ADMIN)
   * @param {Object} promotionData - Dữ liệu khuyến mãi
   * @returns {Promise} Khuyến mãi vừa tạo
   */
  createPromotion: async (promotionData) => {
    return api.post('/promotions', promotionData);
  },

  /**
   * Cập nhật thông tin khuyến mãi (CHỈ ADMIN)
   * @param {string} id - ID khuyến mãi
   * @param {Object} promotionData - Dữ liệu cập nhật
   * @returns {Promise} Khuyến mãi đã cập nhật
   */
  updatePromotion: async (id, promotionData) => {
    return api.put(`/promotions/${id}`, promotionData);
  },

  /**
   * Xóa khuyến mãi - Soft delete (CHỈ ADMIN)
   * @param {string} id - ID khuyến mãi
   * @returns {Promise} Kết quả xóa
   */
  deletePromotion: async (id) => {
    return api.delete(`/promotions/${id}`);
  },

  /**
   * Kiểm tra và áp dụng mã giảm giá (Staff + Admin)
   * @param {string} code - Mã khuyến mãi
   * @param {number} orderAmount - Tổng giá trị đơn hàng
   * @returns {Promise} Thông tin giảm giá (số tiền giảm, tổng sau giảm)
   */
  applyPromotion: async (code, orderAmount) => {
    return api.post('/promotions/apply', { code, orderAmount });
  }
};

export default promotionService;
