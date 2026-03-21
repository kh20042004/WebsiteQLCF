/**
 * Middleware: handleValidation
 *
 * Nhiệm vụ: Kiểm tra kết quả validation từ express-validator
 * Nếu có lỗi thì trả về 422, ngược lại thì cho request đi tiếp
 */

const { validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = handleValidation;
