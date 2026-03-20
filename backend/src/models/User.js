/**
 * Model User - Quản lý thông tin người dùng (Tài khoản nhân viên)
 * 
 * Fields:
 * - name: Tên nhân viên
 * - email: Email (dùng để login)
 * - password: Mật khẩu (hash bằng bcryptjs)
 * - role: Vai trò (admin, staff)
 * - createdAt: Thời gian tạo
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Tạo schema cho User
const userSchema = new mongoose.Schema(
  {
    // Tên nhân viên
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
      maxlength: [100, 'Tên không quá 100 ký tự'],
    },

    // Email (dùng để đăng nhập)
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ'],
    },

    // Mật khẩu (sẽ được hash trước khi lưu)
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải ít nhất 6 ký tự'],
      select: false, // Không lấy password khi query mặc định
    },

    // Vai trò (admin, staff)
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
  },
  {
    // Tự động thêm createdAt, updatedAt
    timestamps: true,
  }
);

/**
 * Middleware: Hash mật khẩu trước khi lưu
 * - Chỉ hash nếu password được thay đổi
 * - Sử dụng bcryptjs để hash (salt: 10)
 */
userSchema.pre('save', async function (next) {
  // Kiểm tra nếu password không được thay đổi, bỏ qua
  if (!this.isModified('password')) {
    next();
  }

  try {
    // Tạo salt và hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method: So sánh password nhập vào với password trong DB
 * @param {string} enteredPassword - Mật khẩu nhập vào
 * @returns {boolean} - true nếu khớp, false nếu không
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Tạo và export model User
module.exports = mongoose.model('User', userSchema);
