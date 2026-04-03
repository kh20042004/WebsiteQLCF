import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, AlertCircle, CheckCircle2, Menu as MenuIcon, Coffee, Tag } from 'lucide-react';
import itemService from '../services/itemService';
import MenuTable from '../components/menu/MenuTable';
import MenuModal from '../components/menu/MenuModal';
import CategoryModal from '../components/menu/CategoryModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const MenuPage = () => {
  // State quản lý danh sách và trạng thái tải
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State quản lý Modal và Dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null
  });
  
  // State hiện thông báo nhanh
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  /**
   * Tải danh sách món ăn từ API
   */
  const fetchItems = useCallback(async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const data = await itemService.getAllItems({ search: searchQuery });
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách thực đơn.');
      showNotification('Lỗi khi tải dữ liệu!', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Delay nhẹ khi search để tránh gọi API quá nhiều
    const delayDebounce = setTimeout(() => {
      fetchItems(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchItems]);

  /**
   * Hiển thị thông báo (Toast)
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  /**
   * Xử lý Lưu (Thêm mới hoặc Cập nhật)
   */
  const handleSaveItem = async (formData) => {
    const itemName = formData.get('name');
    try {
      if (editingItem) {
        await itemService.updateItem(editingItem._id, formData);
        showNotification(`Đã cập nhật món "${itemName}" thành công`);
      } else {
        await itemService.createItem(formData);
        showNotification(`Đã thêm món "${itemName}" vào thực đơn`);
      }
      fetchItems(searchTerm);
    } catch (err) {
      throw new Error(err.message || 'Lỗi khi lưu thông tin món ăn');
    }
  };

  /**
   * Xử lý Xóa món ăn
   */
  const handleConfirmDelete = async () => {
    const item = confirmDialog.item;
    try {
      await itemService.deleteItem(item._id);
      showNotification(`Đã xóa món "${item.name}" thành công`, 'success');
      fetchItems(searchTerm);
      setConfirmDialog({ isOpen: false, item: null });
    } catch (err) {
      showNotification(err.message || 'Lỗi khi xóa món ăn', 'error');
    }
  };

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

      {/* Toolbar & Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-100/50 rounded-2xl text-amber-900 border border-amber-200/40 shadow-inner">
            <Coffee size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight uppercase flex items-center gap-2">
              QUẢN LÝ THỰC ĐƠN
              <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-bold ml-2">BETA</span>
            </h1>
            <p className="text-stone-500 font-medium">Tùy chỉnh các món ăn và đồ uống của quán bạn.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/30 flex flex-col sm:flex-row items-stretch gap-3 lg:w-max min-w-[300px]">
          {/* Ô tìm kiếm */}
          <div className="relative group flex-grow lg:min-w-[350px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold group-focus-within:text-amber-600 group-hover:scale-110 transition-all" size={18} />
            <input
              type="text"
              placeholder="Tìm món ăn (vd: Cà phê, Trà sữa...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-stone-100/30 border border-stone-100 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-stone-400 text-stone-800 font-medium"
            />
          </div>

          {/* Nút Quản lý danh mục */}
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-6 py-3 bg-white text-stone-900 border-2 border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2 font-bold active:scale-95"
          >
            <Tag size={18} />
            QUẢN LÝ DANH MỤC
          </button>

          {/* Nút thêm mới */}
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-stone-300 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            THÊM MÓN MỚI
          </button>
        </div>
      </div>

      {/* Table Section */}
      {error && (
        <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
              <AlertCircle />
            </div>
            <div>
              <p className="font-bold">Đã xảy ra lỗi!</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchItems(searchTerm)}
            className="px-5 py-2.5 bg-rose-200/50 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} /> THỬ LẠI
          </button>
        </div>
      )}

      <MenuTable
        items={items}
        isLoading={isLoading}
        onEdit={(item) => { setEditingItem(item); setIsModalOpen(true); }}
        onDelete={(item) => setConfirmDialog({ isOpen: true, item })}
      />

      {/* Modals & Dialogs */}
      <MenuModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSaveItem}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryUpdate={() => fetchItems(searchTerm)}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa món"
        message={`Bạn có chắc muốn xóa món "${confirmDialog.item?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa món"
        cancelText="Hủy bỏ"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
        variant="danger"
      />
    </div>
  );
};

export default MenuPage;
