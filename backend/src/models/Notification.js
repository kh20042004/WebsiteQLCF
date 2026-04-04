/**
 * Model: Notification.js
 * 
 * Schema MongoDB cho hệ thống thông báo
 * 
 * TÍNH NĂNG:
 * - Lưu trữ các thông báo realtime cho users
 * - Phân loại thông báo theo type (success, warning, error, info)
 * - Theo dõi trạng thái đọc/chưa đọc
 * - Hỗ trợ gửi thông báo cho user cụ thể hoặc tất cả
 * 
 * SỬ DỤNG:
 * - Thông báo đơn hàng mới cho admin
 * - Thông báo cập nhật món ăn
 * - Thông báo hệ thống maintenance
 * - Thông báo khuyến mãi, sự kiện
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // ---- THÔNG TIN CƠ BẢN ----
    title: {
        type: String,
        required: [true, 'Tiêu đề thông báo không được để trống'],
        maxlength: [100, 'Tiêu đề không được vượt quá 100 ký tự'],
        trim: true
    },
    
    message: {
        type: String,
        required: [true, 'Nội dung thông báo không được để trống'],
        maxlength: [500, 'Nội dung không được vượt quá 500 ký tự'],
        trim: true
    },

    // ---- PHÂN LOẠI THÔNG BÁO ----
    type: {
        type: String,
        enum: {
            values: ['success', 'warning', 'error', 'info', 'order', 'system'],
            message: 'Loại thông báo phải là: success, warning, error, info, order, hoặc system'
        },
        default: 'info'
    },

    // ---- NGƯỜI NHẬN ----
    // Nếu userId = null → thông báo cho tất cả users (broadcast)
    // Nếu userId có giá trị → thông báo riêng cho user đó
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true  // Index để query nhanh theo user
    },

    // ---- TRẠNG THÁI ----
    isRead: {
        type: Boolean,
        default: false,
        index: true  // Index để query thông báo chưa đọc
    },

    // Thời gian user đọc thông báo (null nếu chưa đọc)
    readAt: {
        type: Date,
        default: null
    },

    // ---- METADATA BỔ SUNG ----
    // Dữ liệu bổ sung (vd: orderId, itemId để link tới đối tượng liên quan)
    relatedData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },

    // URL để redirect khi click thông báo (optional)
    actionUrl: {
        type: String,
        default: null
    },

    // Icon hiển thị (CSS class hoặc URL)
    icon: {
        type: String,
        default: null
    },

    // ---- TÍNH NĂNG NÂNG CAO ----
    // Thời gian hết hạn (thông báo sẽ bị ẩn sau thời gian này)
    expiresAt: {
        type: Date,
        default: null
    },

    // Độ ưu tiên (1 = thấp, 5 = cao)
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },

    // ---- AUDIT TRAIL ----
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null  // null nếu tạo bởi hệ thống
    },

    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }

}, {
    timestamps: true,  // Tự động tạo createdAt, updatedAt
    collection: 'notifications'
});

// ---- INDEXES ĐỂ TỐI ƯU PERFORMANCE ----
// Index compound cho query thông báo của 1 user chưa đọc
notificationSchema.index({ userId: 1, isRead: 1, isDeleted: 1 });

// Index cho query thông báo theo thời gian (mới nhất trước)
notificationSchema.index({ createdAt: -1 });

// Index cho thông báo broadcast (userId = null)
notificationSchema.index({ userId: 1, type: 1, isDeleted: 1 });

// TTL index - tự động xóa thông báo hết hạn
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ---- VIRTUAL FIELDS ----
// Tính toán thời gian hiển thị (vd: "2 phút trước")
notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
});

// ---- STATIC METHODS ----
// Tạo thông báo hệ thống nhanh
notificationSchema.statics.createSystemNotification = function(title, message, type = 'info', userId = null) {
    return this.create({
        title,
        message,
        type,
        userId,
        createdBy: null,  // Tạo bởi hệ thống
        icon: 'fas fa-bell'
    });
};

// Lấy thông báo chưa đọc của user
notificationSchema.statics.getUnreadForUser = function(userId) {
    return this.find({
        $or: [
            { userId: userId },      // Thông báo riêng cho user
            { userId: null }         // Thông báo broadcast
        ],
        isRead: false,
        isDeleted: false
    }).sort({ createdAt: -1 });
};

// Đếm số thông báo chưa đọc
notificationSchema.statics.countUnreadForUser = function(userId) {
    return this.countDocuments({
        $or: [
            { userId: userId },
            { userId: null }
        ],
        isRead: false,
        isDeleted: false
    });
};

// ---- INSTANCE METHODS ----
// Đánh dấu đã đọc
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Soft delete
notificationSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

// ---- PRE-SAVE MIDDLEWARE ----
notificationSchema.pre('save', function(next) {
    // Tự động set readAt khi isRead = true
    if (this.isModified('isRead') && this.isRead && !this.readAt) {
        this.readAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Notification', notificationSchema);