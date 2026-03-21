/**
 * ========================================
 * ERROR HANDLING MIDDLEWARE
 * ========================================
 * 
 * Middleware global để xử lý tất cả các lỗi trong ứng dụng
 * PHẢI ĐẶT Ở CUỐI CÙNG TRONG app.use()
 * 
 * Cách hoạt động:
 * 1. Bắt tất cả các lỗi từ route/controller
 * 2. Format lỗi thành JSON response
 * 3. Trả về HTTP status code thích hợp
 * 
 * Cách sử dụng:
 * - Throw exception ở controller: throw new BadRequestException('message')
 * - Hoặc call next(error) ở các middleware
 * - Middleware này sẽ tự động catch và xử lý
 */

const { AppException } = require('../exceptions');

/**
 * Middleware xử lý lỗi
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * Lưu ý: Phải có đủ 4 tham số để Express nhận diện đây là error middleware
 */
const handleError = (err, req, res, next) => {
  // ---- DEFAULT VALUES ----
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi server không xác định';
  let status = err.status || 'error';

  // ---- XỬ LÝ MONGOOSE VALIDATION ERROR ----
  // Khi validation schema Mongoose fail
  if (err.name === 'ValidationError') {
    statusCode = 400;
    status = 'fail';

    // Lấy message từ validation error
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(', ');
  }

  // ---- XỬ LÝ MONGOOSE DUPLICATE KEY ERROR ----
  // Khi có duplicate unique field (ví dụ: email đã tồn tại)
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    status = 'fail';

    // Lấy tên field bị duplicate
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} này đã tồn tại`;
  }

  // ---- XỬ LÝ JWT ERROR ----
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Token không hợp lệ';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Token đã hết hạn';
  }

  // ---- LOG LỖI (CHỈ SAU NÀY THÊM) ----
  // Có thể log lỗi ra console hoặc file log
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Lỗi:', {
      statusCode,
      message,
      stack: err.stack,
    });
  }

  // ---- RESPONSE LỖI ----
  res.status(statusCode).json({
    status,
    message,
    // Chỉ include error details nếu là development
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
};

module.exports = handleError;
