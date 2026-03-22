const Table = require('../models/Table');

class TableService {
  /**
   * Lấy tất cả bàn
   * @param {Object} filter - Filter object (status, etc.)
   * @returns {Promise<Array>}
   */
  async getAllTables(filter = {}) {
    try {
      const tables = await Table.find(filter)
        .populate({
          path: 'currentOrderId',
          populate: {
            path: 'items.item',
            model: 'Item'
          }
        })
        .sort({ name: 1 });
      return tables;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách bàn: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết 1 bàn
   * @param {String} tableId - ID của bàn
   * @returns {Promise<Object>}
   */
  async getTableById(tableId) {
    try {
      const table = await Table.findById(tableId).populate({
        path: 'currentOrderId',
        populate: {
          path: 'items.item',
          model: 'Item'
        }
      });
      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table;
    } catch (error) {
      throw new Error(`Lỗi khi lấy thông tin bàn: ${error.message}`);
    }
  }

  /**
   * Tạo bàn mới
   * @param {Object} data - {name, capacity, notes}
   * @returns {Promise<Object>}
   */
  async createTable(data) {
    try {
      // Kiểm tra tên bàn không trùng
      const existingTable = await Table.findOne({ name: data.name });
      if (existingTable) {
        throw new Error('Tên bàn đã tồn tại');
      }

      const newTable = new Table(data);
      await newTable.save();
      return newTable;
    } catch (error) {
      throw new Error(`Lỗi khi tạo bàn: ${error.message}`);
    }
  }

  /**
   * Cập nhật thông tin bàn
   * @param {String} tableId - ID của bàn
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>}
   */
  async updateTable(tableId, updateData) {
    try {
      const table = await Table.findByIdAndUpdate(
        tableId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật bàn: ${error.message}`);
    }
  }

  /**
   * Cập nhật trạng thái bàn
   * @param {String} tableId - ID của bàn
   * @param {String} status - Trạng thái mới (available, occupied, reserved)
   * @returns {Promise<Object>}
   */
  async updateTableStatus(tableId, status) {
    try {
      // Nếu chuyển sang 'available', xóa order hiện tại
      const updateData = { status };
      if (status === 'available') {
        updateData.currentOrderId = null;
      }

      const table = await Table.findByIdAndUpdate(
        tableId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật trạng thái bàn: ${error.message}`);
    }
  }

  /**
   * Xóa bàn
   * @param {String} tableId - ID của bàn
   * @returns {Promise<Object>}
   */
  async deleteTable(tableId) {
    try {
      const table = await Table.findByIdAndDelete(tableId);
      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table;
    } catch (error) {
      throw new Error(`Lỗi khi xóa bàn: ${error.message}`);
    }
  }

  /**
   * Lấy các bàn trống (available)
   * @returns {Promise<Array>}
   */
  async getAvailableTables() {
    try {
      const tables = await Table.find({ status: 'available' }).sort({
        name: 1,
      });
      return tables;
    } catch (error) {
      throw new Error(`Lỗi khi lấy bàn trống: ${error.message}`);
    }
  }

  /**
   * Kiểm tra xem bàn có được sử dụng không
   * @param {String} tableId - ID của bàn
   * @returns {Promise<Boolean>}
   */
  async isTableOccupied(tableId) {
    try {
      const table = await Table.findById(tableId);
      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table.status !== 'available';
    } catch (error) {
      throw new Error(`Lỗi khi kiểm tra trạng thái bàn: ${error.message}`);
    }
  }

  /**
   * Gán đơn hàng cho bàn
   * @param {String} tableId - ID của bàn
   * @param {String} orderId - ID của đơn hàng
   * @returns {Promise<Object>}
   */
  async assignOrderToTable(tableId, orderId) {
    try {
      const table = await Table.findByIdAndUpdate(
        tableId,
        {
          currentOrderId: orderId,
          status: 'occupied',
        },
        { new: true, runValidators: true }
      );

      if (!table) {
        throw new Error('Bàn không tồn tại');
      }
      return table;
    } catch (error) {
      throw new Error(`Lỗi khi gán đơn hàng cho bàn: ${error.message}`);
    }
  }

  /**
   * Thống kê bàn theo trạng thái
   * @returns {Promise<Object>}
   */
  async getTableStats() {
    try {
      const stats = await Table.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        available: stats.find(s => s._id === 'available')?.count || 0,
        occupied: stats.find(s => s._id === 'occupied')?.count || 0,
        reserved: stats.find(s => s._id === 'reserved')?.count || 0,
        total: stats.reduce((sum, s) => sum + s.count, 0),
      };
    } catch (error) {
      throw new Error(`Lỗi khi thống kê bàn: ${error.message}`);
    }
  }
}

module.exports = new TableService();
