/**
 * File chính: Khởi tạo Express server
 *
 * Nhiệm vụ:
 * - Setup Express app
 * - Kết nối MongoDB
 * - Import và sử dụng các routes
 * - Setup middleware (CORS, JSON parser, error handler)
 *
 * QUAN TRỌNG: dotenv.config() phải được gọi ĐẦU TIÊN
 * trước khi require bất kỳ file nào sử dụng process.env
 * (Cloudinary config, Database config...)
 */

// ---- BƯỚC 1: LOAD BIẾN MÔI TRƯỜNG TỪ .env ----
// Phải là dòng đầu tiên trước tất cả require khác!
const dotenv = require('dotenv');
dotenv.config();

// ---- BƯỚC 2: IMPORT CÁC THƯ VIỆN ----
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// ---- BƯỚC 3: KHỞI TẠO CLOUDINARY (sau khi dotenv đã load xong) ----
// Cloudinary đọc process.env khi được require → phải sau dotenv.config()
require('./config/cloudinary');

// ---- BƯỚC 4: IMPORT ROUTES (sau khi Cloudinary sẵn sàng) ----
const authRoutes         = require('./routes/authRoutes');
const categoryRoutes     = require('./routes/categoryRoutes');
const itemRoutes         = require('./routes/itemRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const tableRoutes        = require('./routes/tableRoutes');
const reportRoutes       = require('./routes/reportRoutes');
const uploadRoutes       = require('./routes/uploadRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // ✨ Route thông báo
const paymentRoutes      = require('./routes/paymentRoutes');      // ✨ Route thanh toán
const promotionRoutes    = require('./routes/promotionRoutes');    // ✨ Route khuyến mãi
const inventoryRoutes    = require('./routes/inventoryRoutes');    // ✨ Route quản lý kho
const shiftRoutes        = require('./routes/shiftRoutes');        // ✨ Route ca làm việc

// ---- KHỞI TẠO EXPRESS APP ----
const app = express();

// ---- SETUP MIDDLEWARES ----
// Middleware: Cho phép requests từ các domain khác (CORS)
app.use(cors());

// Middleware: Parse JSON từ body request
app.use(express.json());

// Middleware: Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ---- SERVICE STATIC FILES (Ảnh sản phẩm lưu local - fallback) ----
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ---- KẾT NỐI DATABASE ----
connectDB();

// ---- ROUTE MẶC ĐỊNH ----
app.get('/', (req, res) => {
  res.json({
    message: '☕ Chào mừng đến API quản lý quán cà phê',
    version: '1.0.0',
  });
});

// ---- SETUP API ROUTES (PREFIX /api) ----
// Tất cả API routes đều có prefix /api
app.use('/api/auth',          authRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/tables',        tableRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/items',         itemRoutes);
app.use('/api/reports',       reportRoutes);
app.use('/api/upload',        uploadRoutes);     // Route upload ảnh Cloudinary
app.use('/api/notifications', notificationRoutes); // ✨ Route hệ thống thông báo
app.use('/api/payments',      paymentRoutes);      // ✨ Route thanh toán
app.use('/api/promotions',    promotionRoutes);    // ✨ Route khuyến mãi/mã giảm giá
app.use('/api/inventory',     inventoryRoutes);    // ✨ Route quản lý nguyên liệu/kho
app.use('/api/shifts',        shiftRoutes);        // ✨ Route ca làm việc/chấm công


// ---- HANDLE 404 - ROUTE KHÔNG TỒN TẠI ----
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Route không tồn tại',
  });
});


// ---- GLOBAL ERROR HANDLER ----
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ [${statusCode}] ${err.message}`);
  res.status(statusCode).json({
    status: false,
    message: err.message || 'Lỗi server',
  });
});


// ---- KHỞI ĐỘNG SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
