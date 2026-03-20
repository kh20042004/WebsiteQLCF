import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

/**
 * MenuModal Component - Modal Form để thêm hoặc sửa món ăn
 * 
 * @param {boolean} isOpen - Trạng thái mở/đóng modal
 * @param {Function} onClose - Callback khi đóng modal
 * @param {Object} initialData - Dữ liệu ban đầu (nếu là sửa)
 * @param {Function} onSubmit - Callback khi submit form
 * @param {Array} categories - Danh sách danh mục để chọn
 * @param {boolean} loading - Trạng thái đang lưu dữ liệu
 */
const MenuModal = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSubmit, 
  categories = [], 
  loading = false 
}) => {
  const isEdit = !!initialData;
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    status: 'available',
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Reset form when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category?._id || initialData.category || '',
        price: initialData.price || '',
        image: initialData.image || '',
        status: initialData.status || 'available',
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: '',
        price: '',
        image: '',
        status: 'available',
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên món không được để trống';
    if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Giá phải là số lớn hơn 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-stone-900">
              {isEdit ? 'Chỉnh Sửa Món' : 'Thêm Món Mới'}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Điền thông tin món ăn vào form bên dưới.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-all"
          >
            <Icon icon="lucide:x" className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Tên món */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Tên món *</label>
            <div className="relative group">
              <Icon icon="lucide:coffee" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên món ăn..."
                className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border ${errors.name ? 'border-rose-300 focus:ring-rose-200' : 'border-stone-200 focus:ring-amber-200'} rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm`}
                disabled={loading}
              />
            </div>
            {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">Danh mục *</label>
              <div className="relative group">
                <Icon icon="lucide:tag" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border ${errors.category ? 'border-rose-300 focus:ring-rose-200' : 'border-stone-200 focus:ring-amber-200'} rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm appearance-none`}
                  disabled={loading}
                >
                  <option value="">Chọn danh mục...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <Icon icon="lucide:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>
              {errors.category && <p className="text-xs text-rose-500 font-medium">{errors.category}</p>}
            </div>

            {/* Giá */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">Giá (VND) *</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs group-focus-within:text-amber-600">₫</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border ${errors.price ? 'border-rose-300 focus:ring-rose-200' : 'border-stone-200 focus:ring-amber-200'} rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm font-bold`}
                  disabled={loading}
                />
              </div>
              {errors.price && <p className="text-xs text-rose-500 font-medium">{errors.price}</p>}
            </div>
          </div>

          {/* Link ảnh */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Link ảnh</label>
            <div className="relative group">
              <Icon icon="lucide:image" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 focus:ring-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm"
                disabled={loading}
              />
            </div>
            {formData.image && (
              <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                <img src={formData.image} alt="Preview" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Trạng thái */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Trạng thái</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                formData.status === 'available' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="available"
                  checked={formData.status === 'available'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Icon icon="lucide:check-circle" className={formData.status === 'available' ? 'text-emerald-500' : 'text-stone-300'} />
                <span className="text-sm font-bold">Đang bán</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                formData.status === 'unavailable' 
                  ? 'border-rose-500 bg-rose-50 text-rose-700' 
                  : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
              }`}>
                <input
                  type="radio"
                  name="status"
                  value="unavailable"
                  checked={formData.status === 'unavailable'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Icon icon="lucide:x-circle" className={formData.status === 'unavailable' ? 'text-rose-500' : 'text-stone-300'} />
                <span className="text-sm font-bold">Tạm ngưng</span>
              </label>
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Mô tả món ăn</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Thành phần, hương vị..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:ring-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:bg-white transition-all text-sm resize-none"
              disabled={loading}
            ></textarea>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-stone-300 text-stone-700 text-sm font-bold rounded-xl hover:bg-stone-100 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <Icon icon="lucide:loader-2" className="animate-spin text-lg" />
            ) : (
              <Icon icon={isEdit ? "lucide:save" : "lucide:plus"} className="text-lg" />
            )}
            {isEdit ? 'Lưu thay đổi' : 'Thêm món'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
