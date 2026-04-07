/**
 * Trang Quản Lý Khuyến Mãi (PromotionsPage)
 *
 * Chức năng:
 * - Xem danh sách tất cả khuyến mãi (có tìm kiếm, lọc)
 * - Thêm mới khuyến mãi (modal)
 * - Sửa thông tin khuyến mãi (modal)
 * - Xóa khuyến mãi (xác nhận trước khi xóa)
 * - Hiển thị trạng thái: đang hoạt động, hết hạn, đã tắt
 *
 * Quyền: CHỈ ADMIN mới truy cập được trang này
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, AlertCircle, CheckCircle2,
  Tag, Edit2, Trash2, X, Percent, DollarSign,
  Calendar, Hash, ToggleLeft, ToggleRight
} from 'lucide-react';
import promotionService from '../services/promotionService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { isAdmin } from '../utils/auth'; // Helper kiểm tra quyền admin

const PromotionsPage = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách khuyến mãi
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', description: '',
    type: 'percent', value: '',
    minOrderAmount: '', maxDiscount: '',
    startDate: '', endDate: '',
    usageLimit: '', isActive: true
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dialog xác nhận xóa
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null });

  // Toast thông báo
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ============================================================
  // FUNCTIONS
  // ============================================================

  /**
   * Hiển thị thông báo (Toast)
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  /**
   * Tải danh sách khuyến mãi từ API
   */
  const fetchPromotions = useCallback(async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const data = await promotionService.getAllPromotions({ search: searchQuery });
      // Dữ liệu trả về: { promotions, pagination }
      setPromotions(data?.promotions || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách khuyến mãi.');
      showNotification('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải dữ liệu khi component mount + khi search thay đổi
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPromotions(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchPromotions]);

  /**
   * Mở modal thêm mới
   */
  const handleOpenAddModal = () => {
    setEditingPromotion(null);
    setFormData({
      code: '', name: '', description: '',
      type: 'percent', value: '',
      minOrderAmount: '', maxDiscount: '',
      startDate: '', endDate: '',
      usageLimit: '', isActive: true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  /**
   * Mở modal chỉnh sửa
   */
  const handleOpenEditModal = (promo) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code || '',
      name: promo.name || '',
      description: promo.description || '',
      type: promo.type || 'percent',
      value: promo.value || '',
      minOrderAmount: promo.minOrderAmount || '',
      maxDiscount: promo.maxDiscount || '',
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      usageLimit: promo.usageLimit || '',
      isActive: promo.isActive !== undefined ? promo.isActive : true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  /**
   * Xử lý thay đổi form
   */
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formError) setFormError('');
  };

  /**
   * Validate form trước khi submit
   */
  const validateForm = () => {
    if (!formData.code.trim()) return 'Vui lòng nhập mã khuyến mãi';
    if (!formData.name.trim()) return 'Vui lòng nhập tên khuyến mãi';
    if (!formData.value || Number(formData.value) <= 0) return 'Giá trị giảm phải lớn hơn 0';
    if (formData.type === 'percent' && Number(formData.value) > 100) return 'Giá trị phần trăm không được vượt quá 100';
    if (!formData.startDate) return 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) return 'Vui lòng chọn ngày kết thúc';
    if (new Date(formData.endDate) <= new Date(formData.startDate)) return 'Ngày kết thúc phải sau ngày bắt đầu';
    return '';
  };

  /**
   * Submit form (thêm mới hoặc cập nhật)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setFormError(err); return; }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        usageLimit: Number(formData.usageLimit) || 0,
      };

      if (editingPromotion) {
        await promotionService.updatePromotion(editingPromotion._id, payload);
        showNotification(`Đã cập nhật khuyến mãi "${formData.code}" thành công`);
      } else {
        await promotionService.createPromotion(payload);
        showNotification(`Đã tạo khuyến mãi "${formData.code}" thành công`);
      }
      setIsModalOpen(false);
      fetchPromotions(searchTerm);
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu khuyến mãi');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Xóa khuyến mãi (xác nhận trước)
   */
  const handleConfirmDelete = async () => {
    const promo = confirmDialog.item;
    try {
      await promotionService.deletePromotion(promo._id);
      showNotification(`Đã xóa khuyến mãi "${promo.code}" thành công`);
      fetchPromotions(searchTerm);
      setConfirmDialog({ isOpen: false, item: null });
    } catch (err) {
      showNotification(err.message || 'Lỗi khi xóa khuyến mãi', 'error');
    }
  };

  /**
   * Kiểm tra khuyến mãi còn hiệu lực không
   */
  const getPromoStatus = (promo) => {
    const now = new Date();
    if (!promo.isActive) return { label: 'Đã tắt', color: 'bg-stone-100 text-stone-600' };
    if (now < new Date(promo.startDate)) return { label: 'Chưa bắt đầu', color: 'bg-blue-100 text-blue-700' };
    if (now > new Date(promo.endDate)) return { label: 'Hết hạn', color: 'bg-rose-100 text-rose-700' };
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) return { label: 'Hết lượt', color: 'bg-amber-100 text-amber-700' };
    return { label: 'Đang hoạt động', color: 'bg-emerald-100 text-emerald-700' };
  };

  /**
   * Format số tiền VND
   */
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 animate-in fade-in duration-700">

      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-24 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-500 border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* ===== HEADER + TOOLBAR ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-violet-100/50 rounded-2xl text-violet-900 border border-violet-200/40 shadow-inner">
            <Tag size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight uppercase">
              QUẢN LÝ KHUYẾN MÃI
            </h1>
            <p className="text-stone-500 font-medium">Tạo và quản lý mã giảm giá cho quán.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/30 flex flex-col sm:flex-row items-stretch gap-3 lg:w-max min-w-[300px]">
          {/* Ô tìm kiếm */}
          <div className="relative group flex-grow lg:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-violet-600 transition-all" size={18} />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên khuyến mãi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-100/30 border border-stone-100 rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all placeholder:text-stone-400 text-stone-800 font-medium"
            />
          </div>
          {/* Nút thêm mới - CHỈ ADMIN */}
          {isAdmin() && (
            <button onClick={handleOpenAddModal}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-stone-300 active:scale-95 group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              THÊM MÃ MỚI
            </button>
          )}
        </div>
      </div>

      {/* ===== HIỂN THỊ LỖI ===== */}
      {error && (
        <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-800 flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600"><AlertCircle /></div>
            <div>
              <p className="font-bold">Đã xảy ra lỗi!</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
          <button onClick={() => fetchPromotions(searchTerm)}
            className="px-5 py-2.5 bg-rose-200/50 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <RefreshCw size={16} /> THỬ LẠI
          </button>
        </div>
      )}

      {/* ===== BẢNG DANH SÁCH ===== */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Tag size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Chưa có mã khuyến mãi nào</p>
          <p className="text-sm">Bấm "Thêm mã mới" để tạo mã giảm giá đầu tiên.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Mã</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Tên chương trình</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Loại & Giá trị</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Thời gian</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Đã dùng</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Trạng thái</th>
                  {isAdmin() && (
                    <th className="text-right px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Hành động</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {promotions.map((promo) => {
                  const status = getPromoStatus(promo);
                  return (
                    <tr key={promo._id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Mã khuyến mãi */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-800 rounded-lg font-mono font-bold text-sm">
                          <Hash size={14} /> {promo.code}
                        </span>
                      </td>

                      {/* Tên chương trình */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-900 text-sm">{promo.name}</p>
                        {promo.description && (
                          <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{promo.description}</p>
                        )}
                      </td>

                      {/* Loại & Giá trị */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {promo.type === 'percent' ? (
                            <span className="flex items-center gap-1 text-sm font-bold text-amber-700">
                              <Percent size={14} /> {promo.value}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm font-bold text-green-700">
                              <DollarSign size={14} /> {formatVND(promo.value)}
                            </span>
                          )}
                        </div>
                        {promo.minOrderAmount > 0 && (
                          <p className="text-xs text-stone-400 mt-0.5">Đơn tối thiểu: {formatVND(promo.minOrderAmount)}</p>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="px-6 py-4 text-sm text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-stone-400" />
                          <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">→ {new Date(promo.endDate).toLocaleDateString('vi-VN')}</p>
                      </td>

                      {/* Đã dùng */}
                      <td className="px-6 py-4 text-sm font-semibold text-stone-700">
                        {promo.usedCount}{promo.usageLimit > 0 ? `/${promo.usageLimit}` : ''} lượt
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>

                      {/* Hành động - CHỈ ADMIN */}
                      {isAdmin() && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenEditModal(promo)}
                              className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setConfirmDialog({ isOpen: true, item: promo })}
                              className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODAL THÊM/SỬA ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingPromotion ? '✏️ Sửa Khuyến Mãi' : '🎫 Thêm Khuyến Mãi Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" /><span>{formError}</span>
                </div>
              )}

              {/* Mã + Tên */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Mã khuyến mãi *</label>
                  <input type="text" name="code" value={formData.code} onChange={handleFormChange}
                    placeholder="VD: SALE20" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-mono font-bold uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Loại giảm *</label>
                  <select name="type" value={formData.type} onChange={handleFormChange} disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Cố định (VNĐ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Tên chương trình *</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange}
                  placeholder="VD: Giảm 20% mừng khai trương" disabled={isSaving}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange}
                  placeholder="Mô tả chi tiết về chương trình..." disabled={isSaving} rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium resize-none" />
              </div>

              {/* Giá trị + Điều kiện */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                    Giá trị giảm *
                  </label>
                  <input type="number" name="value" value={formData.value} onChange={handleFormChange}
                    placeholder={formData.type === 'percent' ? '20' : '10000'} disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Đơn tối thiểu</label>
                  <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleFormChange}
                    placeholder="0" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Giảm tối đa</label>
                  <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleFormChange}
                    placeholder="0" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
              </div>

              {/* Thời gian + Giới hạn */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Bắt đầu *</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Kết thúc *</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Giới hạn lượt</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleFormChange}
                    placeholder="0 = ∞" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none text-sm font-medium" />
                </div>
              </div>

              {/* Toggle kích hoạt */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-stone-700">Kích hoạt ngay</span>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.isActive ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {/* Nút submit */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border-2 border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50 transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                  ) : editingPromotion ? '💾 Cập nhật' : '✅ Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DIALOG XÁC NHẬN XÓA ===== */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa khuyến mãi"
        message={`Bạn có chắc muốn xóa mã "${confirmDialog.item?.code}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
        variant="danger"
      />
    </div>
  );
};

export default PromotionsPage;
