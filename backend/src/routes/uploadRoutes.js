/**
 * Routes: uploadRoutes.js
 *
 * Định nghĩa các API endpoint cho chức năng upload và quản lý ảnh
 * Prefix: /api/upload (đã được khai báo trong app.js)
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ METHOD │ ENDPOINT              │ MÔ TẢ                          │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ POST   │ /api/upload/single    │ Upload 1 ảnh lên Cloudinary     │
 * │ POST   │ /api/upload/multiple  │ Upload nhiều ảnh cùng lúc       │
 * │ GET    │ /api/upload           │ Lấy danh sách ảnh (phân trang)  │
 * │ GET    │ /api/upload/:id       │ Lấy chi tiết 1 ảnh theo ID      │
 * │ DELETE │ /api/upload/:id       │ Xóa ảnh (Cloudinary + MongoDB)  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Bảo mật:
 * - Tất cả route đều yêu cầu xác thực JWT (middleware authenticate)
 * - Multer xử lý multipart/form-data trước khi vào controller
 *
 * Cách dùng (Postman / Frontend):
 * - Upload 1 ảnh   : POST /api/upload/single   — Body: form-data, key "image"
 * - Upload nhiều   : POST /api/upload/multiple — Body: form-data, key "images" (nhiều file)
 * - Xem danh sách  : GET  /api/upload?page=1&limit=20
 * - Xem chi tiết   : GET  /api/upload/:id
 * - Xóa ảnh        : DELETE /api/upload/:id
 */

const express = require('express');
const router = express.Router();

// ---- IMPORT MIDDLEWARE ----
const authenticate = require('../middlewares/authenticate'); // Xác thực JWT

// ---- IMPORT MULTER MIDDLEWARE ----
// uploadSingle : nhận 1 file, field name = "image"
// uploadMultiple: nhận nhiều file, field name = "images", tối đa 10 file
const { uploadSingle, uploadMultiple } = require('../config/multer');

// ---- IMPORT CONTROLLER ----
const {
  uploadSingleImage,
  uploadMultipleImages,
  getAllImages,
  getImageById,
  deleteImage,
} = require('../controllers/uploadController');


// ============================================================
// POST /api/upload/single
// Upload 1 ảnh lên Cloudinary
//
// Middleware thực thi theo thứ tự:
// 1. authenticate   — Kiểm tra JWT token hợp lệ
// 2. uploadSingle   — Multer nhận file từ form-data (field "image")
// 3. uploadSingleImage — Controller xử lý upload lên Cloudinary + lưu DB
//
// Cách gửi request (Postman):
// - Headers: Authorization: Bearer <token>
// - Body:    form-data → key: "image", value: [chọn file ảnh]
// ============================================================
router.post(
  '/single',
  authenticate,    // Bước 1: Xác thực token
  uploadSingle,    // Bước 2: Multer xử lý file upload
  uploadSingleImage // Bước 3: Upload lên Cloudinary + lưu DB
);


// ============================================================
// POST /api/upload/multiple
// Upload nhiều ảnh cùng lúc (tối đa 10 ảnh)
//
// Cách gửi request (Postman):
// - Headers: Authorization: Bearer <token>
// - Body:    form-data → key: "images" (chọn nhiều file, type: File)
// ============================================================
router.post(
  '/multiple',
  authenticate,         // Bước 1: Xác thực token
  uploadMultiple,       // Bước 2: Multer nhận nhiều file
  uploadMultipleImages  // Bước 3: Upload tất cả lên Cloudinary + lưu DB
);


// ============================================================
// GET /api/upload
// Lấy danh sách tất cả ảnh đã upload (có phân trang)
//
// Query params:
// - ?page=1       → Trang cần xem (mặc định: 1)
// - ?limit=20     → Số ảnh mỗi trang (mặc định: 20, tối đa: 50)
// - ?folder=...   → Lọc theo thư mục Cloudinary (không bắt buộc)
//
// Ví dụ: GET /api/upload?page=2&limit=10&folder=coffee-shop/products
// ============================================================
router.get(
  '/',
  authenticate,  // Yêu cầu đăng nhập
  getAllImages    // Lấy danh sách ảnh
);


// ============================================================
// GET /api/upload/:id
// Lấy thông tin chi tiết 1 ảnh theo MongoDB _id
//
// Ví dụ: GET /api/upload/64f1a2b3c4d5e6f7a8b9c0d1
// ============================================================
router.get(
  '/:id',
  authenticate,  // Yêu cầu đăng nhập
  getImageById   // Lấy chi tiết ảnh
);


// ============================================================
// DELETE /api/upload/:id
// Xóa ảnh theo MongoDB _id
// → Xóa trên Cloudinary + xóa bản ghi trong MongoDB
//
// Ví dụ: DELETE /api/upload/64f1a2b3c4d5e6f7a8b9c0d1
// ============================================================
router.delete(
  '/:id',
  authenticate,  // Yêu cầu đăng nhập
  deleteImage    // Xóa ảnh
);


module.exports = router;
