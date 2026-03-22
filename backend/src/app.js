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
const orderRoutes = require('./routes/orderRoutes');

// ---- IMPORT ROUTES ----
const tableRoutes = require('./routes/tableRoutes');

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

app.use('/api/orders', orderRoutes);


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

// ---- SỬ DỤNG ROUTES ----
// Import routes
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const reportRoutes = require('./routes/reportRoutes');

// ---- SETUP API ROUTES (PREFIX /api) ----
// Tất cả API routes đều có prefix /api
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reports', reportRoutes);


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
