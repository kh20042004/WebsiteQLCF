/**
 * Service: Xử lý logic đăng ký và đăng nhập
 * 
 * Nhiệm vụ:
 * - register: Tạo tài khoản mới
 * - login: Xác thực tài khoản và trả về token
 * - getProfile: Lấy thông tin profile từ userId
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// ---- ĐĂNG KÝ TÀI KHOẢN ----
const register = async (data) => {
  const { name, email, password, confirmPassword } = data;

  // Kiểm tra mật khẩu khớp
  if (password !== confirmPassword) {
    throw new Error('Mật khẩu không khớp');
  }

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email đã được sử dụng');
  }

  // Tạo user mới
  const user = new User({
    name,
    email,
    password,
  });

  // Lưu vào database
  await user.save();

  // Trả về user (không lấy password)
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

// ---- ĐĂNG NHẬP ----
const login = async (data) => {
  const { email, password } = data;

  // Kiểm tra email và password có được nhập
  if (!email || !password) {
    throw new Error('Vui lòng nhập email và mật khẩu');
  }

  // Tìm user theo email (bao gồm cả password vì select: false)
  const user = await User.findOne({ email }).select('+password');

  // Kiểm tra user tồn tại
  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  // Kiểm tra mật khẩu
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  // Tạo JWT token
  const token = generateToken(user._id);

  // Trả về token và user info
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

// ---- LẤY THÔNG TIN PROFILE ----
const getProfile = async (userId) => {
  // Tìm user theo ID
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // Trả về thông tin user (không lấy password)
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

module.exports = {
  register,
  login,
  getProfile,
};
