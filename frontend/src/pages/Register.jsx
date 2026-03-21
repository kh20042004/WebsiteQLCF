/**
 * ========================================
 * REGISTER PAGE
 * ========================================
 * 
 * Trang đăng ký tài khoản mới
 * - Form name + email + password + confirm password
 * - Xác thực input (email format, password match)
 * - Gọi API Backend để tạo tài khoản
 * - Lưu token vào localStorage
 * - Redirect sang Dashboard nếu thành công
 * 
 * State management: AuthContext
 * API: authService.register()
 */

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/Alert/Alert';
import '../styles/Register.css';

const Register = () => {
  // ============================================
  // STATE & CONTEXT
  // ============================================

  // Lấy hàm register từ AuthContext
  const { register } = useContext(AuthContext);

  // State form input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Navigation
  const navigate = useNavigate();

  // ============================================
  // FUNCTION: VALIDATE FORM
  // ============================================
  /**
   * Kiểm tra form có hợp lệ không
   * 
   * @returns {string} - Nếu có lỗi return message, không có lỗi return ''
   */
  const validateForm = () => {
    // Kiểm tra tất cả field phải điền
    if (!name || !email || !password || !confirmPassword) {
      return 'Vui lòng điền đầy đủ thông tin';
    }

    // Kiểm tra tên
    if (name.length < 3) {
      return 'Tên phải từ 3 ký tự trở lên';
    }

    // Kiểm tra email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ';
    }

    // Kiểm tra mật khẩu
    if (password.length < 6) {
      return 'Mật khẩu phải từ 6 ký tự trở lên';
    }

    // Kiểm tra password khớp
    if (password !== confirmPassword) {
      return 'Mật khẩu không khớp';
    }

    // Không có lỗi
    return '';
  };

  // ============================================
  // FUNCTION: XỬ LÝ SUBMIT FORM
  // ============================================
  /**
   * Xử lý khi người dùng click nút "Đăng Ký"
   * 
   * Các bước:
   * 1. Validate form
   * 2. Gọi hàm register từ AuthContext
   * 3. Nếu thành công → lưu token + redirect sang Dashboard
   * 4. Nếu lỗi → hiển thị error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccess('');

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      // Gọi hàm register từ AuthContext
      await register(name, email, password, confirmPassword);

      setSuccess('Đăng ký thành công! Đang chuyển hướng...');

      // Chờ 1 giây rồi redirect sang Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="register-container">
      {/* Header - Logo */}
      <div className="register-header">
        <h1>☕ Quản Lý Quán Cà Phê</h1>
        <p>Tạo Tài Khoản Mới</p>
      </div>

      {/* Form register */}
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Alert error */}
        {error && <Alert type="error" message={error} />}

        {/* Alert success */}
        {success && <Alert type="success" message={success} />}

        {/* Input name */}
        <div className="form-group">
          <label htmlFor="name">Họ Tên</label>
          <input
            type="text"
            id="name"
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Input email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Input password */}
        <div className="form-group">
          <label htmlFor="password">Mật Khẩu</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <small>Tối thiểu 6 ký tự</small>
        </div>

        {/* Input confirm password */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Button submit */}
        <button
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading ? '⏳ Đang đăng ký...' : '✍️ Đăng Ký'}
        </button>
      </form>

      {/* Link redirect sang Login */}
      <div className="register-footer">
        <p>
          Đã có tài khoản?{' '}
          <Link to="/login">Đăng nhập tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
