/**
 * Trang Quản Lý Kho / Nguyên Liệu (InventoryPage)
 *
 * Chức năng:
 * - Xem danh sách nguyên liệu (có tìm kiếm, lọc theo danh mục & trạng thái)
 * - Thêm mới nguyên liệu (modal)
 * - Sửa thông tin nguyên liệu (modal)
 * - Nhập thêm hàng / Restock (modal)
 * - Xóa nguyên liệu (xác nhận trước khi xóa)
 * - Hiển thị cảnh báo khi nguyên liệu sắp hết
 *
 * Quyền: CHỈ ADMIN mới truy cập được trang này
 * (Staff chỉ xem kho qua Dashboard, không vào trang quản lý)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, AlertCircle, CheckCircle2,
  Package, Edit2, Trash2, X, AlertTriangle,
  PackagePlus, ArrowDown
} from 'lucide-react';
import inventoryService from '../services/inventoryService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { isAdmin } from '../utils/auth'; // Helper kiểm tra quyền admin

const InventoryPage = () => {
  // ============================================================
  // STATE
  // ============================================================

  // Danh sách nguyên liệu
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', category: 'ingredient',
    unit: '', quantity: '', minQuantity: '10',
    price: '', supplier: ''
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal nhập hàng (restock)
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockData, setRestockData] = useState({ quantity: '', price: '', note: '' });
  const [restockError, setRestockError] = useState('');
  const [isRestocking, setIsRestocking] = useState(false);

  // Dialog xác nhận xóa
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null });

  // Toast thông báo
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ============================================================
  // FUNCTIONS
  // ============================================================

  /** Hiển thị thông báo (Toast) */
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  /** Tải danh sách nguyên liệu từ API */
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.status = filterStatus;

      const data = await inventoryService.getAllInventory(params);
      setInventoryItems(data?.inventory || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nguyên liệu.');
      showNotification('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterCategory, filterStatus]);

  // Tải dữ liệu khi thay đổi
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInventory();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [fetchInventory]);

  /** Mở modal thêm mới */
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '', description: '', category: 'ingredient',
      unit: '', quantity: '', minQuantity: '10',
      price: '', supplier: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  /** Mở modal chỉnh sửa */
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || 'ingredient',
      unit: item.unit || '',
      quantity: item.quantity || '',
      minQuantity: item.minQuantity || '10',
      price: item.price || '',
      supplier: item.supplier || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  /** Mở modal nhập hàng */
  const handleOpenRestockModal = (item) => {
    setRestockItem(item);
    setRestockData({ quantity: '', price: item.price || '', note: '' });
    setRestockError('');
    setIsRestockOpen(true);
  };

  /** Xử lý thay đổi form */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  /** Validate form */
  const validateForm = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập tên nguyên liệu';
    if (!formData.unit.trim()) return 'Vui lòng nhập đơn vị tính';
    return '';
  };

  /** Submit form (thêm mới hoặc cập nhật) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) { setFormError(err); return; }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        minQuantity: Number(formData.minQuantity) || 10,
        price: Number(formData.price) || 0,
      };

      if (editingItem) {
        await inventoryService.updateInventory(editingItem._id, payload);
        showNotification(`Đã cập nhật "${formData.name}" thành công`);
      } else {
        await inventoryService.createInventory(payload);
        showNotification(`Đã thêm "${formData.name}" vào kho thành công`);
      }
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu nguyên liệu');
    } finally {
      setIsSaving(false);
    }
  };

  /** Submit nhập hàng (restock) */
  const handleRestock = async (e) => {
    e.preventDefault();
    if (!restockData.quantity || Number(restockData.quantity) <= 0) {
      setRestockError('Số lượng nhập phải lớn hơn 0');
      return;
    }

    try {
      setIsRestocking(true);
      await inventoryService.restockInventory(restockItem._id, {
        quantity: Number(restockData.quantity),
        price: Number(restockData.price) || 0,
        note: restockData.note || ''
      });
      showNotification(`Đã nhập thêm ${restockData.quantity} ${restockItem.unit} "${restockItem.name}" thành công`);
      setIsRestockOpen(false);
      fetchInventory();
    } catch (err) {
      setRestockError(err.message || 'Lỗi khi nhập hàng');
    } finally {
      setIsRestocking(false);
    }
  };

  /** Xóa nguyên liệu */
  const handleConfirmDelete = async () => {
    const item = confirmDialog.item;
    try {
      await inventoryService.deleteInventory(item._id);
      showNotification(`Đã xóa "${item.name}" thành công`);
      fetchInventory();
      setConfirmDialog({ isOpen: false, item: null });
    } catch (err) {
      showNotification(err.message || 'Lỗi khi xóa nguyên liệu', 'error');
    }
  };

  /** Lấy style trạng thái */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'in_stock': return { label: 'Còn hàng', color: 'bg-emerald-100 text-emerald-700' };
      case 'low_stock': return { label: 'Sắp hết', color: 'bg-amber-100 text-amber-700' };
      case 'out_of_stock': return { label: 'Hết hàng', color: 'bg-rose-100 text-rose-700' };
      default: return { label: status, color: 'bg-stone-100 text-stone-600' };
    }
  };

  /** Lấy tên danh mục tiếng Việt */
  const getCategoryName = (cat) => {
    const names = { ingredient: 'Nguyên liệu', topping: 'Topping', packaging: 'Bao bì', other: 'Khác' };
    return names[cat] || cat;
  };

  /** Format số tiền */
  const formatVND = (amount) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 animate-in fade-in duration-700">

      {/* Toast */}
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
          <div className="p-4 bg-teal-100/50 rounded-2xl text-teal-900 border border-teal-200/40 shadow-inner">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight uppercase">
              QUẢN LÝ KHO
            </h1>
            <p className="text-stone-500 font-medium">Theo dõi nguyên liệu và tồn kho của quán.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/30 flex flex-col sm:flex-row items-stretch gap-3 lg:w-max min-w-[300px]">
          {/* Tìm kiếm */}
          <div className="relative group flex-grow lg:min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-600 transition-all" size={18} />
            <input type="text" placeholder="Tìm nguyên liệu..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-100/30 border border-stone-100 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-stone-400 text-stone-800 font-medium" />
          </div>

          {/* Lọc danh mục */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:ring-2 focus:ring-teal-500/20 outline-none">
            <option value="">Tất cả loại</option>
            <option value="ingredient">Nguyên liệu</option>
            <option value="topping">Topping</option>
            <option value="packaging">Bao bì</option>
            <option value="other">Khác</option>
          </select>

          {/* Lọc trạng thái */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:ring-2 focus:ring-teal-500/20 outline-none">
            <option value="">Tất cả TT</option>
            <option value="in_stock">Còn hàng</option>
            <option value="low_stock">Sắp hết</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>

          {/* Nút thêm mới - CHỈ ADMIN */}
          {isAdmin() && (
            <button onClick={handleOpenAddModal}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-stone-300 active:scale-95 group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              THÊM MỚI
            </button>
          )}
        </div>
      </div>

      {/* ===== LỖI ===== */}
      {error && (
        <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-800 flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600"><AlertCircle /></div>
            <div><p className="font-bold">Đã xảy ra lỗi!</p><p className="text-sm opacity-80">{error}</p></div>
          </div>
          <button onClick={fetchInventory}
            className="px-5 py-2.5 bg-rose-200/50 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <RefreshCw size={16} /> THỬ LẠI
          </button>
        </div>
      )}

      {/* ===== BẢNG DANH SÁCH ===== */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : inventoryItems.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Chưa có nguyên liệu nào</p>
          <p className="text-sm">Bấm "Thêm mới" để thêm nguyên liệu đầu tiên vào kho.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Nguyên liệu</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Danh mục</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Tồn kho</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Giá nhập</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">NCC</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventoryItems.map((item) => {
                  const statusStyle = getStatusStyle(item.status);
                  const isWarning = item.status === 'low_stock' || item.status === 'out_of_stock';
                  return (
                    <tr key={item._id} className={`hover:bg-stone-50/50 transition-colors ${isWarning ? 'bg-amber-50/30' : ''}`}>
                      {/* Tên nguyên liệu */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isWarning && <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />}
                          <div>
                            <p className="font-semibold text-stone-900 text-sm">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-xs font-medium">
                          {getCategoryName(item.category)}
                        </span>
                      </td>

                      {/* Tồn kho */}
                      <td className="px-6 py-4">
                        <p className={`text-sm font-bold ${isWarning ? 'text-amber-700' : 'text-stone-900'}`}>
                          {item.quantity} {item.unit}
                        </p>
                        <p className="text-xs text-stone-400">Tối thiểu: {item.minQuantity} {item.unit}</p>
                      </td>

                      {/* Giá nhập */}
                      <td className="px-6 py-4 text-sm text-stone-700 font-medium">
                        {formatVND(item.price)}/{item.unit}
                      </td>

                      {/* Nhà cung cấp */}
                      <td className="px-6 py-4 text-sm text-stone-600 max-w-[150px] truncate">
                        {item.supplier || '—'}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút nhập hàng */}
                          <button onClick={() => handleOpenRestockModal(item)}
                            className="p-2 text-stone-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Nhập hàng">
                            <PackagePlus size={16} />
                          </button>
                          {/* Nút sửa - CHỈ ADMIN */}
                          {isAdmin() && (
                            <button onClick={() => handleOpenEditModal(item)}
                              className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                              <Edit2 size={16} />
                            </button>
                          )}
                          {/* Nút xóa - CHỈ ADMIN */}
                          {isAdmin() && (
                            <button onClick={() => setConfirmDialog({ isOpen: true, item })}
                              className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
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
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingItem ? '✏️ Sửa Nguyên Liệu' : '📦 Thêm Nguyên Liệu Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" /><span>{formError}</span>
                </div>
              )}

              {/* Tên + Danh mục */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Tên nguyên liệu *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange}
                    placeholder="VD: Cà phê hạt Robusta" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Danh mục</label>
                  <select name="category" value={formData.category} onChange={handleFormChange} disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium">
                    <option value="ingredient">Nguyên liệu</option>
                    <option value="topping">Topping</option>
                    <option value="packaging">Bao bì</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange}
                  placeholder="Mô tả chi tiết..." disabled={isSaving} rows={2}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium resize-none" />
              </div>

              {/* Đơn vị + SL + SL tối thiểu */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Đơn vị *</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleFormChange}
                    placeholder="kg, lít, gói" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Số lượng</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange}
                    placeholder="0" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">SL tối thiểu</label>
                  <input type="number" name="minQuantity" value={formData.minQuantity} onChange={handleFormChange}
                    placeholder="10" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
              </div>

              {/* Giá + NCC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Giá nhập (VNĐ)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleFormChange}
                    placeholder="150000" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nhà cung cấp</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange}
                    placeholder="VD: Trung Nguyên" disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
                </div>
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
                  ) : editingItem ? '💾 Cập nhật' : '✅ Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL NHẬP HÀNG (RESTOCK) ===== */}
      {isRestockOpen && restockItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsRestockOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-lg font-bold text-stone-900">📦 Nhập Hàng</h2>
              <button onClick={() => setIsRestockOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRestock} className="p-6 space-y-4">
              {/* Thông tin nguyên liệu */}
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                <p className="text-sm font-bold text-teal-800">{restockItem.name}</p>
                <p className="text-xs text-teal-600 mt-0.5">
                  Tồn kho hiện tại: <strong>{restockItem.quantity} {restockItem.unit}</strong>
                </p>
              </div>

              {restockError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle size={16} /><span>{restockError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Số lượng nhập thêm *</label>
                <input type="number" value={restockData.quantity}
                  onChange={(e) => { setRestockData(prev => ({ ...prev, quantity: e.target.value })); setRestockError(''); }}
                  placeholder="VD: 20" disabled={isRestocking}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Giá nhập (VNĐ)</label>
                <input type="number" value={restockData.price}
                  onChange={(e) => setRestockData(prev => ({ ...prev, price: e.target.value }))}
                  disabled={isRestocking}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Ghi chú</label>
                <input type="text" value={restockData.note}
                  onChange={(e) => setRestockData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="VD: Nhập từ NCC Trung Nguyên" disabled={isRestocking}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium" />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsRestockOpen(false)}
                  className="flex-1 py-3 border-2 border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50">
                  Hủy
                </button>
                <button type="submit" disabled={isRestocking}
                  className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isRestocking ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                  ) : '📦 Nhập Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DIALOG XÁC NHẬN XÓA ===== */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa nguyên liệu"
        message={`Bạn có chắc muốn xóa "${confirmDialog.item?.name}" khỏi kho? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
        variant="danger"
      />
    </div>
  );
};

export default InventoryPage;
