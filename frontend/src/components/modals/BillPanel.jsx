import React, { useState } from 'react'; // Thêm useState
import { Icon } from '@iconify/react';
import useModal from '../../hooks/useModal';
import { checkoutOrder } from '../../services/orderService'; // 1. IMPORT HÀM THANH TOÁN CỦA ANH VÀO ĐÂY

/**
 * BillPanel Component - Sliding side panel để hiển thị hóa đơn
 * Opens from right side với glassmorphism design
 */
const BillPanel = () => {
  const { isBillPanelOpen, currentTableForBill, closeBillPanel } = useModal();
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái đang xử lý thanh toán

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

  // Calculate totals
  const subtotal = mockOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.08; // 8%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  // ==========================================
  // 2. HÀM XỬ LÝ KHI BẤM NÚT "THANH TOÁN NGAY"
  // ==========================================
  const handlePayment = async () => {
    // Nếu bàn này chưa có ID đơn hàng (do đang xài mock data) thì chặn lại
    if (!currentTableForBill?.currentOrderId) {
      alert('Bàn này chưa có đơn hàng thực tế (đang dùng mock data). Hãy tạo đơn hàng cho bàn này trước!');
      return;
    }

    if (window.confirm(`Xác nhận thanh toán ${formatCurrency(total)} cho ${currentTableForBill.name}?`)) {
      setIsProcessing(true);
      try {
        await checkoutOrder(currentTableForBill.currentOrderId, 'Cash');
        alert('✅ Thanh toán thành công! Bàn đã được dọn trống.');
        
        // Đóng panel sau khi thanh toán xong
        closeBillPanel(); 
        
        // Note: Chỗ này lý tưởng nhất là báo cho Component cha biết để refresh lại lưới Bàn.
        // Tạm thời bạn Kiệt có thể bấm nút "Làm mới" hoặc f5 để thấy bàn trống.
        window.location.reload(); 
        
      } catch (error) {
        alert(error.message || 'Có lỗi xảy ra khi thanh toán.');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  // ==========================================

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
              {currentTableForBill.name} • Đơn #{currentTableForBill.currentOrderId?.substring(0, 6) || 'ORD-092'}
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
            {mockOrderItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start bg-white p-3 rounded-xl border border-stone-100 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0 text-stone-600">
                    <Icon icon={item.icon} className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-stone-900">{item.name}</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-stone-900">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-[11px] text-stone-500">SL: {item.quantity}</span>
                </div>
              </div>
            ))}
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

            {/* 3. GẮN SỰ KIỆN CLICK VÀO NÚT NÀY */}
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className={`py-3 px-4 rounded-xl text-sm font-medium flex justify-center items-center gap-2 transition-all ${
                isProcessing 
                  ? 'bg-stone-400 cursor-not-allowed text-white' 
                  : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? 'Đang xử lý...' : 'Thanh Toán Ngay'}
              {!isProcessing && <Icon icon="solar:arrow-right-linear" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillPanel;