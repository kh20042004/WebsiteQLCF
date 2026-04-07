/**
 * Routes: inventoryRoutes.js
 *
 * Định nghĩa RESTful routes cho quản lý nguyên liệu / kho hàng
 *
 * 📌 PHÂN QUYỀN:
 * - GET    /inventory              → Staff + Admin (xem danh sách nguyên liệu)
 * - GET    /inventory/stats        → CHỈ ADMIN (thống kê tổng quan kho)
 * - GET    /inventory/low-stock    → Staff + Admin (cảnh báo nguyên liệu sắp hết)
 * - GET    /inventory/:id          → Staff + Admin (xem chi tiết)
 * - POST   /inventory              → CHỈ ADMIN (thêm nguyên liệu mới)
 * - PUT    /inventory/:id          → CHỈ ADMIN (sửa thông tin nguyên liệu)
 * - POST   /inventory/:id/restock  → Staff + Admin (nhập thêm hàng)
 * - DELETE /inventory/:id          → CHỈ ADMIN (xóa nguyên liệu)
 *
 * Lý do phân quyền:
 * - Staff cần xem kho để biết nguyên liệu nào còn/hết khi phục vụ
 * - Staff được phép nhập hàng (restock) khi nhận hàng từ nhà cung cấp
 * - Nhưng chỉ Admin mới được quản lý (CRUD) thông tin nguyên liệu
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ============================================================
// GET /api/inventory/stats — Thống kê tổng quan kho hàng
// CHỈ ADMIN: Xem số liệu thống kê
// ⚠️ ĐẶT TRƯỚC /:id ĐỂ TRÁNH CONFLICT VỚI ROUTE PARAMS
// ============================================================
router.get('/stats', authenticate, requireAdmin, inventoryController.getInventoryStats);


// ============================================================
// GET /api/inventory/low-stock — Nguyên liệu sắp hết (cảnh báo)
// Staff + Admin: Cả hai đều cần biết để nhập hàng kịp thời
// ⚠️ ĐẶT TRƯỚC /:id ĐỂ TRÁNH CONFLICT VỚI ROUTE PARAMS
// ============================================================
router.get('/low-stock', authenticate, requireStaff, inventoryController.getLowStockItems);


// ============================================================
// GET /api/inventory — Lấy danh sách tất cả nguyên liệu
// Staff + Admin: Cả hai đều cần xem kho
// ============================================================
router.get('/', authenticate, requireStaff, inventoryController.getAllInventory);


// ============================================================
// GET /api/inventory/:id — Lấy chi tiết 1 nguyên liệu
// Staff + Admin: Cả hai đều được xem chi tiết
// ============================================================
router.get('/:id', authenticate, requireStaff, inventoryController.getInventoryById);


// ============================================================
// POST /api/inventory — Tạo nguyên liệu mới
// CHỈ ADMIN: Chỉ quản lý mới được thêm nguyên liệu vào kho
// ============================================================
router.post('/', authenticate, requireAdmin, inventoryController.createInventory);


// ============================================================
// PUT /api/inventory/:id — Cập nhật nguyên liệu
// CHỈ ADMIN: Chỉ quản lý mới được sửa thông tin nguyên liệu
// ============================================================
router.put('/:id', authenticate, requireAdmin, inventoryController.updateInventory);


// ============================================================
// POST /api/inventory/:id/restock — Nhập thêm hàng
// Staff + Admin: Cả hai đều được nhập hàng khi nhận từ NCC
// ============================================================
router.post('/:id/restock', authenticate, requireStaff, inventoryController.restockInventory);


// ============================================================
// DELETE /api/inventory/:id — Xóa nguyên liệu (Soft delete)
// CHỈ ADMIN: Chỉ quản lý mới được xóa nguyên liệu
// ============================================================
router.delete('/:id', authenticate, requireAdmin, inventoryController.deleteInventory);


module.exports = router;
