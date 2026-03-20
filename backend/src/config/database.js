/**
 * Cấu hình kết nối MongoDB
 * - Sử dụng Mongoose để quản lý kết nối
 * - Lấy URI từ .env
 */

const mongoose = require('mongoose');

// Hàm kết nối database
const connectDB = async () => {
  try {
    // Kết nối đến MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB kết nối thành công');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
    // Thoát chương trình nếu không kết nối được
    process.exit(1);
  }
};

module.exports = connectDB;
