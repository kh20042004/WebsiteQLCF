import api from './api';

/**
 * Service quản lý Menu Items (Sản phẩm)
 */
const itemService = {
  /**
   * Lấy danh sách sản phẩm (có hỗ trợ tìm kiếm và lọc)
   * @param {Object} params - Tham số query { search: string, category: string }
   */
  getAllItems: async (params = {}) => {
    return api.get('/products', { params });
  },

  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   */
  getItemById: async (id) => {
    return api.get(`/products/${id}`);
  },

  /**
   * Tạo mới sản phẩm
   */
  createItem: async (itemData) => {
    return api.post('/products', itemData);
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  updateItem: async (id, itemData) => {
    return api.put(`/products/${id}`, itemData);
  },

  /**
   * Xóa sản phẩm
   */
  deleteItem: async (id) => {
    return api.delete(`/products/${id}`);
  }
};

export default itemService;
