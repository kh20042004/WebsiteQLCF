/**
 * Routes: Payment (Thanh toán)
 * 
 * ENDPOINT PREFIX: /api/payments
 * 
 * DANH SÁCH ROUTES:
 * - POST   /                    - Tạo giao dịch thanh toán mới (Staff+)
 * - GET    /                    - Lấy danh sách thanh toán (Staff+)
 * - GET    /:id                 - Lấy chi tiết 1 thanh toán (Staff+)
 * - PUT    /:id/status          - Cập nhật trạng thái (Admin only)
 * - DELETE /:id                 - Xóa thanh toán (Admin only)
 * - GET    /report/by-method    - Báo cáo doanh thu (Admin only)
 * 
 * AUTHENTICATION:
 * - Tất cả routes yêu cầu JWT token
 * 
 * AUTHORIZATION:
 * - Staff: Tạo, xem thanh toán
 * - Admin: Toàn quyền
 */

const express = require('express');
const router = express.Router();

// ---- IMPORT MIDDLEWARE ----
const authenticate = require('../middlewares/authenticate');
const { requireAdmin } = require('../middlewares/authenticate');

// ---- IMPORT CONTROLLER ----
const paymentController = require('../controllers/paymentController');

// ---- IMPORT VALIDATOR ----
const { PaymentValidator, PaymentStatusValidator } = require('../validators/paymentValidator');
const handleValidation = require('../middlewares/handleValidation');

// ============================================================
// ROUTES CÔNG KHAI (CHỈ CẦN AUTHENTICATE)
// ============================================================

/**
 * POST /api/payments
 * TẠO GIAO DỊCH THANH TOÁN MỚI
 * 
 * PHÂN QUYỀN: Staff + Admin
 * 
 * BODY:
 * {
 *   "orderId": "65abc123...",
 *   "method": "cash",
 *   "amount": 500000,
 *   "receivedAmount": 500000,
 *   "transactionId": "VCB123456",
 *   "note": "Ghi chú"
 * }
 * 
 * FLOW:
 * 1. Authenticate token
 * 2. Validate dữ liệu (PaymentValidator)
 * 3. Xử lý validation errors
 * 4. Gọi controller createPayment
 */
router.post(
    '/',
    authenticate,                   // Bước 1: Xác thực token
    PaymentValidator,               // Bước 2: Validate dữ liệu
    handleValidation,               // Bước 3: Xử lý lỗi validation
    paymentController.createPayment // Bước 4: Tạo thanh toán
);

/**
 * GET /api/payments
 * LẤY DANH SÁCH THANH TOÁN
 * 
 * PHÂN QUYỀN: Staff + Admin
 * 
 * QUERY PARAMS:
 * - page: Trang hiện tại (default: 1)
 * - limit: Số lượng/trang (default: 20)
 * - method: Lọc theo phương thức (cash/transfer/card/ewallet)
 * - status: Lọc theo trạng thái (pending/completed/failed/refunded)
 * - orderId: Lọc theo đơn hàng
 * - startDate: Ngày bắt đầu (YYYY-MM-DD)
 * - endDate: Ngày kết thúc (YYYY-MM-DD)
 * 
 * VÍ DỤ:
 * GET /api/payments?page=1&limit=20&method=cash&status=completed
 */
router.get(
    '/',
    authenticate,                      // Xác thực token
    paymentController.getAllPayments   // Lấy danh sách
);

/**
 * GET /api/payments/:id
 * LẤY CHI TIẾT 1 GIAO DỊCH THANH TOÁN
 * 
 * PHÂN QUYỀN: Staff + Admin
 * 
 * PARAMS:
 * - id: ID của giao dịch thanh toán
 */
router.get(
    '/:id',
    authenticate,                       // Xác thực token
    paymentController.getPaymentById    // Lấy chi tiết
);

// ============================================================
// ROUTES ADMIN (YÊU CẦU QUYỀN ADMIN)
// ============================================================

/**
 * PUT /api/payments/:id/status
 * CẬP NHẬT TRẠNG THÁI THANH TOÁN
 * 
 * PHÂN QUYỀN: Chỉ Admin
 * 
 * USE CASE:
 * - Xác nhận chuyển khoản: pending → completed
 * - Đánh dấu thất bại: pending → failed
 * - Hoàn tiền: completed → refunded
 * 
 * BODY:
 * {
 *   "status": "completed",
 *   "note": "Đã xác nhận chuyển khoản"
 * }
 */
router.put(
    '/:id/status',
    authenticate,                            // Bước 1: Xác thực token
    requireAdmin,                            // Bước 2: Kiểm tra quyền admin
    PaymentStatusValidator,                  // Bước 3: Validate status
    handleValidation,                        // Bước 4: Xử lý lỗi
    paymentController.updatePaymentStatus    // Bước 5: Cập nhật
);

/**
 * GET /api/payments/report/by-method
 * BÁO CÁO DOANH THU THEO PHƯƠNG THỨC THANH TOÁN
 * 
 * PHÂN QUYỀN: Chỉ Admin
 * 
 * QUERY PARAMS:
 * - startDate: Ngày bắt đầu (YYYY-MM-DD)
 * - endDate: Ngày kết thúc (YYYY-MM-DD)
 * 
 * RESPONSE:
 * {
 *   "byMethod": {
 *     "cash": { total: 50000000, count: 120, avgAmount: 416667 },
 *     "transfer": { total: 30000000, count: 80, avgAmount: 375000 }
 *   },
 *   "summary": {
 *     "totalRevenue": 80000000,
 *     "totalTransactions": 200,
 *     "avgPerTransaction": 400000
 *   }
 * }
 * 
 * CHÚ Ý: Route này phải đặt TRƯỚC /:id để tránh conflict
 */
router.get(
    '/report/by-method',
    authenticate,                           // Xác thực token
    requireAdmin,                           // Kiểm tra admin
    paymentController.getRevenueByMethod    // Lấy báo cáo
);

/**
 * DELETE /api/payments/:id
 * XÓA GIAO DỊCH THANH TOÁN
 * 
 * PHÂN QUYỀN: Chỉ Admin
 * 
 * CHÚ Ý:
 * - Chỉ xóa được giao dịch pending hoặc failed
 * - KHÔNG xóa được giao dịch đã completed (để audit trail)
 */
router.delete(
    '/:id',
    authenticate,                      // Xác thực token
    requireAdmin,                      // Kiểm tra admin
    paymentController.deletePayment    // Xóa
);

module.exports = router;
