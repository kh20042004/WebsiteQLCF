/**
 * Model: Promotion (Khuyến mãi / Mã giảm giá)
 *
 * MÔ TẢ:
 * Quản lý các chương trình khuyến mãi và mã giảm giá cho quán cà phê.
 * Hỗ trợ giảm theo phần trăm hoặc giảm cố định,
 * có giới hạn số lần sử dụng và thời gian hiệu lực.
 *
 * LIÊN KẾT:
 * - Item: Áp dụng khuyến mãi cho món ăn/đồ uống cụ thể (hoặc tất cả)
 * - Order: Đơn hàng áp dụng mã giảm giá
 * - User: Người tạo khuyến mãi (admin)
 *
 * SỬ DỤNG:
 * - Admin tạo mã khuyến mãi (VD: SALE20, FREESHIP)
 * - Staff nhập mã khi tạo đơn hàng để giảm giá
 * - Hệ thống tự kiểm tra điều kiện (hạn dùng, số lần, đơn tối thiểu)
 */

const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
    {
        // ============================================================
        // THÔNG TIN MÃ KHUYẾN MÃI
        // ============================================================

        /**
         * MÃ KHUYẾN MÃI (duy nhất)
         * Ví dụ: "SALE20", "WELCOME50", "FREEBOBA"
         * Tự động chuyển thành chữ hoa khi lưu
         */
        code: {
            type: String,
            required: [true, 'Mã khuyến mãi là bắt buộc'],
            unique: true,
            uppercase: true,       // Tự động chuyển thành chữ hoa
            trim: true,
            minlength: [3, 'Mã khuyến mãi phải có ít nhất 3 ký tự'],
            maxlength: [20, 'Mã khuyến mãi không quá 20 ký tự'],
            match: [/^[A-Z0-9]+$/, 'Mã khuyến mãi chỉ chứa chữ cái và số (không dấu, không khoảng trắng)']
        },

        /**
         * TÊN CHƯƠNG TRÌNH KHUYẾN MÃI
         * Tên mô tả ngắn gọn cho nội bộ
         * Ví dụ: "Giảm 20% mừng khai trương"
         */
        name: {
            type: String,
            required: [true, 'Tên khuyến mãi là bắt buộc'],
            trim: true,
            maxlength: [100, 'Tên khuyến mãi không quá 100 ký tự']
        },

        /**
         * MÔ TẢ CHI TIẾT
         * Mô tả đầy đủ về chương trình khuyến mãi
         */
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Mô tả không quá 500 ký tự'],
            default: ''
        },

        // ============================================================
        // LOẠI VÀ GIÁ TRỊ GIẢM GIÁ
        // ============================================================

        /**
         * LOẠI KHUYẾN MÃI
         * - percent: Giảm theo phần trăm (VD: giảm 20%)
         * - fixed: Giảm số tiền cố định (VD: giảm 10,000đ)
         */
        type: {
            type: String,
            enum: {
                values: ['percent', 'fixed'],
                message: 'Loại khuyến mãi phải là "percent" (phần trăm) hoặc "fixed" (cố định)'
            },
            required: [true, 'Loại khuyến mãi là bắt buộc'],
            default: 'percent'
        },

        /**
         * GIÁ TRỊ GIẢM GIÁ
         * - Nếu type = "percent": giá trị từ 1 đến 100 (%)
         * - Nếu type = "fixed": số tiền giảm (VND), VD: 10000
         */
        value: {
            type: Number,
            required: [true, 'Giá trị giảm giá là bắt buộc'],
            min: [1, 'Giá trị giảm phải lớn hơn 0']
        },

        // ============================================================
        // ĐIỀU KIỆN ÁP DỤNG
        // ============================================================

        /**
         * ĐƠN HÀNG TỐI THIỂU
         * Giá trị đơn hàng tối thiểu để được áp dụng mã
         * Ví dụ: 50000 → đơn phải >= 50,000đ mới dùng được
         * Mặc định: 0 (không giới hạn)
         */
        minOrderAmount: {
            type: Number,
            default: 0,
            min: [0, 'Giá trị đơn tối thiểu không được âm']
        },

        /**
         * GIẢM TỐI ĐA (áp dụng cho loại "percent")
         * Giới hạn số tiền giảm tối đa
         * Ví dụ: giảm 50% nhưng tối đa 100,000đ
         * Mặc định: 0 (không giới hạn)
         */
        maxDiscount: {
            type: Number,
            default: 0,
            min: [0, 'Giảm tối đa không được âm']
        },

        // ============================================================
        // THỜI GIAN HIỆU LỰC
        // ============================================================

        /**
         * NGÀY BẮT ĐẦU — Thời gian bắt đầu có hiệu lực
         */
        startDate: {
            type: Date,
            required: [true, 'Ngày bắt đầu là bắt buộc']
        },

        /**
         * NGÀY KẾT THÚC — Thời gian hết hiệu lực
         */
        endDate: {
            type: Date,
            required: [true, 'Ngày kết thúc là bắt buộc']
        },

        // ============================================================
        // GIỚI HẠN SỬ DỤNG
        // ============================================================

        /**
         * SỐ LẦN SỬ DỤNG TỐI ĐA
         * 0 = không giới hạn
         * Ví dụ: 100 → chỉ dùng được 100 lần
         */
        usageLimit: {
            type: Number,
            default: 0,
            min: [0, 'Số lần sử dụng tối đa không được âm']
        },

        /**
         * SỐ LẦN ĐÃ SỬ DỤNG
         * Tự động tăng mỗi khi có đơn hàng áp dụng mã này
         */
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Số lần đã sử dụng không được âm']
        },

        // ============================================================
        // ÁP DỤNG CHO MÓN CỤ THỂ
        // ============================================================

        /**
         * DANH SÁCH MÓN ÁP DỤNG
         * - Mảng rỗng [] = áp dụng cho TẤT CẢ món
         * - Có giá trị = chỉ áp dụng cho các món được chọn
         */
        applicableItems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }],

        // ============================================================
        // TRẠNG THÁI
        // ============================================================

        /**
         * TRẠNG THÁI KÍCH HOẠT
         * true = đang hoạt động (có thể sử dụng)
         * false = đã tắt (không thể sử dụng dù còn hạn)
         */
        isActive: {
            type: Boolean,
            default: true
        },

        /**
         * ĐÁNH DẤU ĐÃ XÓA (Soft delete)
         * true = đã xóa (ẩn khỏi danh sách nhưng còn trong DB)
         */
        isDeleted: {
            type: Boolean,
            default: false,
            index: true          // Index để query nhanh
        },

        // ============================================================
        // THÔNG TIN NGƯỜI TẠO
        // ============================================================

        /**
         * ADMIN TẠO KHUYẾN MÃI
         * Liên kết với User model, chỉ admin mới tạo được
         */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
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

