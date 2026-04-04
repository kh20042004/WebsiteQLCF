/**
 * Controller: Payment (Thanh toán)
 * 
 * CHỨC NĂNG CHÍNH:
 * 1. Tạo giao dịch thanh toán mới
 * 2. Xem lịch sử thanh toán
 * 3. Cập nhật trạng thái thanh toán (xác nhận chuyển khoản)
 * 4. Hoàn tiền (refund)
 * 5. Báo cáo doanh thu theo phương thức
 * 
 * PHÂN QUYỀN:
 * - Staff: Tạo thanh toán, xem lịch sử
 * - Admin: Toàn quyền (cập nhật, xóa, báo cáo)
 */

const Payment = require('../models/Payment');
const Order = require('../models/Order');

const paymentController = {
    /**
     * ============================================================
     * TẠO GIAO DỊCH THANH TOÁN MỚI
     * ============================================================
     * 
     * POST /api/payments
     * 
     * Body:
     * {
     *   "orderId": "65abc123...",
     *   "method": "cash",
     *   "amount": 500000,
     *   "receivedAmount": 500000,
     *   "transactionId": "VCB123456" (optional),
     *   "note": "Khách yêu cầu xuất hóa đơn"
     * }
     * 
     * LOGIC:
     * 1. Kiểm tra đơn hàng có tồn tại không
     * 2. Kiểm tra đơn hàng đã thanh toán đủ chưa
     * 3. Tạo giao dịch thanh toán
     * 4. Cập nhật trạng thái đơn hàng (nếu thanh toán đủ)
     */
    createPayment: async (req, res) => {
        try {
            const { orderId, method, amount, receivedAmount, transactionId, note } = req.body;
            const userId = req.user._id;

            // ---- BƯỚC 1: KIỂM TRA ĐƠN HÀNG TỒN TẠI ----
            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy đơn hàng'
                });
            }

            // ---- BƯỚC 2: TÍNH TỔNG ĐÃ THANH TOÁN ----
            const paidPayments = await Payment.find({
                orderId,
                status: 'completed'
            });

            const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
            const remaining = order.totalPrice - totalPaid;

            console.log(`💰 Đơn hàng ${orderId}: Tổng ${order.totalPrice}đ, Đã trả ${totalPaid}đ, Còn ${remaining}đ`);

            // ---- BƯỚC 3: VALIDATE SỐ TIỀN THANH TOÁN ----
            if (amount > remaining) {
                return res.status(400).json({
                    status: false,
                    message: `Số tiền thanh toán vượt quá số tiền còn lại (${remaining}đ)`
                });
            }

            // ---- BƯỚC 4: TẠO GIAO DỊCH THANH TOÁN ----
            const payment = await Payment.create({
                orderId,
                method,
                amount,
                receivedAmount: receivedAmount || amount,
                transactionId,
                note,
                createdBy: userId
            });

            // ---- BƯỚC 5: POPULATE THÔNG TIN LIÊN QUAN ----
            const populatedPayment = await Payment.findById(payment._id)
                .populate('orderId', 'table totalPrice status')
                .populate('createdBy', 'name email role');

            console.log(`✅ Tạo thanh toán thành công: ${payment._id}, Phương thức: ${method}, Số tiền: ${amount}đ`);

            // ---- BƯỚC 6: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (nếu thanh toán đủ) ----
            const newTotalPaid = totalPaid + amount;
            
            if (newTotalPaid >= order.totalPrice && order.status !== 'done') {
                order.status = 'done';
                await order.save();
                console.log(`🎉 Đơn hàng ${orderId} đã thanh toán đủ → Chuyển sang trạng thái 'done'`);
            }

            res.status(201).json({
                status: true,
                message: 'Tạo giao dịch thanh toán thành công',
                data: {
                    payment: populatedPayment,
                    orderStatus: {
                        totalPrice: order.totalPrice,
                        totalPaid: newTotalPaid,
                        remaining: order.totalPrice - newTotalPaid,
                        isPaidFull: newTotalPaid >= order.totalPrice
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi tạo thanh toán:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi tạo thanh toán',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ============================================================
     * LẤY DANH SÁCH GIAO DỊCH THANH TOÁN
     * ============================================================
     * 
     * GET /api/payments?page=1&limit=20&method=cash&status=completed
     * 
     * Query params:
     * - page: Trang hiện tại (default: 1)
     * - limit: Số lượng mỗi trang (default: 20)
     * - method: Lọc theo phương thức (cash/transfer/card/ewallet)
     * - status: Lọc theo trạng thái (pending/completed/failed/refunded)
     * - orderId: Lọc theo đơn hàng cụ thể
     * - startDate: Ngày bắt đầu (YYYY-MM-DD)
     * - endDate: Ngày kết thúc (YYYY-MM-DD)
     */
    getAllPayments: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 20,
                method,
                status,
                orderId,
                startDate,
                endDate
            } = req.query;

            // ---- XÂY DỰNG QUERY ----
            const query = {};

            if (method) query.method = method;
            if (status) query.status = status;
            if (orderId) query.orderId = orderId;

            // Lọc theo khoảng thời gian
            if (startDate || endDate) {
                query.paidAt = {};
                if (startDate) query.paidAt.$gte = new Date(startDate);
                if (endDate) query.paidAt.$lte = new Date(endDate);
            }

            // ---- PHÂN TRANG ----
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (pageNum - 1) * limitNum;

            // ---- THỰC HIỆN QUERY ----
            const [payments, totalCount] = await Promise.all([
                Payment.find(query)
                    .populate('orderId', 'table totalPrice status')
                    .populate('createdBy', 'name email role')
                    .sort({ paidAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),
                
                Payment.countDocuments(query)
            ]);

            // ---- METADATA PHÂN TRANG ----
            const totalPages = Math.ceil(totalCount / limitNum);

            res.status(200).json({
                status: true,
                message: 'Lấy danh sách thanh toán thành công',
                data: {
                    payments,
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalCount,
                        limit: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPrevPage: pageNum > 1
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy danh sách thanh toán:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy danh sách thanh toán',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ============================================================
     * LẤY CHI TIẾT 1 GIAO DỊCH THANH TOÁN
     * ============================================================
     * 
     * GET /api/payments/:id
     */
    getPaymentById: async (req, res) => {
        try {
            const { id } = req.params;

            const payment = await Payment.findById(id)
                .populate('orderId', 'table totalPrice status items')
                .populate('createdBy', 'name email role');

            if (!payment) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy giao dịch thanh toán'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Lấy thông tin thanh toán thành công',
                data: payment
            });

        } catch (error) {
            console.error('💥 Lỗi lấy chi tiết thanh toán:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy chi tiết thanh toán',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ============================================================
     * CẬP NHẬT TRẠNG THÁI THANH TOÁN (CHỈ ADMIN)
     * ============================================================
     * 
     * PUT /api/payments/:id/status
     * 
     * Body:
     * {
     *   "status": "completed",
     *   "note": "Đã xác nhận chuyển khoản"
     * }
     * 
     * USE CASE:
     * - Xác nhận chuyển khoản: pending → completed
     * - Đánh dấu thất bại: pending → failed
     */
    updatePaymentStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, note } = req.body;

            // ---- VALIDATE TRẠNG THÁI MỚI ----
            const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: false,
                    message: 'Trạng thái không hợp lệ'
                });
            }

            // ---- TÌM VÀ CẬP NHẬT ----
            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy giao dịch thanh toán'
                });
            }

            const oldStatus = payment.status;
            payment.status = status;
            if (note) payment.note = note;
            await payment.save();

            console.log(`🔄 Cập nhật trạng thái thanh toán ${id}: ${oldStatus} → ${status}`);

            res.status(200).json({
                status: true,
                message: 'Cập nhật trạng thái thanh toán thành công',
                data: payment
            });

        } catch (error) {
            console.error('💥 Lỗi cập nhật trạng thái:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi cập nhật trạng thái',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ============================================================
     * BÁO CÁO DOANH THU THEO PHƯƠNG THỨC (CHỈ ADMIN)
     * ============================================================
     * 
     * GET /api/payments/report/by-method?startDate=2024-01-01&endDate=2024-12-31
     * 
     * Response:
     * {
     *   "cash": { total: 50000000, count: 120 },
     *   "transfer": { total: 30000000, count: 80 },
     *   ...
     * }
     */
    getRevenueByMethod: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;

            // ---- XÂY DỰNG QUERY ----
            const query = { status: 'completed' };

            if (startDate || endDate) {
                query.paidAt = {};
                if (startDate) query.paidAt.$gte = new Date(startDate);
                if (endDate) query.paidAt.$lte = new Date(endDate);
            }

            // ---- AGGREGATE THEO PHƯƠNG THỨC ----
            const result = await Payment.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$method',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                },
                {
                    $project: {
                        method: '$_id',
                        total: 1,
                        count: 1,
                        avgAmount: { $round: ['$avgAmount', 0] },
                        _id: 0
                    }
                }
            ]);

            // ---- FORMAT KẾT QUẢ ----
            const report = {};
            result.forEach(item => {
                report[item.method] = {
                    total: item.total,
                    count: item.count,
                    avgAmount: item.avgAmount
                };
            });

            // ---- TÍNH TỔNG ----
            const grandTotal = result.reduce((sum, item) => sum + item.total, 0);
            const grandCount = result.reduce((sum, item) => sum + item.count, 0);

            res.status(200).json({
                status: true,
                message: 'Lấy báo cáo doanh thu thành công',
                data: {
                    byMethod: report,
                    summary: {
                        totalRevenue: grandTotal,
                        totalTransactions: grandCount,
                        avgPerTransaction: grandCount > 0 ? Math.round(grandTotal / grandCount) : 0
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy báo cáo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy báo cáo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ============================================================
     * XÓA GIAO DỊCH THANH TOÁN (CHỈ ADMIN - SOFT DELETE)
     * ============================================================
     * 
     * DELETE /api/payments/:id
     * 
     * CHÚ Ý: Chỉ xóa được giao dịch ở trạng thái pending hoặc failed
     * Không xóa được giao dịch đã completed
     */
    deletePayment: async (req, res) => {
        try {
            const { id } = req.params;

            const payment = await Payment.findById(id);

            if (!payment) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy giao dịch thanh toán'
                });
            }

            // ---- VALIDATE: KHÔNG XÓA GIAO DỊCH ĐÃ HOÀN THÀNH ----
            if (payment.status === 'completed') {
                return res.status(400).json({
                    status: false,
                    message: 'Không thể xóa giao dịch đã hoàn thành'
                });
            }

            // ---- XÓA GIAO DỊCH ----
            await Payment.findByIdAndDelete(id);

            console.log(`🗑️ Đã xóa giao dịch thanh toán ${id}`);

            res.status(200).json({
                status: true,
                message: 'Xóa giao dịch thanh toán thành công'
            });

        } catch (error) {
            console.error('💥 Lỗi xóa thanh toán:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi xóa thanh toán',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = paymentController;
