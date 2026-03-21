/**
 * ========================================
 * AUTHENTICATION CONTROLLER
 * ========================================
 * 
 * Lõi logic xử lý các yêu cầu liên quan đến xác thực:
 * - POST /auth/register  → Tạo tài khoản mới
 * - POST /auth/login     → Xác thực người dùng, cấp token
 * - POST /auth/refresh   → Cấp token mới từ refresh token
 * - GET  /auth/profile   → Lấy thông tin cá nhân (yêu cầu AUTH)
 * - POST /auth/logout    → Đăng xuất
 * 
 * Flow xác thực:
 * 1. Register: User tạo tài khoản → Validate → Hash mật khẩu → Tạo token
 * 2. Login: User nhập email+pass → Verify → Tạo token
 * 3. Protected routes: Check token → Lấy user từ DB
 */

const User = require('../models/User');
const authService = require('../services/authService');
const { BadRequestException, UnauthorizedException } = require('../exceptions');

// ============================================
// FUNCTION 1: ĐĂNG KÝ TÀI KHOẢN MỚI (REGISTER)
// ============================================
/**
 * POST /auth/register
 * 
 * Request body:
 * {
 *   "name": "Nguyen Van A",
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "passwordConfirm": "password123"
 * }
 * 
 * Response (201):
 * {
 *   "status": "success",
 *   "message": "Đăng ký thành công",
 *   "data": {
 *     "id": "user_id",
 *     "name": "Nguyen Van A",
 *     "email": "user@example.com",
 *     "token": "jwt_token_here"
 *   }
 * }
 * 
 * Lỗi có thể:
 * - 400: Thiếu thông tin, mật khẩu không khớp
 * - 409: Email đã tồn tại
 */
exports.register = async (req, res, next) => {
  try {
    // Bước 1: Lấy dữ liệu từ body request
    const { name, email, password, passwordConfirm } = req.body;

    // Bước 2: Kiểm tra các field bắt buộc
    if (!name || !email || !password || !passwordConfirm) {
      return next(new BadRequestException('Vui lòng điền đầy đủ thông tin'));
    }

    // Bước 3: Kiểm tra password và passwordConfirm khớp nhau
    if (password !== passwordConfirm) {
      return next(new BadRequestException('Mật khẩu không khớp'));
    }

    // Bước 4: Kiểm tra email có tồn tại trong DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new BadRequestException('Email đã được đăng ký'));
    }

    // Bước 5: Tạo user mới trong DB
    // Middleware trong User.js sẽ tự động hash password
    const newUser = await User.create({
      name,
      email,
      password,
    });

    // Bước 6: Tạo JWT token cho user mới
    const token = authService.generateToken(newUser._id);

    // Bước 7: Trả response thành công
    res.status(201).json({
      status: 'success',
      message: 'Đăng ký thành công',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token,
      },
    });
  } catch (error) {
    // Nếu có lỗi (server error, DB error, etc), pass đến error handler
    next(error);
  }
};

// ============================================
// FUNCTION 2: ĐĂNG NHẬP (LOGIN)
// ============================================
/**
 * POST /auth/login
 * 
 * Xác thực người dùng bằng email + password
 * Trả về JWT token để sử dụng trong các request tiếp theo
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Response (200):
 * {
 *   "status": "success",
 *   "message": "Đăng nhập thành công",
 *   "data": {
 *     "id": "user_id",
 *     "name": "Nguyen Van A",
 *     "email": "user@example.com",
 *     "token": "jwt_token_here"
 *   }
 * }
 * 
 * Lỗi có thể:
 * - 400: Thiếu email hoặc password
 * - 401: Email không tồn tại hoặc password sai
 */
