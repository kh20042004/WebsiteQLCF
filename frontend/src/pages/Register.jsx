/**
 * Trang Đăng Ký Tài Khoản
 * - Giao diện đồng nhất với Login.jsx
 * - Validate: tên, email, mật khẩu >= 6 ký tự, xác nhận mật khẩu
 * - Sau đăng ký thành công → redirect sang /login
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword)
      return 'Vui lòng điền đầy đủ tất cả thông tin';
    if (formData.name.trim().length < 3)
      return 'Tên phải từ 3 ký tự trở lên';
    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(formData.email))
      return 'Email không đúng định dạng';
    if (formData.password.length < 6)
      return 'Mật khẩu phải từ 6 ký tự trở lên';
    // trim() để loại bỏ khoảng trắng vô tình (autofill có thể thêm space)
    if (formData.password.trim() !== formData.confirmPassword.trim())
      return 'Mật khẩu xác nhận không khớp';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const err = validate();
    if (err) { setError(err); return; }

    try {
      setIsLoading(true);
      await api.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        password: formData.password,
      });
      setSuccess('Đăng ký thành công! Đang chuyển sang trang đăng nhập...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (e) {
      setError(e.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-14 h-14 bg-stone-900 rounded-2xl flex items-center justify-center shadow-xl">
          <Coffee size={28} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Roast.</h1>
          <p className="text-stone-500 text-sm font-medium">Tạo tài khoản mới</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-stone-200/60 p-8 border border-stone-100">
        <h2 className="text-xl font-bold text-stone-900 mb-1">Đăng Ký</h2>
        <p className="text-stone-500 text-sm mb-6">Điền thông tin để tạo tài khoản nhân viên</p>

        {error && (
          <div className="mb-5 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-700 text-sm">
            <CheckCircle2 size={16} className="flex-shrink-0" /><span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ Tên */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Họ Tên</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Nguyễn Văn A" disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-800 text-sm font-medium placeholder:text-stone-400" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="example@mail.com" disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-800 text-sm font-medium placeholder:text-stone-400" />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Mật Khẩu</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••" disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-stone-800 text-sm font-medium placeholder:text-stone-400" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-1 pl-1">Tối thiểu 6 ký tự</p>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Xác Nhận Mật Khẩu</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="••••••••" disabled={isLoading}
                className={`w-full pl-10 pr-12 py-3 bg-stone-50 border rounded-xl focus:ring-2 outline-none transition-all text-stone-800 text-sm font-medium placeholder:text-stone-400 ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-stone-200 focus:ring-amber-500/20 focus:border-amber-500'
                }`} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-sm tracking-widest hover:bg-stone-800 active:scale-[0.98] transition-all shadow-lg shadow-stone-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />ĐANG TẠO TÀI KHOẢN...</>
            ) : '✍️ ĐĂNG KÝ'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-amber-600 font-bold hover:text-amber-700 transition-colors">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>

      <p className="text-xs text-stone-400 mt-6">© 2025 Roast Coffee Management System</p>
    </div>
  );
};

export default Register;
