/**
 * Routes: tableRoutes.js (đã phân quyền)
 *
 * Phân quyền bàn (Table):
 * - GET  /tables             → Tất cả nhân viên (xem sơ đồ bàn)
 * - GET  /tables/stats       → Tất cả nhân viên (xem thống kê bàn)
 * - GET  /tables/available   → Tất cả nhân viên
 * - GET  /tables/:id         → Tất cả nhân viên
 * - POST /tables             → Staff + Admin (nhân viên có thể tạo bàn)
 * - PUT  /tables/:id         → Staff + Admin (sửa tên/sức chứa bàn)
 * - PATCH /tables/:id/status → Staff + Admin (đổi trạng thái bàn khi phục vụ)
 * - DELETE /tables/:id       → Chỉ ADMIN (xóa bàn — thao tác nguy hiểm)
 *
 * Lý do Staff được phép tạo/sửa/đổi trạng thái bàn:
 * → Nhân viên cần quản lý bàn hàng ngày (đặt bàn, giải phóng bàn)
 * → Chỉ việc XÓA bàn mới cần quyền admin để tránh sự cố
 */

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

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ---- CÁC ROUTE STATIC (phải đặt trước /:id để tránh conflict) ----

// GET /api/tables/stats — Thống kê bàn (tất cả nhân viên xem được)
router.get(
  '/stats',
  authenticate,
  requireStaff,
  tableController.getTableStats
);

// GET /api/tables/available — Lấy bàn trống (tất cả nhân viên)
router.get(
  '/available',
  authenticate,
  requireStaff,
  tableController.getAvailableTables
);


// ---- XEM DANH SÁCH / CHI TIẾT: Tất cả nhân viên ----

// GET /api/tables — Xem tất cả bàn
router.get(
  '/',
  authenticate,
  requireStaff,
  tableController.getAllTables
);

// GET /api/tables/:id — Xem chi tiết 1 bàn
router.get(
  '/:id',
  authenticate,
  requireStaff,
  validateGetTable,
  handleValidationErrors,
  tableController.getTableById
);


// ---- QUẢN LÝ BÀN: Staff + Admin ----

// POST /api/tables — Tạo bàn mới
router.post(
  '/',
  authenticate,
  requireStaff,    // Nhân viên được phép thêm bàn
  validateCreateTable,
  handleValidationErrors,
  tableController.createTable
);

// PUT /api/tables/:id — Cập nhật thông tin bàn (tên, sức chứa, ghi chú)
router.put(
  '/:id',
  authenticate,
  requireStaff,    // Nhân viên được phép chỉnh sửa thông tin bàn
  validateUpdateTable,
  handleValidationErrors,
  tableController.updateTable
);

// PATCH /api/tables/:id/status — Đổi trạng thái bàn (available/occupied/reserved)
// Thao tác phổ biến nhất — nhân viên cần làm liên tục trong ca làm việc
router.patch(
  '/:id/status',
  authenticate,
  requireStaff,    // Nhân viên được phép đổi trạng thái bàn
  validateUpdateStatus,
  handleValidationErrors,
  tableController.updateTableStatus
);


// ---- XÓA BÀN: Chỉ ADMIN ----

// DELETE /api/tables/:id — Xóa bàn vĩnh viễn
// Thao tác nguy hiểm — chỉ admin mới được phép để tránh xóa nhầm
router.delete(
  '/:id',
  authenticate,
  requireAdmin,    // Chỉ admin mới được xóa bàn
  validateDeleteTable,
  handleValidationErrors,
  tableController.deleteTable
);

module.exports = router;