exports.login = async (req, res, next) => {
  try {
    // Bước 1: Lấy email và password từ body request
    const { email, password } = req.body;

    // Bước 2: Kiểm tra email và password không rỗng
    if (!email || !password) {
      return next(new BadRequestException('Vui lòng nhập email và mật khẩu'));
    }

    // Bước 3: Tìm user trong DB bằng email
    // .select('+password') để lấy field password (mặc định không trả về)
    const user = await User.findOne({ email }).select('+password');
    
    // Nếu không tìm thấy user
    if (!user) {
      return next(new UnauthorizedException('Email hoặc mật khẩu không chính xác'));
    }

    // Bước 4: So sánh password nhập vào với password trong DB
    // comparePassword() là method của Mongoose schema
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new UnauthorizedException('Email hoặc mật khẩu không chính xác'));
    }

    // Bước 5: Tạo JWT token
    const token = authService.generateToken(user._id);

    // Bước 6: Trả response thành công
    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// FUNCTION 3: LẤY TOKEN MỚI (REFRESH TOKEN)
// ============================================
/**
 * POST /auth/refresh
 * 
 * Dùng refresh token cũ để cấp access token mới
 * Thường dùng khi access token hết hạn
 * 
 * Request body:
 * {
 *   "refreshToken": "jwt_refresh_token_here"
 * }
 * 
 * Response (200):
 * {
 *   "status": "success",
 *   "data": {
 *     "token": "new_jwt_token_here"
 *   }
 * }
 * 
 * Lỗi có thể:
 * - 400: Thiếu refreshToken
 * - 401: Refresh token không hợp lệ
 */
exports.refreshToken = async (req, res, next) => {
  try {
    // Bước 1: Lấy refresh token từ body
    const { refreshToken } = req.body;

    // Bước 2: Kiểm tra refresh token có tồn tại
    if (!refreshToken) {
      return next(new BadRequestException('Refresh token là bắt buộc'));
    }

    // Bước 3: Verify refresh token
    const decoded = authService.verifyToken(refreshToken);
    
    // Nếu token không hợp lệ hoặc hết hạn
    if (!decoded || !decoded.id) {
      return next(new UnauthorizedException('Refresh token không hợp lệ'));
    }

    // Bước 4: Tạo access token mới
    const newToken = authService.generateToken(decoded.id);

    // Bước 5: Trả response
    res.status(200).json({
      status: 'success',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// FUNCTION 4: LẤY THÔNG TIN NGƯỜI DÙNG (PROTECTED)
// ============================================
/**
 * GET /auth/profile
 * 
 * Lấy thông tin cá nhân của người dùng hiện tại
 * YÊUẦU CẦU: Phải có JWT token hợp lệ trong header Authorization
 * 
 * Request header:
 * Authorization: Bearer <jwt_token_here>
 * 
 * Response (200):
 * {
 *   "status": "success",
 *   "data": {
 *     "id": "user_id",
 *     "name": "Nguyen Van A",
 *     "email": "user@example.com"
 *   }
 * }
 * 
 * Lỗi có thể:
 * - 401: Không có token hoặc token không hợp lệ
 * - 404: Người dùng không tồn tại
 * 
 * Cách hoạt động:
 * - Middleware authenticate sẽ verify token trước
 * - Lấy user ID từ token và lưu vào req.user.id
 * - Controller sẽ lấy user từ DB
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user.id được set bởi middleware authenticate
    const userId = req.user.id;

    // Tìm user trong DB
    const user = await User.findById(userId);

    // Kiểm tra user có tồn tại
    if (!user) {
      return next(new UnauthorizedException('Người dùng không tồn tại'));
    }

    // Trả response thành công
    res.status(200).json({
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// FUNCTION 5: ĐĂNG XUẤT (LOGOUT)
// ============================================
/**
 * POST /auth/logout
 * 
 * Đăng xuất người dùng
 * YÊUẦU CẦU: Phải có JWT token hợp lệ
 * 
 * Request header:
 * Authorization: Bearer <jwt_token_here>
 * 
 * Response (200):
 * {
 *   "status": "success",
 *   "message": "Đăng xuất thành công"
 * }
 * 
 * Lưu ý:
 * - Backend không lưu "blacklist" token (để đơn giản)
 * - Frontend tự xóa token khỏi localStorage
 * - Nếu cần, có thể implement token blacklist sau
 */
exports.logout = async (req, res, next) => {
  try {
    // Trả response thành công
    res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    next(error);
  }
};
