/**
 * Model: Image (Ảnh đã upload)
 *
 * Nhiệm vụ:
 * - Lưu thông tin ảnh sau khi upload lên Cloudinary vào MongoDB
 * - Cho phép truy vấn, quản lý, xóa ảnh đã upload
 *
 * Fields:
 * - url        : Đường dẫn ảnh đầy đủ trên Cloudinary (dùng để hiển thị)
 * - publicId   : ID duy nhất trên Cloudinary (dùng để xóa ảnh trên cloud)
 * - originalName: Tên file gốc do người dùng upload (vd: "cafe.jpg")
 * - size        : Dung lượng file (bytes)
 * - width       : Chiều rộng ảnh (pixels)
 * - height      : Chiều cao ảnh (pixels)
 * - format      : Định dạng ảnh (jpg, png, webp...)
 * - folder      : Thư mục lưu trữ trên Cloudinary
 * - uploadedBy  : ID người dùng đã upload (ref → User)
 * - createdAt   : Thời gian upload (tự động bởi timestamps)
 */

const mongoose = require('mongoose');

// ---- ĐỊNH NGHĨA SCHEMA ----
const imageSchema = new mongoose.Schema(
  {
    // URL đầy đủ của ảnh trên Cloudinary — dùng để hiển thị trong <img src="">
    url: {
      type: String,
      required: [true, 'URL ảnh là bắt buộc'],
      trim: true,
    },

    // Public ID trên Cloudinary — cần để xóa ảnh khỏi cloud
    // Ví dụ: "coffee-shop/products/abc123"
    publicId: {
      type: String,
      required: [true, 'Public ID là bắt buộc'],
      trim: true,
    },

    // Tên file gốc do người dùng upload
    originalName: {
      type: String,
      trim: true,
      default: 'unknown',
    },

    // Dung lượng file tính bằng bytes
    size: {
      type: Number,
      default: 0,
    },

    // Chiều rộng ảnh (pixels) — lấy từ response của Cloudinary
    width: {
      type: Number,
      default: 0,
    },

    // Chiều cao ảnh (pixels) — lấy từ response của Cloudinary
    height: {
      type: Number,
      default: 0,
    },

    // Định dạng ảnh: jpg, png, webp, gif...
    format: {
      type: String,
      default: 'jpg',
    },

    // Thư mục lưu trữ trên Cloudinary (vd: "coffee-shop/products")
    folder: {
      type: String,
      default: 'coffee-shop',
    },

    // Người dùng đã upload ảnh này (không bắt buộc)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến model User
      default: null,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

// ---- INDEX ĐỂ TÌM KIẾM NHANH ----
imageSchema.index({ publicId: 1 });  // Tìm nhanh theo publicId khi xóa
imageSchema.index({ uploadedBy: 1 }); // Tìm ảnh theo người dùng

// ---- TẠO VÀ EXPORT MODEL ----
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
