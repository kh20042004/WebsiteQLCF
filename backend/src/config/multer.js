const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Cấu hình Multer để lưu trữ ảnh sản phẩm
 */

// Đảm bảo thư mục 'uploads' tồn tại
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình kho lưu trữ (Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất bằng timestamp + tên gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Bộ lọc file (Chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh (.jpg, .jpeg, .png, .webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: fileFilter
});

// ---- NAMED EXPORTS (tương thích với cả cách dùng cũ và mới) ----

// uploadSingle: nhận 1 ảnh, field name = "image"
// Dùng trong: itemRoutes (tạo/sửa món), uploadRoutes (upload ảnh đơn)
const uploadSingle = upload.single('image');

// uploadMultiple: nhận nhiều ảnh, field name = "images", tối đa 10 file
// Dùng trong: uploadRoutes (upload nhiều ảnh cùng lúc)
const uploadMultiple = upload.array('images', 10);

// Default export: tương thích ngược (ai đang dùng `upload.single()` trực tiếp)
module.exports = upload;

// Named exports: cho các file import theo dạng { uploadSingle }
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
