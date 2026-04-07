/**
 * Routes: shiftRoutes.js
 *
 * Định nghĩa RESTful routes cho quản lý ca làm việc
 *
 * 📌 PHÂN QUYỀN:
 * - GET    /shifts/my-shifts       → Staff + Admin (xem lịch ca cá nhân)
 * - POST   /shifts/:id/check-in   → Staff + Admin (check-in ca của mình)
 * - POST   /shifts/:id/check-out  → Staff + Admin (check-out ca của mình)
 * - GET    /shifts                 → Staff + Admin (xem tất cả ca)
 * - GET    /shifts/:id             → Staff + Admin (xem chi tiết ca)
 * - POST   /shifts                 → CHỈ ADMIN (xếp ca mới)
 * - PUT    /shifts/:id             → CHỈ ADMIN (sửa ca)
 * - DELETE /shifts/:id             → CHỈ ADMIN (xóa ca)
 *
 * Lý do phân quyền:
 * - Staff cần xem lịch + check-in/check-out ca của mình
 * - Admin quản lý xếp ca cho tất cả nhân viên
 */

const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ============================================================
// ⚠️ CÁC ROUTE ĐẶC BIỆT — ĐẶT TRƯỚC /:id ĐỂ TRÁNH CONFLICT
// ============================================================

// GET /api/shifts/my-shifts — Xem lịch ca cá nhân (Staff + Admin)
router.get('/my-shifts', authenticate, requireStaff, shiftController.getMyShifts);


// ============================================================
// ROUTES CHÍNH
// ============================================================

// GET /api/shifts — Lấy tất cả ca (Staff + Admin xem)
router.get('/', authenticate, requireStaff, shiftController.getAllShifts);

// GET /api/shifts/:id — Chi tiết 1 ca (Staff + Admin)
router.get('/:id', authenticate, requireStaff, shiftController.getShiftById);

// POST /api/shifts — Tạo ca mới / Xếp lịch (CHỈ ADMIN)
router.post('/', authenticate, requireAdmin, shiftController.createShift);

// PUT /api/shifts/:id — Cập nhật ca (CHỈ ADMIN)
router.put('/:id', authenticate, requireAdmin, shiftController.updateShift);

// DELETE /api/shifts/:id — Xóa ca (CHỈ ADMIN)
router.delete('/:id', authenticate, requireAdmin, shiftController.deleteShift);


// ============================================================
// ROUTES CHECK-IN / CHECK-OUT (Staff + Admin)
// ============================================================

// POST /api/shifts/:id/check-in — Staff check-in ca
router.post('/:id/check-in', authenticate, requireStaff, shiftController.checkIn);

// POST /api/shifts/:id/check-out — Staff check-out ca
router.post('/:id/check-out', authenticate, requireStaff, shiftController.checkOut);


module.exports = router;
