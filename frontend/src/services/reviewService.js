/**
 * Service: reviewService.js
 * 
 * Lớp gọi API liên quan đến Review
 * 
 * Các API endpoints:
 * - GET /api/reviews - Lấy danh sách review
 * - GET /api/reviews/:id - Lấy chi tiết review
 * - GET /api/reviews/item/:itemId - Lấy review của sản phẩm
 * - POST /api/reviews - Tạo review mới
 * - PUT /api/reviews/:id - Cập nhật review
 * - DELETE /api/reviews/:id - Xóa review
 * - PATCH /api/reviews/:id/approve - Phê duyệt review (admin)
 * - PATCH /api/reviews/:id/reject - Từ chối review (admin)
 * - POST /api/reviews/:id/reply - Trả lời review (staff/admin)
 * - GET /api/reviews/pending/all - Lấy review chờ phê duyệt (admin)
 */

import api from './api';

/**
 * Lấy danh sách review với filter
 * 
 * @param {object} filters - Bộ lọc
 * @returns {Promise}
 */
export const getAllReviews = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/reviews${params ? `?${params}` : ''}`);
};

/**
 * Lấy review của một sản phẩm cụ thể
 * 
 * @param {string} itemId - ID sản phẩm
 * @param {object} filters - Bộ lọc (page, limit, sort)
 * @returns {Promise}
 */
export const getReviewsByItem = (itemId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/reviews/item/${itemId}${params ? `?${params}` : ''}`);
};

/**
 * Lấy chi tiết một review
 * 
 * @param {string} reviewId - ID review
 * @returns {Promise}
 */
export const getReviewById = (reviewId) => {
  return api.get(`/reviews/${reviewId}`);
};

/**
 * Tạo review mới
 * 
 * @param {object} data - Dữ liệu review
 * @returns {Promise}
 */
export const createReview = (data) => {
  return api.post('/reviews', data);
};

/**
 * Cập nhật review
 * 
 * @param {string} reviewId - ID review
 * @param {object} data - Dữ liệu cập nhật
 * @returns {Promise}
 */
export const updateReview = (reviewId, data) => {
  return api.put(`/reviews/${reviewId}`, data);
};

/**
 * Xóa review
 * 
 * @param {string} reviewId - ID review
 * @returns {Promise}
 */
export const deleteReview = (reviewId) => {
  return api.delete(`/reviews/${reviewId}`);
};

/**
 * Phê duyệt review (admin)
 * 
 * @param {string} reviewId - ID review
 * @returns {Promise}
 */
export const approveReview = (reviewId) => {
  return api.patch(`/reviews/${reviewId}/approve`);
};

/**
 * Từ chối review (admin)
 * 
 * @param {string} reviewId - ID review
 * @returns {Promise}
 */
export const rejectReview = (reviewId) => {
  return api.patch(`/reviews/${reviewId}/reject`);
};

/**
 * Trả lời review (staff/admin)
 * 
 * @param {string} reviewId - ID review
 * @param {string} reply - Nội dung trả lời
 * @returns {Promise}
 */
export const replyReview = (reviewId, reply) => {
  return api.post(`/reviews/${reviewId}/reply`, { reply });
};

/**
 * Lấy danh sách review chờ phê duyệt (admin)
 * 
 * @returns {Promise}
 */
export const getPendingReviews = () => {
  return api.get('/reviews/pending/all');
};

export default {
  getAllReviews,
  getReviewsByItem,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  replyReview,
  getPendingReviews,
};
