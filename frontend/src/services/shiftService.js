/**
 * Service: shiftService.js
 *
 * Quản lý các API call liên quan đến ca làm việc / chấm công
 *
 * Các hàm:
 * - getAllShifts()     → Lấy danh sách tất cả ca (có lọc)
 * - getShiftById()    → Lấy chi tiết 1 ca
 * - createShift()     → Tạo/xếp ca mới (Admin)
 * - updateShift()     → Cập nhật ca (Admin)
 * - deleteShift()     → Xóa ca (Admin)
 * - checkIn()         → Check-in ca (Staff)
 * - checkOut()        → Check-out ca (Staff)
 * - getMyShifts()     → Lấy lịch ca cá nhân (Staff)
 */

import api from './api';

const shiftService = {

  /**
   * Lấy danh sách tất cả ca làm việc (có hỗ trợ lọc)
   * @param {Object} params - { date, userId, shiftType, status }
   * @returns {Promise} Danh sách ca
   */
  getAllShifts: async (params = {}) => {
    return api.get('/shifts', { params });
  },

  /**
   * Lấy chi tiết 1 ca
   * @param {string} id - ID ca
   */
  getShiftById: async (id) => {
    return api.get(`/shifts/${id}`);
  },

  /**
   * Tạo/xếp ca mới (CHỈ ADMIN)
   * @param {Object} shiftData - { user, date, shiftType, startTime, endTime, notes }
   */
  createShift: async (shiftData) => {
    return api.post('/shifts', shiftData);
  },

  /**
   * Cập nhật ca (CHỈ ADMIN)
   * @param {string} id - ID ca
   * @param {Object} shiftData - Dữ liệu cập nhật
   */
  updateShift: async (id, shiftData) => {
    return api.put(`/shifts/${id}`, shiftData);
  },

  /**
   * Xóa ca (CHỈ ADMIN)
   * @param {string} id - ID ca
   */
  deleteShift: async (id) => {
    return api.delete(`/shifts/${id}`);
  },

  /**
   * Check-in ca (Staff + Admin)
   * @param {string} id - ID ca
   */
  checkIn: async (id) => {
    return api.post(`/shifts/${id}/check-in`);
  },

  /**
   * Check-out ca (Staff + Admin)
   * @param {string} id - ID ca
   */
  checkOut: async (id) => {
    return api.post(`/shifts/${id}/check-out`);
  },

  /**
   * Lấy lịch ca cá nhân (Staff xem lịch mình)
   * @param {Object} params - { date, status }
   */
  getMyShifts: async (params = {}) => {
    return api.get('/shifts/my-shifts', { params });
  }
};

export default shiftService;
