import api from './api';

/**
 * Category Service - All API calls for category management
 * Integrates with backend endpoints: http://localhost:3000/api/categories
 */

export const categoryService = {
  /**
   * GET /api/categories
   * Lấy danh sách danh mục
   * @returns {Promise<Array>} Danh sách danh mục
   */
  getAllCategories: () => {
    return api.get('/categories');
  },

  /**
   * POST /api/categories
   * Tạo danh mục mới
   * @param {Object} categoryData - { name, description }
   * @returns {Promise<Object>} Danh mục vừa tạo
   */
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  }
};

export default categoryService;
