import api from './api';

/**
 * Table Service - All API calls for table management
 * Integrates with backend endpoints: http://localhost:3000/api/tables
 */

export const tableService = {
  /**
   * GET /api/tables
   * Lấy tất cả bàn, có thể filter theo status
   * @param {string} status - 'available' | 'occupied' | 'reserved' | null
   * @returns {Promise<Array>} Danh sách bàn
   */
  getAllTables: (status = null) => {
    const params = status ? { status } : {};
    return api.get('/tables', { params });
  },

  /**
   * GET /api/tables/:id
   * Lấy chi tiết 1 bàn
   * @param {string} id - Table ID
   * @returns {Promise<Object>} Thông tin bàn
   */
  getTableById: (id) => {
    return api.get(`/tables/${id}`);
  },

  /**
   * GET /api/tables/stats
   * Lấy thống kê bàn (total, available, occupied, reserved counts)
   * @returns {Promise<Object>} Stats object
   */
  getTableStats: () => {
    return api.get('/tables/stats');
  },

  /**
   * GET /api/tables/available
   * Lấy danh sách bàn trống
   * @returns {Promise<Array>} Danh sách bàn trống
   */
  getAvailableTables: () => {
    return api.get('/tables/available');
  },

  /**
   * POST /api/tables
   * Tạo bàn mới
   * @param {Object} tableData - { name, capacity, notes }
   * @returns {Promise<Object>} Bàn vừa tạo
   */
  createTable: (tableData) => {
    return api.post('/tables', tableData);
  },

  /**
   * PUT /api/tables/:id
   * Cập nhật thông tin bàn
   * @param {string} id - Table ID
   * @param {Object} tableData - { name, capacity, notes }
   * @returns {Promise<Object>} Bàn đã cập nhật
   */
  updateTable: (id, tableData) => {
    return api.put(`/tables/${id}`, tableData);
  },

  /**
   * PATCH /api/tables/:id/status
   * Cập nhật trạng thái bàn
   * @param {string} id - Table ID
   * @param {string} status - 'available' | 'occupied' | 'reserved'
   * @returns {Promise<Object>} Bàn đã cập nhật
   */
  updateTableStatus: (id, status) => {
    return api.patch(`/tables/${id}/status`, { status });
  },

  /**
   * DELETE /api/tables/:id
   * Xóa bàn
   * @param {string} id - Table ID
   * @returns {Promise<Object>} Bàn đã xóa
   */
  deleteTable: (id) => {
    return api.delete(`/tables/${id}`);
  }
};

export default tableService;