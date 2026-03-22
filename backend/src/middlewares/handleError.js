const handleError = (err, req, res, next) => {
  // Lấy statusCode từ error object, mặc định là 500
  const statusCode = err.statusCode || err.status || 500;

  // Log lỗi ra console (chỉ trong development)
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ Error [${statusCode}]:`, err.message);
    if (err.stack) console.error(err.stack);
  }

  return res.status(statusCode).json({
    status: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err }),
  });
};

module.exports = handleError;
