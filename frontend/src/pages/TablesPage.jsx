import React, { useEffect, useState } from 'react';
import useTables from '../hooks/useTables';
import useModal from '../hooks/useModal';
import TableGrid from '../components/tables/TableGrid';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EditTableModal from '../components/modals/EditTableModal';

const TablesPage = () => {
  const {
    tables,
    filteredTables,
    currentFilter,
    stats,
    loading,
    error,
    fetchTables,
    fetchStats,
    setFilter,
    updateTableStatus,
    deleteTable,
    updateTable
  } = useTables();

  const {
    openAddTableModal,
    showSuccessNotification,
    showErrorNotification
  } = useModal();

  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    table: null,
    action: null
  });

  // State for edit modal
  const [editingTable, setEditingTable] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchTables();
    fetchStats();
  }, []);

  // Callback handlers for table actions
  const handleCreateOrder = async (table) => {
    console.log('Create order for table:', table.name);

    try {
      // Update table status to occupied
      const result = await updateTableStatus(table._id, 'occupied');

      if (result.success) {
        showSuccessNotification(`Đã tạo đơn hàng cho ${table.name}`);
        // TODO: Navigate to order creation page or open order modal
      } else {
        showErrorNotification(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      showErrorNotification('Có lỗi xảy ra khi tạo đơn hàng');
      console.error('Error creating order:', error);
    }
  };

  const handleCancelReservation = async (table) => {
    console.log('Cancel reservation for table:', table.name);

    try {
      // Update table status to available
      const result = await updateTableStatus(table._id, 'available');

      if (result.success) {
        showSuccessNotification(`Đã hủy đặt bàn ${table.name}`);
      } else {
        showErrorNotification(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      showErrorNotification('Có lỗi xảy ra khi hủy đặt bàn');
      console.error('Error canceling reservation:', error);
    }
  };

  const handleSeatGuest = async (table) => {
    console.log('Seat guest at table:', table.name);

    try {
      // Update table status to occupied
      const result = await updateTableStatus(table._id, 'occupied');

      if (result.success) {
        showSuccessNotification(`Khách đã được tiếp vào ${table.name}`);
        // TODO: Could also create an order here
      } else {
        showErrorNotification(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      showErrorNotification('Có lỗi xảy ra khi tiếp khách');
      console.error('Error seating guest:', error);
    }
  };

  const handleDeleteTable = (table) => {
    setConfirmDialog({
      isOpen: true,
      table: table,
      action: 'delete'
    });
  };

  const handleEditTable = (table) => {
    console.log('Edit table:', table.name);
    setEditingTable(table);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTable(null);
  };

  const confirmDeleteTable = async () => {
    const table = confirmDialog.table;

    try {
      const result = await deleteTable(table._id);

      if (result.success) {
        showSuccessNotification(`Bàn "${table.name}" đã được xóa thành công`);
        setConfirmDialog({ isOpen: false, table: null, action: null });
      } else {
        showErrorNotification(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      showErrorNotification('Có lỗi xảy ra khi xóa bàn');
      console.error('Error deleting table:', error);
    }
  };

  const cancelConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, table: null, action: null });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-500">Đang tải dữ liệu bàn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Lỗi: {error}</p>
          <button
            onClick={() => fetchTables()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 animate-pop" style={{animationDelay: '0.1s'}}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-1.5">
            Quản Lý Bàn
          </h1>
          <p className="text-sm font-medium text-stone-500">
            Theo dõi chỗ ngồi, quản lý đơn hàng và xử lý hóa đơn theo thời gian thực.
          </p>
        </div>

        <button
          onClick={openAddTableModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] active:scale-[0.98]"
        >
          <span>➕</span>
          Thêm Bàn Mới
        </button>
      </div>

      {/* Filters & Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-8 animate-pop" style={{animationDelay: '0.2s'}}>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            currentFilter === 'all'
              ? 'bg-white border border-stone-200 shadow-sm text-stone-800 hover:bg-stone-50'
              : 'bg-white/50 border border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-800 hover:border-stone-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-stone-800"></span>
          Tất Cả Bàn ({stats.total || tables.length})
        </button>

        <button
          onClick={() => setFilter('available')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            currentFilter === 'available'
              ? 'bg-white border border-stone-200 shadow-sm text-stone-800 hover:bg-stone-50'
              : 'bg-white/50 border border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-800 hover:border-stone-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
          Trống ({stats.available || 0})
        </button>

        <button
          onClick={() => setFilter('occupied')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            currentFilter === 'occupied'
              ? 'bg-white border border-stone-200 shadow-sm text-stone-800 hover:bg-stone-50'
              : 'bg-white/50 border border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-800 hover:border-stone-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
          Đang Dùng ({stats.occupied || 0})
        </button>

        <button
          onClick={() => setFilter('reserved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
            currentFilter === 'reserved'
              ? 'bg-white border border-stone-200 shadow-sm text-stone-800 hover:bg-stone-50'
              : 'bg-white/50 border border-stone-200/60 text-stone-500 hover:bg-white hover:text-stone-800 hover:border-stone-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
          Đã Đặt ({stats.reserved || 0})
        </button>
      </div>

      {/* Tables Grid or Empty State */}
      {filteredTables.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🪑</div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            {currentFilter === 'all' ? 'Chưa có bàn nào' : `Không có bàn ${
              currentFilter === 'available' ? 'trống' :
              currentFilter === 'occupied' ? 'đang dùng' : 'đã đặt'
            }`}
          </h3>
          <p className="text-stone-500 mb-6">
            {currentFilter === 'all'
              ? 'Hãy thêm bàn mới để bắt đầu quản lý quán cà phê của bạn.'
              : 'Thử thay đổi bộ lọc để xem các bàn khác.'
            }
          </p>
          {currentFilter === 'all' && (
            <button
              onClick={openAddTableModal}
              className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              Thêm Bàn Đầu Tiên
            </button>
          )}
        </div>
      ) : (
        <TableGrid
          tables={filteredTables}
          onCreateOrder={handleCreateOrder}
          onCancelReservation={handleCancelReservation}
          onSeatGuest={handleSeatGuest}
          onDeleteTable={handleDeleteTable}
          onEditTable={handleEditTable}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa bàn"
        message={`Bạn có chắc muốn xóa bàn "${confirmDialog.table?.name || ''}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa Bàn"
        cancelText="Hủy"
        onConfirm={confirmDeleteTable}
        onCancel={cancelConfirmDialog}
        variant="danger"
      />

      {/* Edit Table Modal */}
      <EditTableModal
        table={editingTable}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
      />

    </main>
  );
};

export default TablesPage;