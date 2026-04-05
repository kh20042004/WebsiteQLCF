/**
 * File: config/cloudinary.js
 *
 * Nhiệm vụ:
 * - Cấu hình kết nối đến Cloudinary (dịch vụ lưu trữ ảnh đám mây)
 * - Sử dụng các biến môi trường từ file .env để bảo mật thông tin
 * - Export đối tượng cloudinary đã được cấu hình để dùng trong toàn hệ thống
 *
 * Cloudinary cung cấp:
 * - Lưu trữ ảnh miễn phí (25 GB free)
 * - Tự động tối ưu, resize, compress ảnh
 * - CDN phân phối ảnh toàn cầu tốc độ cao
 */

const cloudinary = require('cloudinary').v2;

// ---- CẤU HÌNH KẾT NỐI CLOUDINARY ----
// Sử dụng thông tin từ file .env (không hardcode để bảo mật)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Tên cloud (vd: dykzfyb4t)
  api_key: process.env.CLOUDINARY_API_KEY,       // API Key
  api_secret: process.env.CLOUDINARY_API_SECRET, // API Secret (bí mật, không public)
});

// Log để debug khi khởi động server
console.log('☁️  Cloudinary đã được cấu hình với cloud:', process.env.CLOUDINARY_CLOUD_NAME);

module.exports = cloudinary;
