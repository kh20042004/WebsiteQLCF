/**
 * Controller: Xử lý request từ client
 * 
 * Nhiệm vụ:
 * - Lấy dữ liệu từ request
 * - Gọi service để xử lý logic
 * - Trả về response cho client
 */

const authService = require('../services/authService');

// ---- ĐĂNG KÝ TÀI KHOẢN ----
const register = async (req, res) => {
  try {
    // Lấy dữ liệu từ body request
    const { name, email, password, confirmPassword } = req.body;

    // Gọi service để đăng ký
    const user = await authService.register({
      name,
      email,
      password,
      confirmPassword,
    });

    // Trả về response thành công
    res.status(201).json({
      status: true,
      message: 'Đăng ký thành công',
      data: user,
    });
  } catch (error) {
    // Trả về lỗi
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// ---- ĐĂNG NHẬP ----
const login = async (req, res) => {
  try {
    // Lấy dữ liệu từ body request
    const { email, password } = req.body;

    // Gọi service để đăng nhập
    const result = await authService.login({
      email,
      password,
    });

    // Trả về response thành công
    res.status(200).json({
      status: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    // Trả về lỗi
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// ---- LẤY THÔNG TIN PROFILE ----
const getProfile = async (req, res) => {
  try {
    // Lấy userId từ middleware authenticate
    const userId = req.userId;

    // Gọi service để lấy profile
    const user = await authService.getProfile(userId);

    // Trả về response thành công
    res.status(200).json({
      status: true,
      message: 'Lấy thông tin thành công',
      data: user,
    });
  } catch (error) {
    // Trả về lỗi
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
