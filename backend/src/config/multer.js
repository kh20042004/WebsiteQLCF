/**
 * File: config/multer.js (cập nhật)
 *
 * Nhiệm vụ:
 * - Cấu hình Multer để nhận file upload từ client (multipart/form-data)
 * - Dùng memoryStorage (lưu tạm vào RAM) thay vì diskStorage
 *   → Lý do: Upload trực tiếp lên Cloudinary bằng stream, không cần lưu disk
 *
 * Gồm 2 instance multer:
 * - uploadSingle  : Upload 1 ảnh (field name: "image")
 * - uploadMultiple: Upload nhiều ảnh cùng lúc (tối đa 10 ảnh, field name: "images")
 *
 * Giới hạn:
 * - Chỉ chấp nhận ảnh: jpg, jpeg, png, webp, gif
 * - Mỗi file tối đa 10MB
 */

const multer = require('multer');
const path = require('path');

// ---- BỘ LỌC FILE (FileFilter) ----
// Chỉ cho phép các định dạng ảnh hợp lệ
const fileFilter = (req, file, cb) => {
  // Danh sách định dạng được phép
  const allowedTypes = /jpeg|jpg|png|webp|gif/;

  // Kiểm tra extension của file
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Kiểm tra mimetype (loại MIME thực sự của file)
  const mimetype = allowedTypes.test(file.mimetype);

  // Chỉ accept khi cả 2 đều hợp lệ (tránh đổi tên file để bypass)
  if (extname && mimetype) {
    return cb(null, true); // Chấp nhận file
  } else {
    cb(
      new Error(
        'Chỉ chấp nhận file hình ảnh: .jpg, .jpeg, .png, .webp, .gif'
      )
    );
  }
};

// ---- MEMORY STORAGE ----
// Lưu ảnh vào bộ nhớ RAM tạm thời (buffer)
// Sau đó stream trực tiếp lên Cloudinary, không tốn dung lượng ổ cứng server
const memoryStorage = multer.memoryStorage();

// ---- CẤU HÌNH MULTER CHUNG ----
const multerConfig = {
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn 10MB mỗi file
  },
  fileFilter: fileFilter,
};

// ---- EXPORT CÁC INSTANCE MULTER ----

// Upload 1 ảnh duy nhất — field name phải là "image"
// Dùng cho: upload ảnh sản phẩm, avatar...
const uploadSingle = multer(multerConfig).single('image');

// Upload nhiều ảnh cùng lúc — field name phải là "images", tối đa 10 file
// Dùng cho: upload gallery, nhiều ảnh cùng lúc
const uploadMultiple = multer(multerConfig).array('images', 10);

module.exports = {
  uploadSingle,
  uploadMultiple,
  multerConfig,
};
