/**
 * Routes: notificationRoutes.js
 * 
 * Định nghĩa các API endpoint cho hệ thống thông báo
 * Prefix: /api/notifications (đã được khai báo trong app.js)
 * 
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ METHOD │ ENDPOINT                           │ MÔ TẢ                    │
 * ├──────────────────────────────────────────────────────────────────────┤
 * │ GET    │ /api/notifications                 │ Lấy danh sách thông báo   │
 * │ GET    │ /api/notifications/count           │ Đếm thông báo chưa đọc    │
 * │ GET    │ /api/notifications/stats           │ Thống kê (chỉ Admin)      │
 * │ POST   │ /api/notifications                 │ Tạo thông báo (chỉ Admin) │
 * │ PUT    │ /api/notifications/:id/read        │ Đánh dấu đã đọc           │
 * │ PUT    │ /api/notifications/mark-all-read   │ Đánh dấu tất cả đã đọc    │
 * │ DELETE │ /api/notifications/:id             │ Xóa thông báo             │
 * └──────────────────────────────────────────────────────────────────────┘
 * 
 * 📌 PHÂN QUYỀN:
 * - Tất cả endpoints yêu cầu authentication (đăng nhập)
 * - Staff: Chỉ xem/đọc thông báo của mình
 * - Admin: Toàn quyền + tạo thông báo hệ thống
 * 
 * Cách dùng (Frontend):
 * - Lấy thông báo: GET /api/notifications?page=1&limit=10&type=order
 * - Đếm badge: GET /api/notifications/count
 * - Đánh dấu đã đọc: PUT /api/notifications/64f.../read
 */

const express = require('express');
const router = express.Router();

// ---- IMPORT MIDDLEWARE ----
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');

// ---- IMPORT CONTROLLER ----
const {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    getNotificationStats
} = require('../controllers/notificationController');


// ============================================================
// GET /api/notifications
// Lấy danh sách thông báo của user hiện tại (có phân trang)
// STAFF + ADMIN: Cả hai đều có thể xem thông báo của mình
//
// Query params:
// - page=1          → Trang hiện tại (mặc định: 1)
// - limit=20        → Số thông báo mỗi trang (mặc định: 20, tối đa: 50)
// - type=order      → Lọc theo loại (success, warning, error, info, order, system)
// - isRead=false    → Lọc theo trạng thái đọc (true/false)
//
// Response: Danh sách thông báo + metadata phân trang
// ============================================================
router.get(
    '/',
    authenticate,        // Bước 1: Xác thực token
    requireStaff,        // Bước 2: Yêu cầu ít nhất là Staff (Staff + Admin)
    getUserNotifications // Bước 3: Lấy thông báo của user
);


// ============================================================
// GET /api/notifications/count
// Đếm số thông báo chưa đọc của user (để hiển thị badge đỏ)
// STAFF + ADMIN: Cả hai đều cần biết số thông báo chưa đọc
//
// Response: { unreadCount: 5, hasUnread: true }
// Frontend sử dụng để hiển thị số đỏ trên icon chuông
// ============================================================
router.get(
    '/count',
    authenticate,     // Bước 1: Xác thực token
    requireStaff,     // Bước 2: Yêu cầu ít nhất là Staff
    getUnreadCount    // Bước 3: Đếm thông báo chưa đọc
);


// ============================================================
// GET /api/notifications/stats
// Lấy thống kê tổng quan về thông báo (theo type, trạng thái)
// CHỈ ADMIN: Chỉ quản lý mới cần xem thống kê tổng thể
//
// Response: Thống kê số lượng thông báo theo từng loại
// ============================================================
router.get(
    '/stats',
    authenticate,           // Bước 1: Xác thực token
    requireAdmin,           // Bước 2: Chỉ Admin mới được xem stats
    getNotificationStats    // Bước 3: Lấy thống kê
);


// ============================================================
// POST /api/notifications
// Tạo thông báo mới (hệ thống hoặc gửi tới user cụ thể)
// CHỈ ADMIN: Chỉ quản lý mới được tạo thông báo
//
// Body: {
//   title: "Đơn hàng mới #123",
//   message: "Có đơn hàng mới cần xử lý",
//   type: "order",
//   userId: "64f..." (null = broadcast cho tất cả),
//   priority: 4,
//   actionUrl: "/orders/123",
//   icon: "fas fa-shopping-cart"
// }
// ============================================================
router.post(
    '/',
    authenticate,         // Bước 1: Xác thực token
    requireAdmin,         // Bước 2: Chỉ Admin được tạo thông báo
    createNotification    // Bước 3: Tạo thông báo mới
);


// ============================================================
// PUT /api/notifications/:id/read
// Đánh dấu 1 thông báo cụ thể đã đọc/chưa đọc
// STAFF + ADMIN: Mỗi user đánh dấu thông báo của mình
//
// Params: id = notificationId
// Body: { isRead: true } (optional, mặc định true)
//
// Sử dụng khi: User click vào 1 thông báo cụ thể
// ============================================================
router.put(
    '/:id/read',
    authenticate,  // Bước 1: Xác thực token
    requireStaff,  // Bước 2: Yêu cầu ít nhất là Staff
    markAsRead     // Bước 3: Đánh dấu thông báo đã đọc
);


// ============================================================
// PUT /api/notifications/mark-all-read
// Đánh dấu TẤT CẢ thông báo của user hiện tại là đã đọc
// STAFF + ADMIN: Mỗi user đánh dấu tất cả thông báo của mình
//
// Sử dụng khi: User click "Đánh dấu tất cả đã đọc"
// Response: Số lượng thông báo đã được đánh dấu
// ============================================================
router.put(
    '/mark-all-read',
    authenticate,    // Bước 1: Xác thực token
    requireStaff,    // Bước 2: Yêu cầu ít nhất là Staff
    markAllAsRead    // Bước 3: Đánh dấu tất cả đã đọc
);


// ============================================================
// DELETE /api/notifications/:id
// Xóa thông báo (soft delete)
// STAFF: Chỉ xóa thông báo của mình
// ADMIN: Xóa bất kỳ thông báo nào
//
// Params: id = notificationId
//
// Lưu ý: Thực hiện soft delete (isDeleted = true), không xóa vĩnh viễn
// ============================================================
router.delete(
    '/:id',
    authenticate,       // Bước 1: Xác thực token
    requireStaff,       // Bước 2: Yêu cầu ít nhất là Staff
    deleteNotification  // Bước 3: Xóa thông báo
);


module.exports = router;