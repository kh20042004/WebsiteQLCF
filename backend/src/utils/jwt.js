/**
 * Utility: Quản lý JWT Token
 * - Tạo token khi đăng nhập
 * - Xác thực token
 */

const jwt = require('jsonwebtoken');

/**
 * Tạo JWT Token
 * @param {string} userId - ID người dùng
 * @returns {string} - JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // Token hết hạn sau 7 ngày
    }
  );
};

/**
 * Xác thực JWT Token
 * @param {string} token - JWT Token
 * @returns {object} - Dữ liệu trong token (id, iat, exp)
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token không hợp lệ');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
