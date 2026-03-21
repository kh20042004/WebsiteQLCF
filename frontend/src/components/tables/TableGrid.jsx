import React from 'react';
import TableCard from './TableCard';

/**
 * TableGrid Component - Grid container cho table cards
 * Responsive: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop)
 *
 * @param {Array} tables - Danh sách tables để hiển thị
 * @param {Function} onCreateOrder - Callback khi tạo đơn hàng
 * @param {Function} onCancelReservation - Callback khi hủy đặt bàn
 * @param {Function} onSeatGuest - Callback khi tiếp khách
 * @param {Function} onDeleteTable - Callback khi xóa bàn
 * @param {Function} onEditTable - Callback khi chỉnh sửa bàn
 */
const TableGrid = ({
  tables = [],
  onCreateOrder,
  onCancelReservation,
  onSeatGuest,
  onDeleteTable,
  onEditTable
}) => {
  if (tables.length === 0) {
    return null; // Let parent component handle empty state
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 sm:gap-x-4 lg:gap-x-5 gap-y-[50px]">
      {tables.map((table, index) => (
        <TableCard
          key={table._id}
          table={table}
          onCreateOrder={onCreateOrder}
          onCancelReservation={onCancelReservation}
          onSeatGuest={onSeatGuest}
          onDeleteTable={onDeleteTable}
          onEditTable={onEditTable}
          animationDelay={0.3 + (index * 0.05)} // Staggered animation
        />
      ))}
    </div>
  );
};

export default TableGrid;