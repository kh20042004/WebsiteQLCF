/**
 * Model: Payment (Thanh toán)
 * 
 * MÔ TẢ:
 * Model lưu trữ lịch sử thanh toán của các đơn hàng
 * Mỗi đơn hàng có thể có nhiều lần thanh toán (trả góp, cọc trước...)
 * 
 * CHỨC NĂNG:
 * - Lưu lịch sử thanh toán chi tiết
 * - Hỗ trợ nhiều phương thức thanh toán
 * - Theo dõi trạng thái thanh toán
 * - Tính toán tiền thối tự động
 * - Hỗ trợ báo cáo doanh thu theo phương thức
 * 
 * LIÊN KẾT:
 * - Order: 1 đơn hàng - N thanh toán
 * - User: Nhân viên xử lý thanh toán
 */

const mongoose = require('mongoose');

/**
 * SCHEMA PAYMENT
 * 
 * Các trường dữ liệu:
 * - orderId: ID đơn hàng được thanh toán
 * - method: Phương thức thanh toán (tiền mặt/chuyển khoản/thẻ)
 * - amount: Số tiền cần thanh toán
 * - receivedAmount: Số tiền thực tế nhận được
 * - changeAmount: Tiền thối lại (tự động tính)
 * - transactionId: Mã giao dịch (với chuyển khoản/thẻ)
 * - status: Trạng thái thanh toán
 * - paidAt: Thời gian thanh toán
 * - note: Ghi chú thêm
 * - createdBy: Nhân viên thu tiền
 */
const paymentSchema = new mongoose.Schema(
    {
        // ============================================================
        // THÔNG TIN ĐỐI TƯỢNG THANH TOÁN
        // ============================================================
        
        /**
         * MÃ ĐỐN HÀNG
         * 
         * Liên kết với Order model
         * Bắt buộc phải có
         * Index để query nhanh
         */
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: [true, 'Mã đơn hàng là bắt buộc'],
            index: true
        },

        // ============================================================
        // PHƯƠNG THỨC THANH TOÁN
        // ============================================================
        
        /**
         * HÌNH THỨC THANH TOÁN
         * 
         * Các giá trị hợp lệ:
         * - cash: Tiền mặt
         * - transfer: Chuyển khoản ngân hàng
         * - card: Quẹt thẻ (ATM/Credit)
         * - ewallet: Ví điện tử (Momo, ZaloPay...)
         */
        method: {
            type: String,
            enum: {
                values: ['cash', 'transfer', 'card', 'ewallet'],
                message: 'Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: cash, transfer, card, ewallet'
            },
            required: [true, 'Phương thức thanh toán là bắt buộc'],
            default: 'cash'
        },

        // ============================================================
        // THÔNG TIN TIỀN BẠC
        // ============================================================
        
        /**
         * SỐ TIỀN CẦN THANH TOÁN
         * 
         * Tổng số tiền cần thu từ khách
         * Bắt buộc phải > 0
         * Đơn vị: VND
         */
        amount: {
            type: Number,
            required: [true, 'Số tiền thanh toán là bắt buộc'],
            min: [0, 'Số tiền không được âm'],
            validate: {
                validator: function(value) {
                    return value > 0;
                },
                message: 'Số tiền phải lớn hơn 0'
            }
        },

        /**
         * SỐ TIỀN THỰC TẾ NHẬN ĐƯỢC
         * 
         * Số tiền khách đưa (với tiền mặt)
         * Hoặc số tiền chuyển khoản thực tế
         * Mặc định bằng amount
         */
        receivedAmount: {
            type: Number,
            default: function() {
                return this.amount;
            },
            min: [0, 'Số tiền nhận không được âm']
        },

        /**
         * TIỀN THỐI LẠI
         * 
         * Tự động tính = receivedAmount - amount
         * Chỉ áp dụng với thanh toán tiền mặt
         * Với chuyển khoản/thẻ thì = 0
         */
        changeAmount: {
            type: Number,
            default: 0,
            min: [0, 'Tiền thối không được âm']
        },

        // ============================================================
        // THÔNG TIN GIAO DỊCH
        // ============================================================
        
        /**
         * MÃ GIAO DỊCH
         * 
         * Dùng cho chuyển khoản/quẹt thẻ
         * Ví dụ: "VCB20240404123456" (chuyển khoản)
         *        "1234567890" (mã thẻ)
         * Không bắt buộc với tiền mặt
         */
        transactionId: {
            type: String,
            trim: true,
            sparse: true, // Cho phép nhiều document có giá trị null
            maxlength: [100, 'Mã giao dịch không quá 100 ký tự']
        },

        // ============================================================
        // TRẠNG THÁI THANH TOÁN
        // ============================================================
        
        /**
         * TRẠNG THÁI
         * 
         * Các giá trị:
         * - pending: Đang chờ xác nhận (chuyển khoản)
         * - completed: Đã hoàn thành
         * - failed: Thất bại
         * - refunded: Đã hoàn tiền
         */
        status: {
            type: String,
            enum: {
                values: ['pending', 'completed', 'failed', 'refunded'],
                message: 'Trạng thái không hợp lệ'
            },
            default: function() {
                // Tiền mặt → completed ngay
                // Chuyển khoản/Thẻ → pending chờ xác nhận
                return this.method === 'cash' ? 'completed' : 'pending';
            },
            index: true
        },

        /**
         * THỜI GIAN THANH TOÁN
         * 
         * Thời điểm thực hiện giao dịch
         * Mặc định là thời điểm hiện tại
         */
        paidAt: {
            type: Date,
            default: Date.now
        },

        // ============================================================
        // THÔNG TIN BỔ SUNG
        // ============================================================
        
        /**
         * GHI CHÚ
         * 
         * Ghi chú thêm về giao dịch
         * Ví dụ: "Khách yêu cầu xuất hóa đơn"
         *        "Chuyển khoản qua Vietcombank"
         */
        note: {
            type: String,
            trim: true,
            maxlength: [500, 'Ghi chú không quá 500 ký tự']
        },

        // ============================================================
        // THÔNG TIN NGƯỜI XỬ LÝ
        // ============================================================
        
        /**
         * NHÂN VIÊN THU TIỀN
         * 
         * User thực hiện giao dịch thanh toán
         * Liên kết với User model
         * Lấy từ req.user (JWT middleware)
         */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Nhân viên thu tiền là bắt buộc'],
            index: true
        }
    },
    {
        // Tự động thêm createdAt và updatedAt
        timestamps: true
    }
);

