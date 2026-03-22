import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import useModal from '../../hooks/useModal';
import CheckoutModal from './CheckoutModal';
import { useTableDispatch, TABLE_ACTIONS } from '../../context/TableContext';
import { apiGet } from '../../services/api';

/**
 * BillPanel Component - Sliding side panel để hiển thị hóa đơn
 * Opens from right side với glassmorphism design
 */
const BillPanel = () => {
  const { isBillPanelOpen, currentTableForBill, closeBillPanel } = useModal();
  const dispatch = useTableDispatch();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Mock order data for demonstration
  const mockOrderItems = [
    {
      id: 1,
      name: 'Caramel Macchiato',
      description: 'Đá, Ít Đường',
      icon: 'solar:cup-hot-linear',
      price: 82500,
      quantity: 2
    },
    {
      id: 2,
      name: 'Almond Croissant',
      description: 'Làm Nóng',
      icon: 'solar:pie-chart-2-linear',
      price: 67500,
      quantity: 1
    },
    {
      id: 3,
      name: 'Cold Brew',
      description: 'Lớn',
      icon: 'solar:cup-paper-linear',
      price: 90000,
      quantity: 1
    }
  ];

  // Calculate totals from REAL data
  const currentOrder = typeof currentTableForBill?.currentOrderId === 'object' ? currentTableForBill.currentOrderId : null;
  const orderItems = currentOrder?.items || [];
  
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.08; // 8%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if (!isBillPanelOpen || !currentTableForBill) {
    return null;
  }

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isBillPanelOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeBillPanel}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-full sm:max-w-md bg-white shadow-2xl z-50 transform transition-enhanced duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col border-l border-stone-200 animate-slide-in-right ${
          isBillPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900">
              Chi Tiết Hóa Đơn
            </h2>
            <p className="text-xs text-stone-500">
              {currentTableForBill.name} • Đơn #{
                typeof currentTableForBill.currentOrderId === 'object' 
                  ? currentTableForBill.currentOrderId._id.slice(-6).toUpperCase() 
                  : (currentTableForBill.currentOrderId || 'N/A')
              }
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={closeBillPanel}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Icon icon="solar:close-circle-linear" className="text-xl" />
          </button>
        </div>

        {/* Panel Body (Scrollable Order Items) */}
        <div className="flex-grow overflow-y-auto p-6 no-scrollbar bg-[#fafaf9]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
            Món Đã Gọi
          </h3>

          <div className="space-y-4">
            {/* Sử dụng dữ liệu thật từ Order nếu có */}
            {typeof currentTableForBill.currentOrderId === 'object' && currentTableForBill.currentOrderId.items ? (
              currentTableForBill.currentOrderId.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start bg-white p-3 rounded-xl border border-stone-100 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0 text-stone-600">
                      <Icon icon="solar:cup-hot-linear" className="text-lg" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                        {item.name || (item.item && typeof item.item === 'object' ? item.item.name : 'Món không tên')}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-1 uppercase font-medium tracking-wide">
                        {item.item && typeof item.item === 'object' && item.item.category ? item.item.category.name : 'Thực đơn'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-stone-900">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-[11px] text-stone-500">SL: {item.quantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-400 text-center py-4 italic">Chưa có món nào</p>
            )}
          </div>

          {/* Note section */}
          <div className="mt-6">
            <label className="text-xs font-semibold text-stone-700 block mb-2">
              Thêm Ghi Chú
            </label>
            <textarea
              className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none h-20 placeholder:text-stone-400"
              placeholder="Ghi chú tùy chọn cho thu ngân..."
            ></textarea>
          </div>
        </div>

        {/* Panel Footer (Summary & Actions) */}
        <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Tạm Tính</span>
              <span className="font-medium text-stone-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Thuế (8%)</span>
              <span className="font-medium text-stone-800">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-stone-100 mt-2">
              <span className="font-semibold text-stone-900">Tổng Cộng</span>
              <span className="font-semibold text-xl tracking-tight text-amber-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 px-4 bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-100 transition-all flex justify-center items-center gap-2">
              <Icon icon="solar:printer-linear" />
              In
            </button>

            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="py-3 px-4 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
            >
              Thanh Toán Ngay
              <Icon icon="solar:arrow-right-linear" />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal Integration */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        order={currentOrder}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={(payload) => {
          console.log("PAYLOAD THANH TOÁN:", payload);
          // Hiển thị thông báo thành công (Bạn có thể dùng Toast thay vì Alert)
          alert(`🎉 THANH TOÁN THÀNH CÔNG!\n- Tổng tiền: ${payload.grandTotal.toLocaleString()}₫\n- Phương thức: ${payload.paymentMethod.toUpperCase()}`);
          
          setIsCheckoutOpen(false);
          closeBillPanel();
          
          // Refresh lại sơ đồ bàn bằng cách gọi lại API và dispatch
          apiGet('/tables').then(res => {
            if (res) {
              dispatch({ type: TABLE_ACTIONS.FETCH_TABLES_SUCCESS, payload: res });
            }
          });
        }}
      />
    </>
  );
};

export default BillPanel;