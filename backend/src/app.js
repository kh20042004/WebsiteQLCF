/**
 * File chính: Khởi tạo Express server
 * 
 * Nhiệm vụ:
 * - Setup Express app
 * - Kết nối MongoDB
 * - Import và sử dụng các routes
 * - Setup middleware (CORS, JSON parser, error handler)
 */

// ---- IMPORT CÁC THƯ VIỆN ----
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// ---- LOAD BIẾN MÔI TRƯỜNG TỪ .env ----
dotenv.config();

// ---- KHỞI TẠO EXPRESS APP ----
const app = express();

// ---- SETUP MIDDLEWARES ----
// Middleware: Cho phép requests từ các domain khác (CORS)
app.use(cors());

// Middleware: Parse JSON từ body request
app.use(express.json());

// Middleware: Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ---- SERVICE STATIC FILES (Ảnh sản phẩm) ----
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// ---- KẾT NỐI DATABASE ----
connectDB();

// ---- ROUTE MẶC ĐỊNH ----
// GET /
app.get('/', (req, res) => {
  res.json({
    message: '☕ Chào mừng đến API quản lý quán cà phê',
    version: '1.0.0',
  });
});


// Import routes
//const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');

// Sử dụng routes
//app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', itemRoutes);
// Các routes khác sẽ được thêm vào đây (categories, items, tables, orders, etc.)

// ---- HANDLE 404 - ROUTE KHÔNG TỒN TẠI ----
app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: 'Route không tồn tại',
  });
});


// const handleError = require('./middlewares/handleError');
// app.use(handleError);

// ---- KHỞI ĐỘNG SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});