// ============================================================
// INDEXES ĐỂ TỐI ƯU QUERY
// ============================================================

/**
 * COMPOUND INDEX
 * 
 * Query thường dùng:
 * - Lấy thanh toán theo đơn hàng + trạng thái
 * - Lấy thanh toán theo ngày + phương thức
 */
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ paidAt: -1, method: 1 });
paymentSchema.index({ createdBy: 1, paidAt: -1 });

// ============================================================
// MIDDLEWARE: TỰ ĐỘNG TÍNH TIỀN THỐI
// ============================================================

/**
 * PRE-SAVE MIDDLEWARE
 * 
 * Trước khi lưu vào database:
 * 1. Tính tiền thối = receivedAmount - amount
 * 2. Nếu không phải tiền mặt → changeAmount = 0
 * 3. Validate: receivedAmount >= amount (không được thiếu tiền)
 */
paymentSchema.pre('save', function(next) {
    // Nếu là tiền mặt → tính tiền thối
    if (this.method === 'cash') {
        this.changeAmount = this.receivedAmount - this.amount;
        
        // Validate: Không được nhận ít hơn số tiền cần thanh toán
        if (this.changeAmount < 0) {
            return next(new Error('Số tiền nhận không đủ để thanh toán'));
        }
    } else {
        // Chuyển khoản/Thẻ → tiền thối = 0
        this.changeAmount = 0;
        // receivedAmount = amount chính xác
        this.receivedAmount = this.amount;
    }
    
    next();
});

// ============================================================
// VIRTUAL FIELDS
// ============================================================

/**
 * VIRTUAL: Tên phương thức thanh toán (tiếng Việt)
 * 
 * Chuyển đổi:
 * - cash → "Tiền mặt"
 * - transfer → "Chuyển khoản"
 * - card → "Quẹt thẻ"
 * - ewallet → "Ví điện tử"
 */
paymentSchema.virtual('methodName').get(function() {
    const methodNames = {
        cash: 'Tiền mặt',
        transfer: 'Chuyển khoản',
        card: 'Quẹt thẻ',
        ewallet: 'Ví điện tử'
    };
    return methodNames[this.method] || this.method;
});

/**
 * VIRTUAL: Tên trạng thái (tiếng Việt)
 */
paymentSchema.virtual('statusName').get(function() {
    const statusNames = {
        pending: 'Đang chờ',
        completed: 'Hoàn thành',
        failed: 'Thất bại',
        refunded: 'Đã hoàn tiền'
    };
    return statusNames[this.status] || this.status;
});

// ============================================================
// STATIC METHODS - HÀM TIỆN ÍCH
// ============================================================

/**
 * ĐẾM TỔNG DOANH THU THEO PHƯƠNG THỨC
 * 
 * @param {String} method - Phương thức thanh toán (cash/transfer/card/ewallet)
 * @param {Date} startDate - Ngày bắt đầu (optional)
 * @param {Date} endDate - Ngày kết thúc (optional)
 * @returns {Promise<Number>} Tổng doanh thu
 */
paymentSchema.statics.getTotalByMethod = async function(method, startDate, endDate) {
    const query = {
        method,
        status: 'completed'
    };
    
    if (startDate || endDate) {
        query.paidAt = {};
        if (startDate) query.paidAt.$gte = startDate;
        if (endDate) query.paidAt.$lte = endDate;
    }
    
    const result = await this.aggregate([
        { $match: query },
        { 
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    return result.length > 0 ? result[0] : { total: 0, count: 0 };
};

/**
 * LẤY LỊCH SỬ THANH TOÁN CỦA ĐƠN HÀNG
 * 
 * @param {ObjectId} orderId - ID đơn hàng
 * @returns {Promise<Array>} Danh sách thanh toán
 */
paymentSchema.statics.getPaymentsByOrder = async function(orderId) {
    return this.find({ orderId })
        .populate('createdBy', 'name email role')
        .sort({ paidAt: -1 })
        .lean();
};

// ============================================================
// EXPORT MODEL
// ============================================================

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
