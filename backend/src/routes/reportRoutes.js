/**
 * Routes: reportRoutes.js (đã phân quyền)
 *
 * Phân quyền báo cáo:
 * - GET /reports/daily      → Chỉ ADMIN (doanh thu — thông tin nhạy cảm)
 * - GET /reports/top-items  → Chỉ ADMIN (thống kê kinh doanh)
 *
 * Lý do chỉ admin được xem báo cáo:
 * → Thông tin doanh thu là dữ liệu kinh doanh nhạy cảm
 * → Chỉ quản lý (admin) mới cần biết để ra quyết định kinh doanh
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin } = require('../middlewares/authenticate');

// GET /api/reports/daily?date=YYYY-MM-DD — Doanh thu theo ngày
// Chỉ admin mới xem được thông tin doanh thu
router.get(
  '/daily',
  authenticate,
  requireAdmin,    // Chỉ admin
  reportController.getDailyReport
);

// GET /api/reports/top-items?date=YYYY-MM-DD — Top 5 món bán chạy
// Chỉ admin mới xem được thống kê bán hàng
router.get(
  '/top-items',
  authenticate,
  requireAdmin,    // Chỉ admin
  reportController.getTopItems
);

module.exports = router;