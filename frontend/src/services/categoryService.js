import api from './api';

/**
 * Service quản lý Menu Categories (Danh mục)
 */
const categoryService = {
  /**
   * Lấy tất cả danh mục
   */
  getAllCategories: async (params = {}) => {
    return api.get('/categories', { params });
  },

  /**
   * Lấy danh mục theo ID
   */
  getCategoryById: async (id) => {
    return api.get(`/categories/${id}`);
  },

  /**
   * Tạo mới danh mục
   */
  createCategory: async (categoryData) => {
    return api.post('/categories', categoryData);
  },

  /**
   * Cập nhật danh mục
   */
  updateCategory: async (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },

  /**
   * Xóa danh mục
   */
  deleteCategory: async (id) => {
    return api.delete(`/categories/${id}`);
  }
};

export default categoryService;
