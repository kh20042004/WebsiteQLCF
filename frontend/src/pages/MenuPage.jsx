import React, { useEffect, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { MenuProvider, useMenu } from '../context/MenuContext';
import MenuTable from '../components/menu/MenuTable';
import MenuModal from '../components/modals/MenuModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useModal from '../hooks/useModal';

/**
 * MenuManagementPage - Trang quản lý Menu của Coffee Shop
 */
const MenuManagementContent = () => {
  const {
    items,
    categories,
    loading,
    error,
    searchQuery,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
    setSearch
  } = useMenu();

  const { showSuccessNotification, showErrorNotification } = useModal();

  // Local state for modals and dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    item: null,
    loading: false
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems({ search: searchQuery });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, fetchItems]);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      if (editingItem) {
        result = await updateItem(editingItem._id, formData);
      } else {
        result = await createItem(formData);
      }

      if (result.success) {
        showSuccessNotification(
          editingItem ? 'Cập nhật món thành công!' : 'Thêm món mới thành công!'
        );
        handleCloseModal();
      } else {
        showErrorNotification(result.error || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      showErrorNotification('Có lỗi xảy ra khi lưu dữ liệu');
      console.error(err);
    }
  };

  const handleOpenDeleteConfirm = (item) => {
    setConfirmDialog({
      isOpen: true,
      item: item,
      loading: false
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDialog.item) return;

    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      const result = await deleteItem(confirmDialog.item._id);
      if (result.success) {
        showSuccessNotification(`Đã xóa món "${confirmDialog.item.name}" thành công`);
        setConfirmDialog({ isOpen: false, item: null, loading: false });
      } else {
        showErrorNotification(result.error || 'Lỗi khi xóa món');
        setConfirmDialog(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      showErrorNotification('Có lỗi xảy ra khi xóa món');
      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <main className="flex-grow max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      
      {/* Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 animate-pop">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-1.5">
            Quản Lý Thực Đơn
          </h1>
          <p className="text-sm font-medium text-stone-500">
            Quản lý danh sách món ăn, giá cả và danh mục của quán.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative group w-full sm:w-80">
            <Icon 
              icon="lucide:search" 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors" 
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên món..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-300 transition-all text-sm shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-all"
              >
                <Icon icon="lucide:x" className="text-sm" />
              </button>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all shadow-lg active:scale-[0.98] group"
          >
            <Icon icon="lucide:plus" className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            Thêm Món Mới
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="animate-pop" style={{ animationDelay: '0.1s' }}>
        {error ? (
          <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
            <Icon icon="lucide:alert-circle" className="text-3xl text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-rose-900 mb-1">Đã có lỗi xảy ra</h3>
            <p className="text-rose-600 mb-4">{error}</p>
            <button
              onClick={() => fetchItems()}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-bold"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <MenuTable
            items={items}
            loading={loading}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteConfirm}
          />
        )}
      </div>

      {/* Modal & Dialogs */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        categories={categories}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa món"
        message={`Bạn có chắc chắn muốn xóa món "${confirmDialog.item?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa món"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null, loading: false })}
        isLoading={confirmDialog.loading}
        variant="danger"
      />
    </main>
  );
};

// Wrap the content with MenuProvider
const MenuPage = () => (
  <MenuProvider>
    <MenuManagementContent />
  </MenuProvider>
);

export default MenuPage;
