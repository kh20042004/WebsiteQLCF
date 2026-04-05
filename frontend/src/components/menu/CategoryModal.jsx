import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save, AlertCircle, Tag, List, LayoutGrid } from 'lucide-react';
import categoryService from '../../services/categoryService';

const CategoryModal = ({ isOpen, onClose, onCategoryUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('Không thể tải danh sách danh mục.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await categoryService.createCategory({ 
        name: newCategoryName, 
        description: newCategoryDescription 
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSuccess('Đã thêm danh mục mới!');
      fetchCategories();
      if (onCategoryUpdate) onCategoryUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm danh mục.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;

    setIsLoading(true);
    setError('');
    try {
      await categoryService.deleteCategory(id);
      setSuccess('Đã xóa danh mục!');
      fetchCategories();
      if (onCategoryUpdate) onCategoryUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Không thể xóa danh mục. Có thể vẫn còn sản phẩm thuộc danh mục này.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category._id);
    setEditName(category.name);
    setEditDescription(category.description || '');
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      await categoryService.updateCategory(id, { 
        name: editName, 
        description: editDescription 
      });
      setEditingCategory(null);
      setSuccess('Đã cập nhật danh mục!');
      fetchCategories();
      if (onCategoryUpdate) onCategoryUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật danh mục.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="text-2xl font-black text-stone-900 flex items-center gap-3 tracking-tight">
              <Tag className="text-amber-600" size={28} />
              QUẢN LÝ DANH MỤC
            </h3>
            <p className="text-stone-500 text-sm font-medium mt-1">Phân loại thực đơn của bạn một cách khoa học.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-stone-200/50 rounded-2xl transition-all text-stone-400 hover:text-stone-900 hover:rotate-90 duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow overflow-hidden flex flex-col md:flex-row">
          {/* Left: Form */}
          <div className="w-full md:w-1/3 p-8 border-r border-stone-100 bg-stone-50/30">
            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} /> Thêm mới
            </h4>
            
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-stone-700 mb-2 uppercase tracking-wider">Tên danh mục</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="VD: Cà phê, Trà sữa..."
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-bold text-stone-800 placeholder:text-stone-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-stone-700 mb-2 uppercase tracking-wider">Mô tả (Không bắt buộc)</label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Nhập mô tả cho danh mục..."
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-medium text-stone-800 placeholder:text-stone-300 shadow-sm resize-none h-24"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !newCategoryName.trim()}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-black hover:bg-amber-600 transition-all shadow-lg shadow-stone-200 active:scale-95 disabled:opacity-50 disabled:hover:bg-stone-900 flex items-center justify-center gap-2 uppercase tracking-wider text-sm"
              >
                <Save size={18} /> Lưu danh mục
              </button>
            </form>

            {/* Notifications */}
            <div className="mt-8 space-y-3">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-start gap-3 animate-shake">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Right: Table */}
          <div className="flex-grow p-8 overflow-y-auto bg-white">
            <h4 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <List size={16} /> Danh sách hiện có
            </h4>

            <div className="border border-stone-100 rounded-2xl overflow-hidden shadow-sm bg-stone-50/20">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest w-1/3">Tên danh mục</th>
                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Mô tả</th>
                    <th className="px-6 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center text-stone-300">
                          <LayoutGrid size={48} className="mb-2 opacity-20" />
                          <p className="text-sm font-bold uppercase tracking-widest">Chưa có danh mục nào</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat._id} className="group hover:bg-stone-50 transition-colors">
                        <td className="px-6 py-4 align-top">
                          {editingCategory === cat._id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              autoFocus
                              className="w-full px-3 py-2 border-2 border-amber-500 rounded-lg outline-none font-bold text-stone-800"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(cat._id);
                                if (e.key === 'Escape') setEditingCategory(null);
                              }}
                            />
                          ) : (
                            <span className="font-bold text-stone-800 uppercase tracking-wide group-hover:text-amber-600 transition-colors">
                              {cat.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {editingCategory === cat._id ? (
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-amber-500 rounded-lg outline-none font-medium text-stone-800 resize-none h-20"
                              placeholder="Nhập mô tả..."
                            />
                          ) : (
                            <p className="text-stone-500 text-sm line-clamp-2 italic font-medium">
                              {cat.description || 'Chưa có mô tả...'}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                          <div className="flex items-center justify-end gap-2">
                            {editingCategory === cat._id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(cat._id)}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Lưu"
                                >
                                  <Save size={18} />
                                </button>
                                <button
                                  onClick={() => setEditingCategory(null)}
                                  className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Hủy"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(cat)}
                                  className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                  title="Sửa"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Xóa"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
              <AlertCircle size={12} />
              Mẹo: Nhấn Enter để lưu nhanh khi đang chỉnh sửa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
