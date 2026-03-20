import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Image as ImageIcon, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import categoryService from '../../services/categoryService';

const MenuModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [categories, setCategories] = useState([]);
  
  // State quản lý dữ liệu form (Text fields)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    status: 'Available',
    description: ''
  });

  // State quản lý file ảnh và preview
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Khởi tạo dữ liệu khi mở Modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (editingItem) {
        setFormData({
          name: editingItem.name,
          price: editingItem.price,
          category: editingItem.category?._id || editingItem.category,
          status: editingItem.status || 'Available',
          description: editingItem.description || ''
        });
        setPreviewUrl(editingItem.image || '');
      } else {
        setFormData({
          name: '',
          price: '',
          category: '',
          status: 'Available',
          description: ''
        });
        setPreviewUrl('');
      }
      setImageFile(null);
      setError('');
    }
  }, [isOpen, editingItem]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Xử lý khi chọn file ảnh mới từ máy tính
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chỉ chọn file hình ảnh.');
        return;
      }
      setImageFile(file);
      // Tạo URL tạm thời để hiển thị ảnh xem trước
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // SỬ DỤNG FORMDATA ĐỂ GỬI FILE
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('price', formData.price);
      dataToSend.append('category', formData.category);
      dataToSend.append('status', formData.status);
      dataToSend.append('description', formData.description);
      
      // Nếu có chọn file mới thì đính kèm vào formData
      if (imageFile) {
        dataToSend.append('image', imageFile);
      }

      await onSave(dataToSend);
      onClose();
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu món ăn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50 flex-shrink-0">
          <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            {editingItem ? 'CHỈNH SỬA MÓN ĂN' : 'THÊM MÓN ĂN MỚI'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-200/50 rounded-full transition-colors text-stone-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Khu vực Chọn ảnh & Preview */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={14} /> HÌNH ẢNH SẢN PHẨM
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-2xl p-4 bg-stone-50 group hover:border-amber-400 transition-all cursor-pointer relative overflow-hidden">
              {previewUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => { setPreviewUrl(''); setImageFile(null); }}
                      className="p-2 bg-rose-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center text-stone-400 group-hover:text-amber-500 transition-colors">
                  <ImageIcon size={48} className="mb-2 opacity-20" />
                  <p className="text-sm font-bold">NHẤN ĐỂ TẢI ẢNH LÊN</p>
                  <p className="text-[10px] uppercase font-medium mt-1">Hỗ trợ: JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange} 
              />
            </div>
          </div>

          {/* Tên món */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 uppercase">
              <Package size={14} /> Tên món *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Cà phê sữa đá"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-semibold text-stone-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Giá */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 uppercase">
                <DollarSign size={14} /> Giá tiền *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="VD: 25000"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-semibold text-stone-800"
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5 uppercase">
                <Tag size={14} /> Danh mục *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all appearance-none font-semibold text-stone-800"
              >
                <option value="">Chọn loại</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
            <label className="block text-xs font-bold text-stone-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle size={14} /> Trạng thái phục vụ
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Available"
                  checked={formData.status === 'Available'}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-stone-300"
                />
                <span className={`text-sm font-bold ${formData.status === 'Available' ? 'text-emerald-700' : 'text-stone-400'}`}>SẴN SÀNG</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer font-bold">
                <input
                  type="radio"
                  name="status"
                  value="Out of Stock"
                  checked={formData.status === 'Out of Stock'}
                  onChange={handleChange}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-stone-300"
                />
                <span className={`text-sm font-bold ${formData.status === 'Out of Stock' ? 'text-rose-700' : 'text-stone-400'}`}>HẾT MÓN</span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-8 py-3 bg-stone-900 text-white text-xs font-black rounded-xl shadow-xl shadow-stone-200 transition-all hover:bg-stone-800 active:scale-95 flex items-center gap-2 tracking-widest ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ĐANG LƯU...
              </>
            ) : (
              'LƯU THỰC ĐƠN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
