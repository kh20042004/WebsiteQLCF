/**
 * Routes: itemRoutes.js (đã phân quyền)
 *
 * Phân quyền thực đơn (Item):
 * - GET  /items        → Tất cả nhân viên (xem menu để gọi món)
 * - GET  /items/:id    → Tất cả nhân viên
 * - POST /items        → Chỉ ADMIN (thêm món mới vào menu)
 * - PUT  /items/:id    → Chỉ ADMIN (sửa thông tin món, giá, ảnh)
 * - DELETE /items/:id  → Chỉ ADMIN (xóa món khỏi menu)
 */

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');

// Import uploadSingle từ multer config (đã cập nhật sang named export)
// uploadSingle: nhận 1 file ảnh từ field "image" (multipart/form-data)
const { uploadSingle } = require('../config/multer');

// ---- XEM THỰC ĐƠN: Tất cả nhân viên ----

// GET /api/items — Xem danh sách tất cả món
router.get(
  '/',
  authenticate,   // Phải đăng nhập
  requireStaff,   // Staff hoặc admin đều xem được
  itemController.getAllItems
);

// GET /api/items/:id — Xem chi tiết 1 món
router.get(
  '/:id',
  authenticate,
  requireStaff,
  itemController.getItemById
);

// ---- QUẢN LÝ THỰC ĐƠN: Chỉ ADMIN ----

// POST /api/items — Thêm món mới (kèm upload ảnh)
router.post(
  '/',
  authenticate,    // Bước 1: Phải đăng nhập
  requireAdmin,    // Bước 2: Phải là admin
  uploadSingle,    // Bước 3: Multer nhận ảnh sản phẩm (field "image")
  itemController.createItem
);

// PUT /api/items/:id — Cập nhật thông tin món (kèm upload ảnh mới nếu có)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  uploadSingle,    // Cho phép thay ảnh khi cập nhật món
  itemController.updateItem
);

// DELETE /api/items/:id — Xóa món khỏi menu
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  itemController.deleteItem
);

module.exports = router;
