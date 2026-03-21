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
    return api.get('/items', { params });
  },

  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   */
  getItemById: async (id) => {
    return api.get(`/items/${id}`);
  },

  /**
   * Tạo mới sản phẩm
   */
  createItem: async (itemData) => {
    return api.post('/items', itemData);
  },

  /**
   * Cập nhật thông tin sản phẩm
   */
  updateItem: async (id, itemData) => {
    return api.put(`/items/${id}`, itemData);
  },

  /**
   * Xóa sản phẩm
   */
  deleteItem: async (id) => {
    return api.delete(`/items/${id}`);
  }
};

export default itemService;
