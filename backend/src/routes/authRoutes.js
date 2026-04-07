/**
 * Routes: authRoutes.js (đã phân quyền)
 *
 * Phân quyền xác thực:
 * - POST /auth/register → Công khai (tự đăng ký) HOẶC chỉ Admin tạo tài khoản nhân viên
 *   Hiện tại: Công khai — ai cũng đăng ký được (phù hợp giai đoạn phát triển)
 *   Lưu ý: Có thể đổi thành requireAdmin nếu muốn chỉ admin tạo tài khoản
 * - POST /auth/login   → Công khai (ai cũng đăng nhập được)
 * - GET  /auth/me      → Đã đăng nhập (xem thông tin bản thân)
 */

const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const { requireAdmin } = require('../middlewares/authenticate');

// Tạo router
const router = express.Router();

// ---- ĐĂNG KÝ TÀI KHOẢN ----
// POST /api/auth/register
// Hiện tại: công khai — ai cũng có thể tự đăng ký
// Nếu muốn chỉ admin tạo tài khoản → thêm: authenticate, requireAdmin
router.post('/register', authController.register);

// ---- ĐĂNG NHẬP ----
// POST /api/auth/login — Công khai, trả về JWT token
router.post('/login', authController.login);

// ---- LẤY THÔNG TIN BẢN THÂN (CẦN ĐĂNG NHẬP) ----
// GET /api/auth/me — Người dùng xem thông tin tài khoản của chính mình
router.get('/me', authenticate, authController.getProfile);

// ---- LẤY DANH SÁCH TẤT CẢ NHÂN VIÊN (CHỈ ADMIN) ----
// GET /api/auth/users — Admin lấy DS nhân viên (dùng cho dropdown xếp ca)
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find({}).select('name email role').sort({ name: 1 });
        res.status(200).json({
            status: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

// Export router
module.exports = router;
