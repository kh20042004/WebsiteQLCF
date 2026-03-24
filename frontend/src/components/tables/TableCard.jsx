import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import StatusBadge from './StatusBadge';
import useModal from '../../hooks/useModal';

/**
 * TableCard Component - Reusable card cho hiển thị bàn
 * Hỗ trợ 3 trạng thái: available, occupied, reserved
 *
 * @param {Object} table - Table object từ API
 * @param {Function} onCreateOrder - Callback khi tạo đơn hàng (available)
 * @param {Function} onCancelReservation - Callback khi hủy đặt bàn (reserved)
 * @param {Function} onSeatGuest - Callback khi tiếp khách (reserved)
 * @param {Function} onDeleteTable - Callback khi xóa bàn
 * @param {Function} onEditTable - Callback khi chỉnh sửa bàn
 * @param {Number} animationDelay - Delay cho animation (optional)
 */
const TableCard = ({
  table,
  onCreateOrder,
  onCancelReservation,
  onSeatGuest,
  onDeleteTable,
  onEditTable,
  animationDelay = 0
}) => {
  const { openBillPanel } = useModal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCalculateBill = () => {
    openBillPanel(table);
  };

  const handleCreateOrder = () => {
    if (onCreateOrder) {
      onCreateOrder(table);
    } else {
      alert('Tạo đơn hàng - Tính năng đang phát triển');
    }
  };

  const handleCancelReservation = () => {
    if (onCancelReservation) {
      onCancelReservation(table);
    } else {
      alert('Hủy đặt bàn - Tính năng đang phát triển');
    }
  };

  const handleSeatGuest = () => {
    if (onSeatGuest) {
      onSeatGuest(table);
    } else {
      alert('Tiếp khách - Tính năng đang phát triển');
    }
  };

  const handleDeleteTable = () => {
    if (onDeleteTable) {
      onDeleteTable(table);
    } else {
      alert('Xóa bàn - Tính năng đang phát triển');
    }
    setIsDropdownOpen(false);
  };

  const handleEditTable = () => {
    if (onEditTable) {
      onEditTable(table);
    } else {
      alert('Chỉnh sửa bàn - Tính năng đang phát triển');
    }
    setIsDropdownOpen(false);
  };

  // Style classes based on status
  const getCardClasses = () => {
    const baseClasses = "group relative rounded-2xl border p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] transition-enhanced flex flex-col min-h-[220px] animate-pop card-hover";

    switch (table.status) {
      case 'available':
        return `${baseClasses} bg-white border-stone-100 hover:shadow-md hover:border-stone-200`;
      case 'occupied':
        return `${baseClasses} bg-white border-stone-200 hover:border-stone-300`;
      case 'reserved':
        return `${baseClasses} bg-gradient-to-b from-white to-[#fffbf5] border-amber-200/50 hover:shadow-md hover:border-amber-300/60`;
      default:
        return `${baseClasses} bg-white border-stone-200`;
    }
  };

  return (
    <article
      className={getCardClasses()}
      style={{ animationDelay: `${animationDelay}s` }}
      role="region"
      aria-labelledby={`table-${table._id}-name`}
      aria-describedby={`table-${table._id}-status table-${table._id}-details`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={table.status} />
            <h3
              id={`table-${table._id}-name`}
              className="font-semibold text-stone-900 text-base tracking-tight"
            >
              {table.name}
            </h3>
          </div>
          <span
            id={`table-${table._id}-details`}
            className="text-[11px] font-medium text-stone-400"
          >
            {table.notes || `Sức chứa: ${table.capacity} người`}
          </span>
        </div>

        {/* Options Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
            className="text-stone-400 hover:text-stone-900 transition-colors p-1 bg-stone-50 rounded-md focus-visible-enhanced"
            aria-label={`Mở menu tùy chọn cho ${table.name}`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
          >
            <Icon icon="solar:menu-dots-bold" className="text-lg" aria-hidden="true" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />

              {/* Dropdown Content */}
              <div
                className="absolute top-8 right-0 z-20 w-36 bg-white rounded-lg shadow-lg border border-stone-100 py-1"
                role="menu"
                aria-labelledby={`table-${table._id}-menu-button`}
              >
                {/* Chỉnh sửa món ăn (Chỉ khi đang dùng) */}
                {table.status === 'occupied' && (
                  <button
                    onClick={() => {
                      onCreateOrder(table); // Tận dụng callback tạo đơn để sửa đơn
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors focus-visible-enhanced"
                    role="menuitem"
                  >
                    <Icon icon="solar:tea-cup-outline" className="text-amber-500" />
                    Chỉnh sửa món
                  </button>
                )}

                {/* Xem chi tiết bàn (Chỉ khi đang dùng hoặc đã đặt) */}
                {table.status !== 'available' && (
                  <button
                    onClick={() => {
                      handleCalculateBill();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors focus-visible-enhanced"
                    role="menuitem"
                  >
                    <Icon icon="solar:eye-outline" className="text-stone-500" />
                    Xem chi tiết
                  </button>
                )}

                <div className="h-px bg-stone-100 my-1 mx-2"></div>

                <button
                  onClick={handleEditTable}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEditTable();
                    } else if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 transition-colors focus-visible-enhanced"
                  role="menuitem"
                  aria-label={`Chỉnh sửa thông tin ${table.name}`}
                >
                  <Icon icon="solar:pen-outline" className="text-stone-500" aria-hidden="true" />
                  Quản lý bàn
                </button>
                <button
                  onClick={handleDeleteTable}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDeleteTable();
                    } else if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors focus-visible-enhanced"
                  role="menuitem"
                  aria-label={`Xóa bàn ${table.name}`}
                >
                  <Icon icon="solar:trash-bin-trash-outline" className="text-red-500" aria-hidden="true" />
                  Xóa bàn
                </button>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Content - varies by status */}
      <div className="flex-grow">
        {table.status === 'available' && <AvailableContent />}
        {table.status === 'occupied' && <OccupiedContent table={table} />}
        {table.status === 'reserved' && <ReservedContent table={table} />}
      </div>

      {/* Card Actions */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        {table.status === 'available' && (
          <button
            onClick={handleCreateOrder}
            className="w-full py-2 bg-transparent text-stone-400 border border-dashed border-stone-200 rounded-lg text-xs font-medium hover:text-stone-700 hover:border-stone-300 transition-enhanced focus-visible-enhanced"
            aria-label={`Tạo đơn hàng mới cho ${table.name}`}
          >
            Tạo Đơn Hàng
          </button>
        )}

        {table.status === 'occupied' && (
          <button
            onClick={handleCalculateBill}
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#fafaf9] border border-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-white hover:border-stone-300 hover:shadow-sm transition-enhanced cursor-pointer group/btn focus-visible-enhanced"
            aria-label={`Tính hóa đơn cho ${table.name}`}
          >
            <Icon icon="solar:calculator-linear" className="text-stone-400 group-hover/btn:text-stone-700 transition-colors" aria-hidden="true" />
            Tính Hóa Đơn
          </button>
        )}

        {table.status === 'reserved' && (
          <div className="flex gap-2">
            <button
              onClick={handleCancelReservation}
              className="flex-1 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 transition-enhanced focus-visible-enhanced"
              aria-label={`Hủy đặt bàn ${table.name}`}
            >
              Hủy
            </button>
            <button
              onClick={handleSeatGuest}
              className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.4)] transition-enhanced focus-visible-enhanced"
              aria-label={`Tiếp khách vào ${table.name}`}
            >
              Tiếp Khách
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

// Content Components for each status
const AvailableContent = () => (
  <div className="flex-grow flex flex-col items-center justify-center text-center opacity-70">
    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
      <Icon icon="solar:armchair-linear" className="text-2xl" />
    </div>
    <span className="text-xs font-medium text-stone-500">Sẵn sàng phục vụ</span>
  </div>
);

const OccupiedContent = ({ table }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  // Lấy dữ liệu từ order hiện tại (nếu đã được populate)
  const currentOrder = table.currentOrderId;
  const isPopulated = currentOrder && typeof currentOrder === 'object';

  const orderData = {
    orderId: isPopulated ? (currentOrder.orderNo || `#${currentOrder._id.slice(-6).toUpperCase()}`) : (currentOrder || 'N/A'),
    itemCount: isPopulated ? (currentOrder.items?.length || 0) : 0,
    total: isPopulated ? (currentOrder.totalPrice || 0) : 0
  };

  return (
    <div className="flex-grow flex flex-col justify-center space-y-2.5 bg-white/50 rounded-xl p-3 border border-stone-100">
      <div className="flex justify-between items-center text-sm">
        <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Mã Đơn</span>
        <span className="font-bold text-stone-800 tracking-tight">
          {orderData.orderId}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Món</span>
        <span className="font-bold text-stone-800">{orderData.itemCount} Món</span>
      </div>
      <div className="flex justify-between items-end text-sm pt-1">
        <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Tổng Tạm Tính</span>
        <span className="font-black text-amber-600 text-lg">
          {formatCurrency(orderData.total)}
        </span>
      </div>
    </div>
  );
};

const ReservedContent = ({ table }) => {
  // Mock reservation data - in real app this would come from table.reservation
  const mockReservation = {
    time: '18:30 Hôm nay',
    customerName: 'Ông Anderson',
    guestCount: 4,
    notes: 'Sinh nhật, cần ghế cao'
  };

  return (
    <div className="flex-grow flex flex-col justify-center space-y-3 bg-white/60 rounded-xl p-3 border border-amber-100/50">
      <div className="flex items-center gap-2 text-sm">
        <Icon icon="solar:clock-circle-linear" className="text-amber-600" />
        <span className="font-medium text-stone-800">{mockReservation.time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Icon icon="solar:user-linear" className="text-stone-400" />
        <span className="text-stone-600 text-xs">
          {mockReservation.customerName} ({mockReservation.guestCount} người)
        </span>
      </div>
      {mockReservation.notes && (
        <p className="text-xs text-stone-500 italic mt-1">"{mockReservation.notes}"</p>
      )}
    </div>
  );
};

export default TableCard;