/**
 * Model: Inventory (Nguyên liệu / Quản lý kho)
 *
 * MÔ TẢ:
 * Quản lý nguyên liệu và hàng tồn kho của quán cà phê.
 * Theo dõi số lượng tồn, cảnh báo khi sắp hết hàng,
 * và liên kết với các món ăn/đồ uống sử dụng nguyên liệu đó.
 *
 * LIÊN KẾT:
 * - Item: Mỗi nguyên liệu có thể được dùng trong nhiều món
 * - User: Người cập nhật tồn kho (staff/admin)
 *
 * SỬ DỤNG:
 * - Admin/Staff theo dõi nguyên liệu tồn kho
 * - Cảnh báo khi nguyên liệu xuống dưới mức tối thiểu
 * - Ghi nhận lịch sử nhập hàng
 * - Liên kết nguyên liệu với món ăn (biết món nào cần nguyên liệu gì)
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        // ============================================================
        // THÔNG TIN NGUYÊN LIỆU
        // ============================================================

        /**
         * TÊN NGUYÊN LIỆU
         * Ví dụ: "Cà phê hạt Robusta", "Sữa tươi", "Đường trắng", "Trân châu đen"
         */
        name: {
            type: String,
            required: [true, 'Tên nguyên liệu là bắt buộc'],
            trim: true,
            unique: true,
            maxlength: [100, 'Tên nguyên liệu không quá 100 ký tự']
        },

        /**
         * MÔ TẢ NGUYÊN LIỆU
         * Thông tin bổ sung về nguyên liệu
         */
        description: {
            type: String,
            trim: true,
            maxlength: [300, 'Mô tả không quá 300 ký tự'],
            default: ''
        },

        /**
         * DANH MỤC NGUYÊN LIỆU
         * Phân loại để dễ quản lý
         * - ingredient: Nguyên liệu chính (cà phê, sữa, trà)
         * - topping: Topping (trân châu, thạch, kem)
         * - packaging: Bao bì (ly, nắp, ống hút)
         * - other: Khác (khăn giấy, đường, muỗng)
         */
        category: {
            type: String,
            enum: {
                values: ['ingredient', 'topping', 'packaging', 'other'],
                message: 'Danh mục phải là: ingredient, topping, packaging, hoặc other'
            },
            default: 'ingredient'
        },

        // ============================================================
        // THÔNG TIN TỒN KHO
        // ============================================================

        /**
         * ĐƠN VỊ TÍNH
         * Ví dụ: "kg", "lít", "gói", "hộp", "cái", "túi"
         */
        unit: {
            type: String,
            required: [true, 'Đơn vị tính là bắt buộc'],
            trim: true,
            maxlength: [20, 'Đơn vị tính không quá 20 ký tự']
        },

        /**
         * SỐ LƯỢNG TỒN KHO HIỆN TẠI
         * Số lượng nguyên liệu còn trong kho
         */
        quantity: {
            type: Number,
            required: [true, 'Số lượng tồn kho là bắt buộc'],
            min: [0, 'Số lượng tồn kho không được âm'],
            default: 0
        },

        /**
         * SỐ LƯỢNG TỐI THIỂU (Ngưỡng cảnh báo)
         * Khi quantity <= minQuantity → hiển thị cảnh báo "Sắp hết hàng"
         * Ví dụ: cà phê hạt minQuantity = 5 (kg) → dưới 5kg sẽ cảnh báo
         */
        minQuantity: {
            type: Number,
            default: 10,
            min: [0, 'Số lượng tối thiểu không được âm']
        },

        // ============================================================
        // THÔNG TIN GIÁ CẢ
        // ============================================================

        /**
         * GIÁ NHẬP (VND / đơn vị)
         * Giá mua vào của nguyên liệu
         * Ví dụ: Cà phê hạt 150,000đ/kg
         */
        price: {
            type: Number,
            default: 0,
            min: [0, 'Giá nhập không được âm']
        },

        /**
         * NHÀ CUNG CẤP
         * Tên nhà cung cấp nguyên liệu
         * Ví dụ: "Công ty TNHH Cà phê Trung Nguyên", "Vinamilk"
         */
        supplier: {
            type: String,
            trim: true,
            maxlength: [200, 'Tên nhà cung cấp không quá 200 ký tự'],
            default: ''
        },

        // ============================================================
        // LỊCH SỬ NHẬP HÀNG
        // ============================================================

        /**
         * NGÀY NHẬP HÀNG GẦN NHẤT
         * Tự động cập nhật khi nhập thêm nguyên liệu
         */
        lastRestocked: {
            type: Date,
            default: null
        },

        /**
         * LỊCH SỬ NHẬP HÀNG (mảng các lần nhập)
         * Ghi nhận từng lần nhập hàng: số lượng, giá, ngày, người nhập
         */
        restockHistory: [{
            /** Số lượng nhập thêm */
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Số lượng nhập phải lớn hơn 0']
            },
            /** Giá nhập tại thời điểm đó */
            price: {
                type: Number,
                default: 0
            },
            /** Ngày nhập hàng */
            date: {
                type: Date,
                default: Date.now
            },
            /** Người nhập hàng (ref → User) */
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            /** Ghi chú khi nhập hàng */
            note: {
                type: String,
                trim: true,
                maxlength: [200, 'Ghi chú nhập hàng không quá 200 ký tự'],
                default: ''
            }
        }],

        // ============================================================
        // LIÊN KẾT VỚI MÓN ĂN
        // ============================================================

        /**
         * CÁC MÓN SỬ DỤNG NGUYÊN LIỆU NÀY
         * Mảng tham chiếu đến Item model
         * Ví dụ: "Cà phê hạt" được dùng trong "Cà phê đen", "Cappuccino", "Latte"
         */
        relatedItems: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item'
        }],

        // ============================================================
        // TRẠNG THÁI
        // ============================================================

        /**
         * TRẠNG THÁI NGUYÊN LIỆU
         * - in_stock: Còn hàng (quantity > minQuantity)
         * - low_stock: Sắp hết (quantity <= minQuantity && quantity > 0)
         * - out_of_stock: Hết hàng (quantity = 0)
         */
        status: {
            type: String,
            enum: {
                values: ['in_stock', 'low_stock', 'out_of_stock'],
                message: 'Trạng thái phải là: in_stock, low_stock, hoặc out_of_stock'
            },
            default: 'in_stock'
        },

        /**
         * ĐÁNH DẤU ĐÃ XÓA (Soft delete)
         */
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },

        // ============================================================
        // THÔNG TIN NGƯỜI CẬP NHẬT
        // ============================================================

        /**
         * NGƯỜI CẬP NHẬT GẦN NHẤT
         * Liên kết với User model
         */
        updatedBy: {
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

// Index tìm kiếm theo tên
inventorySchema.index({ name: 1 });

// Index compound cho lọc theo danh mục + trạng thái
inventorySchema.index({ category: 1, status: 1, isDeleted: 1 });

// Index cho query nguyên liệu sắp hết
inventorySchema.index({ quantity: 1, minQuantity: 1 });

// ============================================================
// VIRTUAL: KIỂM TRA CÒN ĐỦ HÀNG KHÔNG
// ============================================================

/**
 * VIRTUAL: Kiểm tra nguyên liệu có đang ở mức thấp
 * true nếu quantity <= minQuantity
 */
inventorySchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.minQuantity && this.quantity > 0;
});

