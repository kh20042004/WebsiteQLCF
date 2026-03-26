/**
 * Routes: categoryRoutes.js (đã phân quyền)
 *
 * Phân quyền:
 * - GET  /categories      → Tất cả nhân viên (staff + admin) đều xem được
 * - GET  /categories/:id  → Tất cả nhân viên
 * - POST /categories      → Chỉ ADMIN (tạo danh mục mới)
 * - PUT  /categories/:id  → Chỉ ADMIN (sửa danh mục)
 * - DELETE /categories/:id → Chỉ ADMIN (xóa danh mục)
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Import middleware phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');

// ---- XEM DANH MỤC: Tất cả nhân viên ----
// GET /api/categories
router.get(
  '/',
  authenticate,    // Bước 1: Phải đăng nhập
  requireStaff,    // Bước 2: Phải là staff hoặc admin
  categoryController.getAllCategories
);

// GET /api/categories/:id
router.get(
  '/:id',
  authenticate,
  requireStaff,
  categoryController.getCategoryById
);

// ---- QUẢN LÝ DANH MỤC: Chỉ ADMIN ----

// POST /api/categories — Tạo danh mục mới
router.post(
  '/',
  authenticate,    // Bước 1: Phải đăng nhập
  requireAdmin,    // Bước 2: Phải là admin
  categoryController.createCategory
);

// PUT /api/categories/:id — Cập nhật danh mục
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.updateCategory
);

// DELETE /api/categories/:id — Xóa danh mục
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.deleteCategory
);

module.exports = router;
