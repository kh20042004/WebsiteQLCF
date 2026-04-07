/**
 * Routes: reviewRoutes.js
 * 
 * Định nghĩa các API endpoint cho hệ thống đánh giá/review
 * Prefix: /api/reviews (đã được khai báo trong app.js)
 * 
 * ┌────────────────────────────────────────────────────────────┐
 * │ METHOD │ ENDPOINT                      │ MÔ TẢ              │
 * ├────────────────────────────────────────────────────────────┤
 * │ GET    │ /api/reviews                  │ Lấy danh sách      │
 * │ GET    │ /api/reviews/:id              │ Chi tiết review    │
 * │ GET    │ /api/reviews/item/:itemId     │ Review của item    │
 * │ POST   │ /api/reviews                  │ Tạo review (Auth)  │
 * │ PUT    │ /api/reviews/:id              │ Cập nhật (Owner)   │
 * │ DELETE │ /api/reviews/:id              │ Xóa (Owner)        │
 * │ PATCH  │ /api/reviews/:id/approve      │ Phê duyệt (Admin)  │
 * │ PATCH  │ /api/reviews/:id/reject       │ Từ chối (Admin)    │
 * │ POST   │ /api/reviews/:id/reply        │ Trả lời (Staff)    │
 * │ GET    │ /api/reviews/pending/all      │ Pending (Admin)    │
 * └────────────────────────────────────────────────────────────┘
 * 
 * 📌 PHÂN QUYỀN:
 * - GET endpoints: Công khai (ai cũng xem được)
 * - POST (tạo): Yêu cầu đăng nhập (authenticate)
 * - PUT/DELETE: Chỉ chủ sở hữu hoặc admin
 * - PATCH (phê duyệt/từ chối): Chỉ admin
 * - POST (reply): Chỉ admin/staff
 * 
 * Cái dùng (Frontend):
 * - Lấy review của item: GET /api/reviews/item/64f...
 * - Tạo review mới: POST /api/reviews (yêu cầu auth)
 * - Cập nhật review: PUT /api/reviews/64f... (yêu cầu chủ sở hữu hoặc admin)
 * - Xóa review: DELETE /api/reviews/64f... (yêu cầu chủ sở hữu hoặc admin)
 */

const express = require('express');
const router = express.Router();

// ---- IMPORT MIDDLEWARE ----
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');

// ---- IMPORT CONTROLLER ----
const {
  getAllReviews,
  getReviewById,
  getReviewsByItem,
  createReview,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  replyReview,
  getPendingReviews,
} = require('../controllers/reviewController');

// ============================================================
// GET /api/reviews
// Lấy danh sách tất cả review (có phân trang)
// 🔓 CÔNG KHAI
//
// Query params:
// - itemId: Lọc theo item cụ thể
// - status: Lọc theo trạng thái (approved, pending, rejected)
// - page: Trang hiện tại (mặc định: 1)
// - limit: Số review mỗi trang (mặc định: 10)
// - sort: Sắp xếp (-createdAt, rating, etc)
//
// Response: Danh sách review được phê duyệt + metadata
// ============================================================
router.get('/', getAllReviews);

// ============================================================
// GET /api/reviews/:id
// Lấy chi tiết một review cụ thể
// 🔓 CÔNG KHAI
//
// Params:
// - id: ID của review
//
// Response: Thông tin chi tiết review kèm populate
// ============================================================
router.get('/:id', getReviewById);

// ============================================================
// GET /api/reviews/item/:itemId
// Lấy tất cả review được phê duyệt của một item
// 🔓 CÔNG KHAI
//
// Params:
// - itemId: ID của item
//
// Response: Danh sách review + điểm trung bình + tổng review
// ============================================================
router.get('/item/:itemId', getReviewsByItem);

// ============================================================
// POST /api/reviews
// Tạo review mới
// 🔒 YÊU CẦU ĐĂNG NHẬP
//
// Body:
// {
//   itemId: "64f...",
//   rating: 4,
//   comment: "Rất ngon!"
// }
//
// Response: Review đã tạo (status: pending)
// ============================================================
router.post(
  '/',
  authenticate, // Yêu cầu đăng nhập
  createReview
);

// ============================================================
// PUT /api/reviews/:id
// Cập nhật review
// 🔒 YÊU CẦU: Chủ sở hữu hoặc admin
//
// Params:
// - id: ID của review
//
// Body:
// {
//   rating?: 5,
//   comment?: "Cập nhật chi tiết hơn"
// }
//
// Response: Review đã cập nhật (status: pending nếu cập nhật comment)
// ============================================================
router.put(
  '/:id',
  authenticate, // Yêu cầu đăng nhập
  updateReview
);

// ============================================================
// DELETE /api/reviews/:id
// Xóa review
// 🔒 YÊU CẦU: Chủ sở hữu hoặc admin
//
// Params:
// - id: ID của review
//
// Response: Thông báo xóa thành công
// ============================================================
router.delete(
  '/:id',
  authenticate, // Yêu cầu đăng nhập
  deleteReview
);

// ============================================================
// PATCH /api/reviews/:id/approve
// Phê duyệt review
// 🔒 CHỈ ADMIN
//
// Params:
// - id: ID của review
//
// Response: Review đã phê duyệt (status: approved)
// ============================================================
router.patch(
  '/:id/approve',
  authenticate, // Bước 1: Xác thực
  requireAdmin, // Bước 2: Chỉ admin
  approveReview
);

// ============================================================
// PATCH /api/reviews/:id/reject
// Từ chối review
// 🔒 CHỈ ADMIN
//
// Params:
// - id: ID của review
//
// Response: Review đã từ chối (status: rejected)
// ============================================================
router.patch(
  '/:id/reject',
  authenticate, // Bước 1: Xác thực
  requireAdmin, // Bước 2: Chỉ admin
  rejectReview
);

// ============================================================
// POST /api/reviews/:id/reply
// Thêm trả lời từ shop
// 🔒 CHỈ ADMIN/STAFF
//
// Params:
// - id: ID của review
//
// Body:
// {
//   reply: "Cảm ơn bạn đã đánh giá!"
// }
//
// Response: Review đã cập nhật với trả lời
// ============================================================
router.post(
  '/:id/reply',
  authenticate, // Bước 1: Xác thực
  requireStaff, // Bước 2: Chỉ staff (admin + staff)
  replyReview
);

// ============================================================
// GET /api/reviews/pending/all
// Lấy danh sách review chưa phê duyệt
// 🔒 CHỈ ADMIN
//
// Response: Danh sách review pending + tổng số
// ============================================================
router.get(
  '/pending/all',
  authenticate, // Bước 1: Xác thực
  requireAdmin, // Bước 2: Chỉ admin
  getPendingReviews
);

// ============================================================
// EXPORT ROUTER
// ============================================================
module.exports = router;
