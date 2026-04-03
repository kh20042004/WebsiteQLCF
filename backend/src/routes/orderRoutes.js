/**
 * Routes: orderRoutes
 *
 * Định nghĩa tất cả các endpoint liên quan đến Order
 * Pattern: Validator → handleValidation → Controller
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
  validateUpdateItem,
  validateUpdateStatus,
} = require('../validators/orderValidator');

// Import middleware validate
const handleValidation = require('../middlewares/handleValidation');

// ---------------------------------------------------------------
// POST /orders
// Tạo đơn hàng mới
// Body: { tableId, note }
// ---------------------------------------------------------------
router.post(
  '/',
  validateCreateOrder,
  handleValidation,
  orderController.createOrder
);

// ---------------------------------------------------------------
// GET /orders
// Lấy danh sách tất cả đơn hàng
// Query: ?status=pending|serving|done|cancelled
// ---------------------------------------------------------------
router.get('/', orderController.getAllOrders);

// ---------------------------------------------------------------
// GET /orders/:id
// Lấy chi tiết 1 đơn hàng (populate bàn, món, người tạo)
// ---------------------------------------------------------------
router.get('/:id', orderController.getOrderById);

// ---------------------------------------------------------------
// POST /orders/:id/items
// Thêm món vào đơn hàng
// Body: { itemId, quantity, price, name }
// ---------------------------------------------------------------
router.post(
  '/:id/items',
  validateAddItem,
  handleValidation,
  orderController.addItemToOrder
);

// ---------------------------------------------------------------
// DELETE /orders/:id/items/:itemId
// Xóa món khỏi đơn hàng
// :itemId = _id của subdocument trong items[]
// ---------------------------------------------------------------
router.delete(
  '/:id/items/:itemId',
  validateRemoveItem,
  handleValidation,
  orderController.removeItemFromOrder
);

// ---------------------------------------------------------------
// PUT /orders/:id/items/:itemId
// Cập nhật số lượng món trong đơn hàng
// Body: { quantity }
// ---------------------------------------------------------------
router.put(
  '/:id/items/:itemId',
  validateUpdateItem,
  handleValidation,
  orderController.updateItemInOrder
);

// ---------------------------------------------------------------
// PATCH /orders/:id/status
// Cập nhật trạng thái đơn hàng
// Body: { status: 'pending'|'serving'|'done'|'cancelled' }
// ---------------------------------------------------------------
router.patch(
  '/:id/status',
  validateUpdateStatus,
  handleValidation,
  orderController.updateOrderStatus
);

module.exports = router;
