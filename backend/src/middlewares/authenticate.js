/**
 * Middleware: Xác thực JWT Token
 * - Kiểm tra token trong header Authorization
 * - Nếu token hợp lệ, lưu userId vào req.userId
 * - Nếu không có token hoặc token không hợp lệ, trả về lỗi 401
 */

const { verifyToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    // Format: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    // Kiểm tra nếu không có token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'Vui lòng cung cấp token',
      });
    }

    // Tách token từ header (bỏ "Bearer " ở đầu)
    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = verifyToken(token);

    // Lưu userId vào req để sử dụng ở các route sau này
    req.userId = decoded.id;

    // Chuyển tiếp đến middleware/route tiếp theo
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message || 'Token không hợp lệ',
    });
  }
};

module.exports = authenticate;
