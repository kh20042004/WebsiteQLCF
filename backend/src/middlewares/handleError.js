/**
 * Middleware: Xử lý lỗi chung
 * - Bắt tất cả lỗi từ các route
 * - Trả về response có format thống nhất
 * 
 * Lưu ý: Middleware này phải được dùng CUỐI CÙNG trong app.use()
 */

const handleError = (err, req, res, next) => {
  // Lấy status code từ lỗi, mặc định 500
  const status = err.status || 500;

  // Lấy message từ lỗi
  const message = err.message || 'Có lỗi xảy ra';

  // Trả về response với error
  res.status(status).json({
    status: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {}, // Chỉ show chi tiết lỗi ở dev mode
  });
};

module.exports = handleError;
