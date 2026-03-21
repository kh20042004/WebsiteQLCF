/**
 * ========================================
 * AUTHENTICATION ROUTES
 * ========================================
 * 
 * Định nghĩa các route liên quan đến xác thực
 * Prefix: /auth (được định nghĩa ở app.js)
 * 
 * PUBLIC ROUTES (không cần token):
 * - POST   /auth/register - Đăng ký tài khoản mới
 * - POST   /auth/login    - Đăng nhập
 * - POST   /auth/refresh  - Cấp token mới từ refresh token
 * 
 * PROTECTED ROUTES (yêu cầu JWT token):
 * - GET    /auth/profile  - Lấy thông tin cá nhân
 * - POST   /auth/logout   - Đăng xuất
 * 
 * Cách sử dụng:
 * - GET http://localhost:3000/auth (route root)
 * - POST http://localhost:3000/auth/register
 * - POST http://localhost:3000/auth/login
 * - Etc.
 */

const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

// ---- TẠO ROUTER ----
const router = express.Router();

/**
 * ========================================
 * PUBLIC ROUTES (Không cần authentication)
 * ========================================
 */

/**
 * POST /auth/register
 * Đăng ký tài khoản mới
 * Body: { name, email, password, passwordConfirm }
 */
router.post('/register', authController.register);

/**
 * POST /auth/login
 * Đăng nhập
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * POST /auth/refresh
 * Cấp JWT token mới từ refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', authController.refreshToken);

/**
 * ========================================
 * PROTECTED ROUTES (Yêu cầu JWT token)
 * ========================================
 * 
 * Middleware authenticate sẽ:
 * 1. Kiểm tra header Authorization
 * 2. Verify JWT token
 * 3. Lưu user ID vào req.user.id
 * 4. Chuyển sang controller tiếp theo
 * 
 * Nếu token không hợp lệ, middleware sẽ trả lỗi 401
 */

/**
 * GET /auth/profile
 * Lấy thông tin cá nhân của người dùng hiện tại
 * Header: Authorization: Bearer <jwt_token>
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * POST /auth/logout
 * Đăng xuất
 * Header: Authorization: Bearer <jwt_token>
 */
router.post('/logout', authenticate, authController.logout);

/**
 * ========================================
 * EXPORT
 * ========================================
 */
module.exports = router;
