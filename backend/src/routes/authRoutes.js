/**
 * Routes: Định nghĩa các endpoint API cho Auth
 * 
 * Endpoints:
 * - POST /auth/register - Đăng ký tài khoản
 * - POST /auth/login - Đăng nhập
 * - GET /auth/me - Lấy thông tin profile (cần authenticate)
 */

const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');

// Tạo router
const router = express.Router();

// ---- ĐĂNG KÝ ----
// POST /auth/register
router.post('/register', authController.register);

// ---- ĐĂNG NHẬP ----
// POST /auth/login
router.post('/login', authController.login);

// ---- LẤY PROFILE (CẦN AUTHENTICATE) ----
// GET /auth/me
router.get('/me', authenticate, authController.getProfile);

// Export router
module.exports = router;
