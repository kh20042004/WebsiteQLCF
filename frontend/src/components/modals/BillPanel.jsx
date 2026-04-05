import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import useModal from '../../hooks/useModal';
import CheckoutModal from './CheckoutModal';
import { useTableDispatch, TABLE_ACTIONS } from '../../context/TableContext';
import { apiGet, apiPost } from '../../services/api';

/**
 * BillPanel Component - Panel trượt từ phải sang để hiển thị hóa đơn
 *
 * Chức năng:
 * - Hiển thị danh sách món đã gọi của bàn đang được chọn
 * - Tính tổng tiền tạm tính + thuế 8%
 * - Mở CheckoutModal để tiến hành thanh toán chi tiết (chọn PTTT, giảm giá...)
 * - Sau khi thanh toán thành công → gọi API thật để cập nhật trạng thái DB
 * - Làm mới sơ đồ bàn để UI phản ánh bàn vừa được giải phóng
 */
const BillPanel = () => {
  const { isBillPanelOpen, currentTableForBill, closeBillPanel } = useModal();
  const dispatch = useTableDispatch();

  // Trạng thái mở/đóng modal thanh toán POS chi tiết
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lấy dữ liệu order thật từ bàn hiện tại (currentOrderId có thể là object nếu đã populate)
  const currentOrder =
    typeof currentTableForBill?.currentOrderId === 'object'
      ? currentTableForBill.currentOrderId
      : null;

  // Lấy danh sách món từ order (mảng items trong document Order)
  const orderItems = currentOrder?.items || [];

  // Tính tổng tiền các món (chưa bao gồm thuế)
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Thuế VAT 8% — đồng bộ với CheckoutModal để tránh sai lệch
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Hàm định dạng số tiền sang dạng "X.XXX₫" theo chuẩn VN
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN').format(amount) + '₫';

  // Nếu panel chưa được mở hoặc chưa có bàn nào được chọn → không render
  if (!isBillPanelOpen || !currentTableForBill) return null;

  /**
   * Hàm xử lý khi nhân viên bấm "Xác Nhận" trong CheckoutModal
   *
   * Luồng:
   * 1. Gọi API POST /orders/:id/checkout để đánh dấu đơn là 'done' và giải phóng bàn
   * 2. Đóng modal thanh toán và bill panel
   * 3. Gọi lại API /tables để làm mới sơ đồ bàn trên UI
   *
   * @param {Object} payload - Dữ liệu từ CheckoutModal gồm orderId, paymentMethod, grandTotal...
   */
  const handleCheckoutConfirm = async (payload) => {
    try {
      // Bước 1: Gọi API thanh toán — chuyển đơn sang 'done', bàn về 'available'
      await apiPost(`/orders/${payload.orderId}/checkout`, {
        paymentMethod: payload.paymentMethod,
      });

      // Bước 2: Đóng toàn bộ UI thanh toán
      setIsCheckoutOpen(false);
      closeBillPanel();

      // Bước 3: Làm mới danh sách bàn để UI phản ánh trạng thái mới nhất
      // API /tables có thể trả về { tables: [...], count: X } hoặc mảng trực tiếp
      // → phải extract mảng trước khi dispatch lên reducer (reducer cần array thuần)
      const tablesRes = await apiGet('/tables');
      const tablesArray = Array.isArray(tablesRes)
        ? tablesRes
        : tablesRes?.tables || [];

      dispatch({ type: TABLE_ACTIONS.FETCH_TABLES_SUCCESS, payload: tablesArray });
    } catch (error) {
      // Thông báo lỗi nếu API thất bại (mất kết nối, đơn không hợp lệ, v.v.)
      alert(`❌ Thanh toán thất bại: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  return (
    <>
      {/* ---- OVERLAY: Nền mờ phía sau panel, click để đóng ---- */}
      <div
        className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isBillPanelOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeBillPanel}
      />

      {/* ---- SLIDING PANEL: Trượt từ phải sang trái ---- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-full sm:max-w-md bg-white shadow-2xl z-50 transform transition-enhanced duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col border-l border-stone-200 animate-slide-in-right ${
          isBillPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ---- HEADER: Tên bàn + mã đơn + nút đóng ---- */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-stone-900">
              Chi Tiết Hóa Đơn
            </h2>
            {/* Hiển thị tên bàn và 6 ký tự cuối của mã đơn */}
            <p className="text-xs text-stone-500">
              {currentTableForBill?.name} • Đơn #
              {typeof currentTableForBill?.currentOrderId === 'object' &&
              currentTableForBill?.currentOrderId?._id
                ? currentTableForBill.currentOrderId._id.slice(-6).toUpperCase()
                : 'N/A'}
            </p>
          </div>

          {/* Nút X để đóng panel */}
          <button
            onClick={closeBillPanel}
            className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Đóng hóa đơn"
          >
            <Icon icon="solar:close-circle-linear" className="text-xl" />
          </button>
        </div>

        {/* ---- BODY: Danh sách món đã gọi (có thể cuộn) ---- */}
        <div className="flex-grow overflow-y-auto p-6 no-scrollbar bg-[#fafaf9]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">
            Món Đã Gọi
          </h3>

          <div className="space-y-4">
            {/* Kiểm tra xem currentOrderId đã được populate với dữ liệu items chưa */}
            {typeof currentTableForBill.currentOrderId === 'object' &&
            currentTableForBill.currentOrderId.items ? (
              currentTableForBill.currentOrderId.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start bg-white p-3 rounded-xl border border-stone-100 shadow-sm"
                >
                  <div className="flex gap-3">
                    {/* Icon cố định đại diện cho món đồ uống */}
                    <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0 text-stone-600">
                      <Icon icon="solar:cup-hot-linear" className="text-lg" />
                    </div>
                    <div>
                      {/* Tên món — ưu tiên lấy từ field 'name' snapshot trong order */}
                      <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                        {item.name ||
                          (item.item && typeof item.item === 'object'
                            ? item.item.name
                            : 'Món không tên')}
                      </h4>
                      {/* Tên danh mục nếu item đã được populate */}
                      <p className="text-[11px] text-stone-500 mt-1 uppercase font-medium tracking-wide">
                        {item.item &&
                        typeof item.item === 'object' &&
                        item.item.category
                          ? item.item.category.name
                          : 'Thực đơn'}
                      </p>
                    </div>
                  </div>

                  {/* Đơn giá và số lượng */}
                  <div className="text-right">
                    <span className="block text-sm font-medium text-stone-900">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      SL: {item.quantity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Hiển thị khi chưa có món nào hoặc order chưa được populate
              <p className="text-sm text-stone-400 text-center py-4 italic">
                Chưa có món nào
              </p>
            )}
          </div>

          {/* Ô ghi chú bổ sung cho thu ngân (không bắt buộc) */}
          <div className="mt-6">
            <label className="text-xs font-semibold text-stone-700 block mb-2">
              Thêm Ghi Chú
            </label>
            <textarea
              className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none h-20 placeholder:text-stone-400"
              placeholder="Ghi chú tùy chọn cho thu ngân..."
            />
          </div>
        </div>

        {/* ---- FOOTER: Tóm tắt tài chính + Nút hành động ---- */}
        <div className="p-6 bg-white border-t border-stone-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          {/* Bảng tổng tiền: tạm tính, thuế, tổng cộng */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Tạm Tính</span>
              <span className="font-medium text-stone-800">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-500">Thuế (8%)</span>
              <span className="font-medium text-stone-800">
                {formatCurrency(tax)}
              </span>
            </div>
            {/* Đường kẻ phân cách và tổng cuối */}
            <div className="flex justify-between text-sm pt-2 border-t border-stone-100 mt-2">
              <span className="font-semibold text-stone-900">Tổng Cộng</span>
              <span className="font-semibold text-xl tracking-tight text-amber-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Hai nút hành động: In hóa đơn và Thanh toán ngay */}
          <div className="grid grid-cols-2 gap-3">
            {/* Nút in hóa đơn — gọi window.print() */}
            <button
              onClick={() => window.print()}
              className="py-3 px-4 bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-100 transition-all flex justify-center items-center gap-2"
            >
              <Icon icon="solar:printer-linear" />
              In
            </button>

            {/* Nút mở CheckoutModal để thu ngân chọn PTTT, giảm giá, xác nhận */}
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

      {/* ---- CHECKOUT MODAL: Giao diện POS đầy đủ ---- */}
      {/* Chỉ render khi có order thật (currentOrder khác null) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        order={currentOrder}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleCheckoutConfirm}
      />
    </>
  );
};

export default BillPanel;