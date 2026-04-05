/**
 * Routes: orderRoutes.js (đã phân quyền)
 *
 * Phân quyền đơn hàng (Order):
 * - GET  /orders              → Staff + Admin (xem danh sách đơn)
 * - GET  /orders/:id          → Staff + Admin (xem chi tiết đơn)
 * - POST /orders              → Staff + Admin (tạo đơn hàng mới)
 * - POST /orders/:id/items    → Staff + Admin (thêm món vào đơn)
 * - PATCH /orders/:id/status  → Staff + Admin (cập nhật trạng thái đơn)
 * - POST /orders/:id/checkout → Staff + Admin (thanh toán)
 * - DELETE /orders/:id/items/:itemId → Staff + Admin (xóa món khỏi đơn)
 * - DELETE /orders/:id        → Chỉ ADMIN (xóa toàn bộ đơn hàng)
 *
 * Pattern mỗi route: Validator → authenticate → requireRole → handleValidation → Controller
 */

const express = require('express');
const router = express.Router();

// Import controller
const orderController = require('../controllers/orderController');

// Import validators
const {
  validateCreateOrder,
  validateAddItem,
  validateRemoveItem,
} = require('../validators/orderValidator');

// Import middleware validate và phân quyền
const handleValidation = require('../middlewares/handleValidation');
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ---------------------------------------------------------------
// POST /api/orders — Tạo đơn hàng mới
// Staff + Admin: nhân viên có thể tạo đơn khi có khách
// Body: { tableId, note }
// ---------------------------------------------------------------
router.post(
  '/',
  authenticate,
  requireStaff,        // Nhân viên được tạo đơn
  validateCreateOrder,
  handleValidation,
  orderController.createOrder
);

// ---------------------------------------------------------------
// GET /api/orders — Lấy danh sách tất cả đơn hàng
// Staff + Admin: cả hai đều cần xem đơn hàng để phục vụ
// Query: ?status=pending|serving|done|cancelled
// ---------------------------------------------------------------
router.get(
  '/',
  authenticate,
  requireStaff,
  orderController.getAllOrders
);

// ---------------------------------------------------------------
// GET /api/orders/:id — Lấy chi tiết 1 đơn hàng
// ---------------------------------------------------------------
router.get(
  '/:id',
  authenticate,
  requireStaff,
  orderController.getOrderById
);

// ---------------------------------------------------------------
// POST /api/orders/:id/checkout — Thanh toán đơn hàng
// Staff + Admin: nhân viên thu ngân có thể thanh toán
// Body: { paymentMethod }
// ---------------------------------------------------------------
router.post(
  '/:id/checkout',
  authenticate,
  requireStaff,
  orderController.checkoutOrder
);

// ---------------------------------------------------------------
// PATCH /api/orders/:id/status — Cập nhật trạng thái đơn
// Staff + Admin: nhân viên cần cập nhật khi phục vụ
// Body: { status: 'pending' | 'serving' | 'done' | 'cancelled' }
// ---------------------------------------------------------------
router.patch(
  '/:id/status',
  authenticate,
  requireStaff,
  orderController.updateOrderStatus
);

// ---------------------------------------------------------------
// POST /api/orders/:id/items — Thêm món vào đơn hàng
// Staff + Admin: nhân viên gọi thêm món cho khách
// Body: { itemId, quantity, price, name }
// ---------------------------------------------------------------
router.post(
  '/:id/items',
  authenticate,
  requireStaff,
  validateAddItem,
  handleValidation,
  orderController.addItemToOrder
);

// ---------------------------------------------------------------
// DELETE /api/orders/:id/items/:itemId — Xóa món khỏi đơn hàng
// Staff + Admin: nhân viên hủy món theo yêu cầu khách
// :itemId = _id của subdocument trong items[]
// ---------------------------------------------------------------
router.delete(
  '/:id/items/:itemId',
  authenticate,
  requireStaff,
  validateRemoveItem,
  handleValidation,
  orderController.removeItemFromOrder
);

// ---------------------------------------------------------------
// DELETE /api/orders/:id — Xóa toàn bộ đơn hàng
// Chỉ ADMIN: thao tác nguy hiểm, tránh nhân viên xóa nhầm đơn
// ---------------------------------------------------------------
router.delete(
  '/:id',
  authenticate,
  requireAdmin,        // Chỉ admin mới được xóa đơn hoàn toàn
  orderController.deleteOrder
);

module.exports = router;
