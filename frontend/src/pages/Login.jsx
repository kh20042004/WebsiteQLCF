/**
 * Trang: Đăng Nhập (Login)
 *
 * Chức năng:
 * - Form đăng nhập với email + mật khẩu
 * - Gọi API POST /auth/login qua authService
 * - Lưu token + thông tin user vào localStorage
 * - Đăng nhập thành công → chuyển tới /tables (trang Tổng Quan Bàn)
 * - Hiển thị thông báo lỗi nếu sai tài khoản
 *
 * Không import AuthContext để tránh lỗi parse JSX từ file .js
 * → Gọi authService.login() trực tiếp và tự lưu localStorage
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import * as authService from '../services/authService';

const Login = () => {
  // ---- STATE ----
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);   // Toggle hiện/ẩn mật khẩu
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const navigate = useNavigate();

  /**
   * Xử lý submit form đăng nhập
   *
   * Luồng:
   * 1. Validate input cơ bản
   * 2. Gọi authService.login() → API POST /auth/login
   * 3. Lưu token + user vào localStorage
   * 4. Chuyển sang /tables (trang Tổng Quan Bàn)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate không để trống
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);

      // Backend trả về: { token, user: { id, name, email, role } }
      // interceptor api.js đã extract .data.data → rawData = { token, user: {...} }
      const rawData = await authService.login(email, password);

      // Hỗ trợ cả 2 cấu trúc response có thể:
      // Cấu trúc 1 (interceptor đã extract): rawData = { token, user: {...} }
      // Cấu trúc 2 (chưa extract):            rawData = { data: { token, user }, ... }
      const payload = rawData?.token ? rawData : rawData?.data;

      if (!payload?.token) {
        setError('Đăng nhập thất bại: Không nhận được token từ server.');
        return;
      }

      // Lưu token vào localStorage (dùng cho axios interceptor)
      localStorage.setItem('token', payload.token);

      // Lưu thông tin user — backend đóng gói trong payload.user
      const userInfo = payload.user || {};
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Chuyển về trang Tổng Quan Bàn sau khi đăng nhập thành công
      navigate('/tables', { replace: true });

    } catch (err) {
      // Hiển thị thông báo lỗi từ server hoặc thông báo mặc định
      setError(err?.message || 'Sai email hoặc mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-200 flex items-center justify-center p-4">

      {/* Card đăng nhập */}
      <div className="w-full max-w-md">

        {/* Logo + tên thương hiệu */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-stone-900 rounded-2xl shadow-lg mb-4">
            <Icon icon="solar:cup-hot-linear" className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-stone-900">
            Roast<span className="text-amber-600">.</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">Hệ thống quản lý quán cà phê</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">

          {/* Header card */}
          <div className="px-8 pt-8 pb-6 border-b border-stone-100">
            <h2 className="text-xl font-bold text-stone-900">Đăng Nhập</h2>
            <p className="text-sm text-stone-500 mt-1">Nhập tài khoản để truy cập hệ thống</p>
          </div>

          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

            {/* Thông báo lỗi */}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-4 py-3 text-sm">
                <Icon icon="solar:danger-triangle-linear" className="text-lg flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-stone-700 block">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icon icon="solar:letter-linear" className="text-lg" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:bg-stone-50 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Input Mật Khẩu */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-semibold text-stone-700 block">
                Mật Khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Icon icon="solar:lock-password-linear" className="text-lg" />
                </span>
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:bg-stone-50 disabled:opacity-60"
                />
                {/* Nút toggle hiện/ẩn mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                >
                  <Icon icon={showPw ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="text-lg" />
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  {/* Spinner khi đang loading */}
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <Icon icon="solar:login-2-linear" />
                  Đăng Nhập
                </>
              )}
            </button>
          </form>

          {/* Footer card */}
          <div className="px-8 pb-6 text-center text-sm text-stone-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-amber-600 font-semibold hover:underline">
              Đăng ký tại đây
            </Link>
          </div>
        </div>

        {/* Chú thích bên dưới */}
        <p className="text-center text-xs text-stone-400 mt-6">
          © 2025 Roast Coffee Management System
        </p>
      </div>
    </div>
  );
};

export default Login;
