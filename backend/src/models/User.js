/**
 * ========================================
 * USER MODEL - Schema và Method
 * ========================================
 * 
 * Định nghĩa cấu trúc dữ liệu người dùng:
 * - Lưu trữ thông tin: tên, email, mật khẩu
 * - Tự động mã hóa mật khẩu trước khi lưu
 * - Cung cấp method so sánh mật khẩu
 * 
 * Sử dụng: Mongoose ORM để tương tác với MongoDB
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- ĐỊNH NGHĨA SCHEMA ----
const userSchema = new mongoose.Schema(
  {
    // Tên người dùng
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên'],
      trim: true,
      minlength: [3, 'Tên phải từ 3 ký tự trở lên'],
    },

    // Email - duy nhất, không trùng
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng nhập email hợp lệ',
      ],
    },

    // Mật khẩu - được mã hóa, không trả về mặc định
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải từ 6 ký tự trở lên'],
      select: false, // Mặc định không trả về password khi query
    },

    // Vai trò người dùng (admin, staff, customer)
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },

    // Trạng thái người dùng (active, inactive)
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // Thời gian tạo và cập nhật
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Tự động cập nhật updatedAt
  }
);

// ---- MIDDLEWARE: TỰ ĐỘNG MÃ HÓA MẬT KHẨU TRƯỚC KHI LƯU ----
/**
 * Trước khi save, kiểm tra nếu password bị thay đổi
 * Nếu có, mã hóa nó bằng bcryptjs
 */
userSchema.pre('save', async function (next) {
  // Nếu password không bị thay đổi, bỏ qua middleware này
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Tạo salt (độ phức tạp mã hóa)
    const salt = await bcrypt.genSalt(10);

    // Mã hóa password
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error);
  }
});

// ---- METHOD: SO SÁNH MẬT KHẨU ----
/**
 * So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong database
 * 
 * @param {string} enteredPassword - Mật khẩu từ người dùng nhập
 * @returns {Promise<boolean>} - true nếu khớp, false nếu không
 * 
 * Cách sử dụng:
 * const user = await User.findOne({ email }).select('+password');
 * const isMatch = await user.comparePassword('user_password');
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ---- XUẤT MODEL ----
module.exports = mongoose.model('User', userSchema);