// Index cho tìm kiếm mã khuyến mãi nhanh
promotionSchema.index({ code: 1 });

// Index compound cho lọc theo trạng thái + thời gian
promotionSchema.index({ isActive: 1, isDeleted: 1, startDate: 1, endDate: 1 });

// ============================================================
// VIRTUAL: KIỂM TRA CÒN HIỆU LỰC KHÔNG
// ============================================================

/**
 * VIRTUAL: Kiểm tra khuyến mãi có đang trong thời gian hiệu lực
 * Kết hợp: isActive = true + thời gian hiện tại nằm trong [startDate, endDate]
 * + chưa vượt quá usageLimit
 */
promotionSchema.virtual('isValid').get(function () {
    const now = new Date();
    const withinDateRange = now >= this.startDate && now <= this.endDate;
    const withinUsageLimit = this.usageLimit === 0 || this.usedCount < this.usageLimit;
    return this.isActive && !this.isDeleted && withinDateRange && withinUsageLimit;
});

// ============================================================
// VIRTUAL: TÊN LOẠI KHUYẾN MÃI (tiếng Việt)
// ============================================================

promotionSchema.virtual('typeName').get(function () {
    const typeNames = {
        percent: 'Phần trăm',
        fixed: 'Cố định'
    };
    return typeNames[this.type] || this.type;
});

// ============================================================
// MIDDLEWARE: VALIDATE TRƯỚC KHI LƯU
// ============================================================

promotionSchema.pre('save', function (next) {
    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (this.endDate <= this.startDate) {
        return next(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
    }

    // Kiểm tra giá trị percent không quá 100%
    if (this.type === 'percent' && this.value > 100) {
        return next(new Error('Giá trị phần trăm không được vượt quá 100'));
    }

    next();
});

// ============================================================
// STATIC METHOD: TÍNH SỐ TIỀN GIẢM GIÁ
// ============================================================

/**
 * Tính số tiền giảm giá thực tế
 * @param {Number} orderAmount - Tổng giá trị đơn hàng
 * @returns {Number} Số tiền được giảm
 */
promotionSchema.methods.calculateDiscount = function (orderAmount) {
    let discount = 0;

    if (this.type === 'percent') {
        // Giảm theo phần trăm
        discount = (orderAmount * this.value) / 100;
        // Áp dụng giới hạn giảm tối đa (nếu có)
        if (this.maxDiscount > 0 && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else if (this.type === 'fixed') {
        // Giảm số tiền cố định
        discount = this.value;
    }

    // Không giảm quá giá trị đơn hàng
    return Math.min(discount, orderAmount);
};

// Kích hoạt virtual khi convert to JSON
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

// ============================================================
// EXPORT MODEL
// ============================================================

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
