/**
 * Model: Review
 * 
 * Mô tả: Quản lý đánh giá và bình luận từ khách hàng
 * - Đánh giá (1-5 sao) cho các món ăn/đồ uống
 * - Bình luận chi tiết
 * - Quản trị viên có thể phê duyệt hoặc từ chối đánh giá
 * - Hỗ trợ trả lời từ shop (nhân viên/quản lý)
 * 
 * Fields:
 * - userId: ID người dùng/khách hàng viết review
 * - itemId: ID món ăn/đồ uống được review
 * - rating: Điểm đánh giá (1-5)
 * - comment: Nội dung bình luận chi tiết
 * - status: Trạng thái phê duyệt (pending, approved, rejected)
 * - reply: Trả lời từ shop
 * - replyBy: Người trả lời (admin/staff)
 * - replyAt: Thời gian trả lời
 * - createdAt: Thời gian tạo
 * - updatedAt: Thời gian cập nhật
 * 
 * Mối quan hệ:
 * - Một user có nhiều review
 * - Một item có nhiều review
 * - Một review thuộc một user và một item
 */

const mongoose = require('mongoose');

// Tạo schema cho Review
const reviewSchema = new mongoose.Schema(
  {
    // ============================================================
    // NGƯỜI ĐÁNH GIÁ
    // ============================================================
    // ID người dùng viết review (khách hàng, staff)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID người dùng là bắt buộc'],
    },

    // ============================================================
    // ĐỐI TƯỢNG ĐƯỢC ĐÁNH GIÁ
    // ============================================================
    // ID món ăn/đồ uống được review
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'ID món ăn là bắt buộc'],
    },

    // ============================================================
    // NỘI DUNG ĐÁNH GIÁ
    // ============================================================
    // Điểm số đánh giá (1-5 sao)
    rating: {
      type: Number,
      required: [true, 'Điểm đánh giá là bắt buộc'],
      min: [1, 'Điểm phải từ 1 sao trở lên'],
      max: [5, 'Điểm tối đa là 5 sao'],
    },

    // Nội dung bình luận chi tiết
    comment: {
      type: String,
      required: [true, 'Vui lòng nhập nhận xét'],
      trim: true,
      minlength: [10, 'Nhận xét phải ít nhất 10 ký tự'],
      maxlength: [1000, 'Nhận xét không được vượt quá 1000 ký tự'],
    },

    // ============================================================
    // QUẢN LÝ TRẠNG THÁI
    // ============================================================
    // Trạng thái phê duyệt của admin
    // - pending: Chờ phê duyệt
    // - approved: Được phê duyệt, hiển thị công khai
    // - rejected: Bị từ chối, không hiển thị
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Trạng thái phê duyệt không hợp lệ'
      },
      default: 'pending',
    },

    // ============================================================
    // PHẢN HỒI TỪ SHOP
    // ============================================================
    // Nội dung trả lời từ shop (admin/staff)
    reply: {
      type: String,
      default: null,
      maxlength: [500, 'Trả lời không được vượt quá 500 ký tự'],
    },

    // ID người trả lời (admin hoặc staff)
    replyBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Thời gian trả lời
    replyAt: {
      type: Date,
      default: null,
    },

    // ============================================================
    // THÔNG TIN THỐi GIAN
    // ============================================================
    // Tự động set bởi Mongoose
    // createdAt: Thời gian tạo review
    // updatedAt: Thời gian cập nhật review
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    collection: 'reviews',
  }
);

// ============================================================
// INDEX - Tối ưu hóa truy vấn
// ============================================================
// Index để tìm review nhanh của một user
reviewSchema.index({ userId: 1, createdAt: -1 });

// Index để tìm review của một item
reviewSchema.index({ itemId: 1, status: 1, createdAt: -1 });

// Index kết hợp để tìm review của user cho item cụ thể
reviewSchema.index({ userId: 1, itemId: 1 });

// ============================================================
// STATIC METHODS - Các phương thức class
// ============================================================

/**
 * Lấy đánh giá trung bình của một item
 * @param {ObjectId} itemId - ID của item
 * @returns {Promise<number>} - Điểm đánh giá trung bình
 */
reviewSchema.statics.getAverageRating = async function(itemId) {
  const result = await this.aggregate([
    {
      $match: {
        itemId: mongoose.Types.ObjectId(itemId),
        status: 'approved', // Chỉ tính những review được phê duyệt
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return result.length > 0
    ? {
        average: Math.round(result[0].averageRating * 10) / 10,
        total: result[0].totalReviews,
      }
    : { average: 0, total: 0 };
};

/**
 * Lấy danh sách review của user
 * @param {ObjectId} userId - ID user
 * @returns {Promise<Array>} - Danh sách review
 */
reviewSchema.statics.getReviewsByUser = function(userId) {
  return this.find({ userId })
    .populate('itemId', 'name image')
    .populate('userId', 'name email')
    .populate('replyBy', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Lấy danh sách review được phê duyệt của một item
 * @param {ObjectId} itemId - ID item
 * @returns {Promise<Array>} - Danh sách review
 */
reviewSchema.statics.getApprovedReviews = function(itemId) {
  return this.find({ itemId, status: 'approved' })
    .populate('userId', 'name')
    .populate('replyBy', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Đếm số review chưa phê duyệt (cho admin dashboard)
 * @returns {Promise<number>} - Số lượng review pending
 */
reviewSchema.statics.countPending = function() {
  return this.countDocuments({ status: 'pending' });
};

// ============================================================
// INSTANCE METHODS - Các phương thức instance
// ============================================================

/**
 * Phê duyệt review
 * @param {ObjectId} adminId - ID người phê duyệt
 * @returns {Promise<Object>} - Review đã cập nhật
 */
reviewSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Từ chối review
 * @param {ObjectId} adminId - ID người từ chối
 * @returns {Promise<Object>} - Review đã cập nhật
 */
reviewSchema.methods.reject = function(adminId) {
  this.status = 'rejected';
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Thêm trả lời từ shop
 * @param {string} replyText - Nội dung trả lời
 * @param {ObjectId} staffId - ID nhân viên trả lời
 * @returns {Promise<Object>} - Review đã cập nhật
 */
reviewSchema.methods.addReply = function(replyText, staffId) {
  this.reply = replyText;
  this.replyBy = staffId;
  this.replyAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

/**
 * Xóa trả lời từ shop
 * @returns {Promise<Object>} - Review đã cập nhật
 */
reviewSchema.methods.removeReply = function() {
  this.reply = null;
  this.replyBy = null;
  this.replyAt = null;
  this.updatedAt = new Date();
  return this.save();
};

// ============================================================
// HOOKS - Pre/Post middleware
// ============================================================

/**
 * Pre-save: Chuẩn bị trước khi lưu
 * - Trim các field text
 * - Validate dữ liệu
 */
reviewSchema.pre('save', function(next) {
  // Trim comment
  if (this.comment) {
    this.comment = this.comment.trim();
  }

  // Trim reply
  if (this.reply) {
    this.reply = this.reply.trim();
  }

  next();
});

// ============================================================
// Export Model
// ============================================================
module.exports = mongoose.model('Review', reviewSchema);
