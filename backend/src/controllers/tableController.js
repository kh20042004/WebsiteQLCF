const tableService = require('../services/tableService');

class TableController {
  /**
   * GET /tables
   * Lấy danh sách tất cả bàn, có thể filter theo status
   */
  async getAllTables(req, res) {
    try {
      const { status } = req.query;

      // Build filter
      const filter = {};
      if (status) {
        filter.status = status;
      }

      const tables = await tableService.getAllTables(filter);

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bàn thành công',
        data: {
          count: tables.length,
          tables,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /tables/:id
   * Lấy chi tiết 1 bàn
   */
  async getTableById(req, res) {
    try {
      const { id } = req.params;

      const table = await tableService.getTableById(id);

      res.status(200).json({
        success: true,
        message: 'Lấy thông tin bàn thành công',
        data: table,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /tables
   * Tạo bàn mới
   */
  async createTable(req, res) {
    try {
      const { name, capacity, notes } = req.body;

      const newTable = await tableService.createTable({
        name,
        capacity,
        notes: notes || '',
      });

      res.status(201).json({
        success: true,
        message: 'Tạo bàn thành công',
        data: newTable,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PUT /tables/:id
   * Cập nhật thông tin bàn
   */
  async updateTable(req, res) {
    try {
      const { id } = req.params;
      const { name, capacity, notes } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (notes !== undefined) updateData.notes = notes;

      const updatedTable = await tableService.updateTable(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Cập nhật bàn thành công',
        data: updatedTable,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * PATCH /tables/:id/status
   * Cập nhật trạng thái bàn
   */
  async updateTableStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedTable = await tableService.updateTableStatus(id, status);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái bàn thành công',
        data: updatedTable,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * DELETE /tables/:id
   * Xóa bàn
   */
  async deleteTable(req, res) {
    try {
      const { id } = req.params;

      const deletedTable = await tableService.deleteTable(id);

      res.status(200).json({
        success: true,
        message: 'Xóa bàn thành công',
        data: deletedTable,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /tables/available
   * Lấy danh sách bàn trống
   */
  async getAvailableTables(req, res) {
    try {
      const tables = await tableService.getAvailableTables();

      res.status(200).json({
        success: true,
        message: 'Lấy danh sách bàn trống thành công',
        data: {
          count: tables.length,
          tables,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /tables/stats
   * Lấy thống kê bàn
   */
  async getTableStats(req, res) {
    try {
      const stats = await tableService.getTableStats();

      res.status(200).json({
        success: true,
        message: 'Lấy thống kê bàn thành công',
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new TableController();
