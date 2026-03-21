/**
 * ========================================
 * AUTH SERVICE - Quản lý JWT Token
 * ========================================
 * 
 * Các hàm tiện ích liên quan đến token:
 * - Tạo JWT token mới
 * - Xác thực (verify) JWT token
 * - Giải mã token để lấy thông tin
 * 
 * Sử dụng thư viện: jsonwebtoken (jwt)
 */

const jwt = require('jsonwebtoken');

// ---- HẰNG SỐ ----
/**
 * Thời gian hết hạn của token
 * Kinh nghiệm: 
 * - Access token: 1 giờ (1h)
 * - Refresh token: 7 ngày (7d)
 */
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '24h'; // Có thể thay '1h' sau

// ---- HÀM TẠO TOKEN ----
/**
 * Tạo JWT token mới cho người dùng
 * 
 * @param {string} userId - ID của người dùng (từ MongoDB)
 * @returns {string} - JWT token
 * 
 * Cách sử dụng:
 * const token = generateToken(user._id);
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, // Payload (dữ liệu được mã hóa trong token)
    process.env.JWT_SECRET || 'your-secret-key', // Secret key để mã hóa
    { expiresIn: TOKEN_EXPIRES_IN } // Tùy chọn: hết hạn sau 24 giờ
  );
};

// ---- HÀM VERIFY TOKEN ----
/**
 * Kiểm tra xem token có hợp lệ không
 * 
 * @param {string} token - JWT token cần kiểm tra
 * @returns {object|null} - Nếu hợp lệ, return payload; nếu không return null
 * 
 * Cách sử dụng:
 * const decoded = verifyToken(token);
 * if (decoded) {
 *   console.log(decoded.id); // Lấy user ID từ token
 * }
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    return decoded;
  } catch (error) {
    // Token không hợp lệ hoặc đã hết hạn
    return null;
  }
};

// ---- HÀM DECODE TOKEN (không verify) ----
/**
 * Giải mã token mà không kiểm tra chữ ký
 * ⚠️ CẢNH BÁO: Chỉ dùng khi cần lấy thông tin, không dùng để xác thực
 * 
 * @param {string} token - JWT token
 * @returns {object} - Payload từ token
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

// ---- XUẤT CÁC HÀM ----
module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