/**
 * VIRTUAL: Kiểm tra hết hàng
 * true nếu quantity = 0
 */
inventorySchema.virtual('isOutOfStock').get(function () {
    return this.quantity === 0;
});

/**
 * VIRTUAL: Tên danh mục tiếng Việt
 */
inventorySchema.virtual('categoryName').get(function () {
    const categoryNames = {
        ingredient: 'Nguyên liệu',
        topping: 'Topping',
        packaging: 'Bao bì',
        other: 'Khác'
    };
    return categoryNames[this.category] || this.category;
});

/**
 * VIRTUAL: Tên trạng thái tiếng Việt
 */
inventorySchema.virtual('statusName').get(function () {
    const statusNames = {
        in_stock: 'Còn hàng',
        low_stock: 'Sắp hết',
        out_of_stock: 'Hết hàng'
    };
    return statusNames[this.status] || this.status;
});

// ============================================================
// MIDDLEWARE: TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI TRƯỚC KHI LƯU
// ============================================================

/**
 * PRE-SAVE MIDDLEWARE
 * Tự động cập nhật trường status dựa trên quantity và minQuantity
 */
inventorySchema.pre('save', function (next) {
    // Tự động cập nhật trạng thái dựa trên số lượng tồn kho
    if (this.quantity === 0) {
        this.status = 'out_of_stock';
    } else if (this.quantity <= this.minQuantity) {
        this.status = 'low_stock';
    } else {
        this.status = 'in_stock';
    }
    next();
});

// ============================================================
// STATIC METHOD: LẤY NGUYÊN LIỆU SẮP HẾT
// ============================================================

/**
 * Lấy danh sách nguyên liệu đang ở mức thấp hoặc hết hàng
 * Dùng để hiển thị cảnh báo trên dashboard
 * @returns {Promise<Array>} Danh sách nguyên liệu cần nhập thêm
 */
inventorySchema.statics.getLowStockItems = function () {
    return this.find({
        isDeleted: false,
        $or: [
            { status: 'low_stock' },
            { status: 'out_of_stock' }
        ]
    }).sort({ quantity: 1 }); // Ít nhất lên đầu
};

/**
 * Thống kê tổng quan kho hàng
 * @returns {Promise<Object>} Số liệu thống kê
 */
inventorySchema.statics.getInventoryStats = async function () {
    const stats = await this.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format kết quả
    const result = {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    };

    stats.forEach(item => {
        result.total += item.count;
        if (item._id === 'in_stock') result.inStock = item.count;
        if (item._id === 'low_stock') result.lowStock = item.count;
        if (item._id === 'out_of_stock') result.outOfStock = item.count;
    });

    return result;
};

// Kích hoạt virtual khi convert to JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

// ============================================================
// EXPORT MODEL
// ============================================================

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
