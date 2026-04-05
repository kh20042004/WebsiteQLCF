/**
 * File: utils/uploadHandler.js
 * 
 * Nhiệm vụ: Cấu hình Multer để nhận file upload từ client
 * 
 * ⚠️ QUAN TRỌNG: 
 * - Dùng memoryStorage thay vì diskStorage để KHÔNG lưu file vào ổ cứng
 * - File chỉ lưu tạm trong RAM (req.file.buffer) và sẽ bị xóa sau khi upload lên Cloudinary
 * - Tránh tình trạng file local tồn đọng trong thư mục uploads/
 */

const multer = require("multer");

// ---- CẤU HÌNH STORAGE ----
// Sử dụng memoryStorage: file được lưu trong RAM dưới dạng Buffer
// Không ghi vào ổ cứng → Sau khi upload Cloudinary xong, file tự động bị giải phóng khỏi RAM
const storage = multer.memoryStorage();

// ---- FILTER KIỂM TRA ĐỊNH DẠNG FILE ----
// Chỉ cho phép upload file ảnh (mimetype bắt đầu bằng "image/")
// VD: image/jpeg, image/png, image/webp, image/gif
const filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        // File hợp lệ → cho phép upload
        cb(null, true);
    } else {
        // File không phải ảnh → từ chối và trả lỗi
        cb(new Error("Định dạng file không đúng. Vui lòng chỉ upload file ảnh!"));
    }
};

// ---- CẤU HÌNH MULTER ----
const multerConfig = {
    storage: storage,                  // Lưu file trong RAM (Buffer)
    limits: { 
        fileSize: 5 * 1024 * 1024      // Giới hạn kích thước file: 5MB
    },
    fileFilter: filterImage            // Chỉ cho phép ảnh
};

// ---- EXPORT CÁC MIDDLEWARE MULTER ----
module.exports = {
    // Middleware upload 1 ảnh với field name là "image"
    uploadSingle: multer(multerConfig).single('image'),
    
    // Middleware upload nhiều ảnh với field name là "images" (tối đa 10 ảnh)
    uploadMultiple: multer(multerConfig).array('images', 10),
    
    // Middleware upload 1 ảnh (tên cũ, giữ lại để tương thích)
    uploadImage: multer(multerConfig)
};
