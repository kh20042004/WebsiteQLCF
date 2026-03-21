/**
 * ========================================
 * LOGIN PAGE
 * ========================================
 * 
 * Trang đăng nhập người dùng
 * - Form email + password
 * - Xác thực thông tin qua API Backend
 * - Lưu token vào localStorage
 * - Redirect sang Dashboard nếu đăng nhập thành công
 * 
 * State management: AuthContext
 * API: authService.login()
 */

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/Alert/Alert';
import '../styles/Login.css';

const Login = () => {
  // ============================================
  // STATE & CONTEXT
  // ============================================

  // Lấy hàm login từ AuthContext
  const { login } = useContext(AuthContext);

  // State form input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State loading & error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Navigation
  const navigate = useNavigate();

  // ============================================
  // FUNCTION: XỬ LÝ SUBMIT FORM
  // ============================================
  /**
   * Xử lý khi người dùng click nút "Đăng Nhập"
   * 
   * Các bước:
   * 1. Validate input (email, password)
   * 2. Gọi hàm login từ AuthContext
   * 3. Nếu thành công → lưu token + redirect sang Dashboard
   * 4. Nếu lỗi → hiển thị error message
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn reload trang

    // Reset message cũ
    setError('');
    setSuccess('');

    // Validate input
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    // Regex kiểm tra email hợp lệ
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);

      // Gọi hàm login từ AuthContext
      // Hàm này sẽ gọi API backend và lưu token
      await login(email, password);

      setSuccess('Đăng nhập thành công! Đang chuyển hướng...');

      // Chờ 1 giây rồi redirect sang Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      // Nếu login fail, hiển thị error message
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="login-container">
      {/* Header - Logo */}
      <div className="login-header">
        <h1>☕ Quản Lý Quán Cà Phê</h1>
        <p>Đăng Nhập Hệ Thống</p>
      </div>

      {/* Form login */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Alert error */}
        {error && <Alert type="error" message={error} />}

        {/* Alert success */}
        {success && <Alert type="success" message={success} />}

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
        </div>

        {/* Button submit */}
        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? '⏳ Đang đăng nhập...' : '🔓 Đăng Nhập'}
        </button>
      </form>

      {/* Link redirect sang Register */}
      <div className="login-footer">
        <p>
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký tại đây</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
