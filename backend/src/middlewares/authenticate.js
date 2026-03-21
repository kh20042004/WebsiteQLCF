/**
 * ========================================
 * AUTHENTICATE MIDDLEWARE
 * ========================================
 * 
 * Middleware để xác thực JWT token từ header request
 * Được sử dụng để bảo vệ các protected routes
 * 
 * Cơ chế hoạt động:
 * 1. Lấy token từ header Authorization (Bearer xxx)
 * 2. Verify token bằng JWT secret
 * 3. Nếu hợp lệ: Lưu user ID vào req.user để sử dụng ở controller
 * 4. Nếu không hợp lệ: Trả lỗi 401 Unauthorized
 * 
 * Cách sử dụng trong route:
 * router.get('/profile', authenticate, authController.getProfile);
 */

const { UnauthorizedException } = require('../exceptions');
const authService = require('../services/authService');

/**
 * Middleware xác thực token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * 
 * Luồng xử lý:
 * - req.headers.authorization = "Bearer token_here"
 * - Khi verify token thành công, req.user = { id: userId }
 */
const authenticate = (req, res, next) => {
  try {
    // ---- BƯỚC 1: LẤY TOKEN TỪ HEADER ----
    // Authorization header format: "Bearer xxx"
    const authHeader = req.headers.authorization;

    // Kiểm tra xem header có tồn tại không
    if (!authHeader) {
      return next(new UnauthorizedException('Vui lòng cung cấp token'));
    }

    // Kiểm tra xem header có "Bearer " prefix không
    if (!authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedException('Format token không hợp lệ'));
    }

    // Trích xuất token (bỏ "Bearer " prefix)
    const token = authHeader.slice(7); // Bỏ 7 ký tự "Bearer "

    // ---- BƯỚC 2: VERIFY TOKEN ----
    const decoded = authService.verifyToken(token);

    // Nếu verify fail (token không hợp lệ hoặc hết hạn)
    if (!decoded) {
      return next(new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn'));
    }

    // ---- BƯỚC 3: LƯU USER ID VÀO req.user ----
    // Để sử dụng ở controller: const userId = req.user.id;
    req.user = {
      id: decoded.id,
    };

    // ---- BƯỚC 4: CHUYỂN ĐẾN CONTROLLER TIẾP THEO ----
    next();
  } catch (error) {
    next(new UnauthorizedException('Lỗi xác thực token'));
  }
};

module.exports = authenticate;
