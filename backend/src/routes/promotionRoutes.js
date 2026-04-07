/**
 * Routes: promotionRoutes.js
 *
 * Định nghĩa RESTful routes cho hệ thống khuyến mãi / mã giảm giá
 *
 * 📌 PHÂN QUYỀN:
 * - GET    /promotions         → Staff + Admin (xem danh sách để biết có mã nào)
 * - GET    /promotions/:id     → Staff + Admin (xem chi tiết)
 * - POST   /promotions         → CHỈ ADMIN (tạo mã khuyến mãi mới)
 * - PUT    /promotions/:id     → CHỈ ADMIN (sửa thông tin khuyến mãi)
 * - DELETE /promotions/:id     → CHỈ ADMIN (xóa khuyến mãi)
 * - POST   /promotions/apply   → Staff + Admin (kiểm tra và áp dụng mã khi tạo đơn)
 *
 * Lý do phân quyền:
 * - Staff cần xem và áp dụng mã giảm giá khi tạo đơn hàng cho khách
 * - Nhưng chỉ Admin mới được tạo/sửa/xóa mã khuyến mãi
 */

const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ============================================================
// POST /api/promotions/apply — Kiểm tra và áp dụng mã giảm giá
// Staff + Admin: Dùng khi tạo đơn hàng
// ⚠️ ĐẶT TRƯỚC /:id ĐỂ TRÁNH CONFLICT VỚI ROUTE PARAMS
// ============================================================
router.post('/apply', authenticate, requireStaff, promotionController.applyPromotion);


// ============================================================
// GET /api/promotions — Lấy danh sách tất cả khuyến mãi
// Staff + Admin: Cả hai đều cần xem danh sách mã
// ============================================================
router.get('/', authenticate, requireStaff, promotionController.getAllPromotions);


// ============================================================
// GET /api/promotions/:id — Lấy chi tiết 1 khuyến mãi
// Staff + Admin: Cả hai đều được xem chi tiết
// ============================================================
router.get('/:id', authenticate, requireStaff, promotionController.getPromotionById);


// ============================================================
// POST /api/promotions — Tạo khuyến mãi mới
// CHỈ ADMIN: Chỉ quản lý mới được tạo mã giảm giá
// ============================================================
router.post('/', authenticate, requireAdmin, promotionController.createPromotion);


// ============================================================
// PUT /api/promotions/:id — Cập nhật khuyến mãi
// CHỈ ADMIN: Chỉ quản lý mới được sửa thông tin khuyến mãi
// ============================================================
router.put('/:id', authenticate, requireAdmin, promotionController.updatePromotion);


// ============================================================
// DELETE /api/promotions/:id — Xóa khuyến mãi (Soft delete)
// CHỈ ADMIN: Chỉ quản lý mới được xóa mã khuyến mãi
// ============================================================
router.delete('/:id', authenticate, requireAdmin, promotionController.deletePromotion);


module.exports = router;
