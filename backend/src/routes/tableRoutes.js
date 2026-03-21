const express = require('express');
const router = express.Router();

const tableController = require('../controllers/tableController');
const {
  validateCreateTable,
  validateUpdateTable,
  validateUpdateStatus,
  validateDeleteTable,
  validateGetTable,
  handleValidationErrors,
} = require('../validators/tableValidator');

/**
 * GET /tables/stats - Lấy thống kê bàn
 * (Đặt trước route /:id để tránh conflict)
 */
router.get('/stats', tableController.getTableStats);

/**
 * GET /tables/available - Lấy danh sách bàn trống
 * (Đặt trước route /:id để tránh conflict)
 */
router.get('/available', tableController.getAvailableTables);

/**
 * GET /tables - Lấy danh sách tất cả bàn
 * Query params: ?status=available|occupied|reserved
 */
router.get('/', tableController.getAllTables);

/**
 * GET /tables/:id - Lấy chi tiết 1 bàn
 */
router.get(
  '/:id',
  validateGetTable,
  handleValidationErrors,
  tableController.getTableById
);

/**
 * POST /tables - Tạo bàn mới
 * Body: {name, capacity, notes?}
 */
router.post(
  '/',
  validateCreateTable,
  handleValidationErrors,
  tableController.createTable
);

/**
 * PUT /tables/:id - Cập nhật thông tin bàn
 * Body: {name?, capacity?, notes?}
 */
router.put(
  '/:id',
  validateUpdateTable,
  handleValidationErrors,
  tableController.updateTable
);

/**
 * PATCH /tables/:id/status - Cập nhật trạng thái bàn
 * Body: {status: 'available'|'occupied'|'reserved'}
 */
router.patch(
  '/:id/status',
  validateUpdateStatus,
  handleValidationErrors,
  tableController.updateTableStatus
);

/**
 * DELETE /tables/:id - Xóa bàn
 */
router.delete(
  '/:id',
  validateDeleteTable,
  handleValidationErrors,
  tableController.deleteTable
);

module.exports = router;
