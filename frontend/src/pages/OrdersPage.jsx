import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import orderService from '../services/orderService';

// ---- HELPER ----
const STATUS_CONFIG = {
  pending:   { label: 'Chờ Xử Lý',  color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',  icon: 'solar:clock-circle-bold' },
  serving:   { label: 'Đang Phục Vụ', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   icon: 'solar:serving-dish-bold' },
  done:      { label: 'Hoàn Thành',  color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: 'solar:check-circle-bold' },
  cancelled: { label: 'Đã Hủy',      color: 'bg-red-100 text-red-700',      dot: 'bg-red-400',    icon: 'solar:close-circle-bold' },
};

const NEXT_STATUS = {
  pending:   ['serving', 'cancelled'],
  serving:   ['done', 'cancelled'],
  done:      [],
  cancelled: [],
};

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('vi-VN') + '₫';

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ============================================================
// COMPONENT CHÍNH
// ============================================================
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [toast, setToast] = useState(null);

  // ---- Fetch danh sách đơn ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const data = await orderService.getAllOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ---- Toast ----
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Mở modal chi tiết ----
  const openDetail = async (order) => {
    try {
      const detail = await orderService.getOrderById(order._id);
      setSelectedOrder(detail);
      setDetailModal(true);
    } catch (err) {
      showToast('Không thể tải chi tiết đơn hàng', 'error');
    }
  };

  // ---- Cập nhật trạng thái từ danh sách ----
  const handleQuickStatus = async (order, newStatus, e) => {
    e.stopPropagation();
    try {
      await orderService.updateOrderStatus(order._id, newStatus);
      showToast(`Đã chuyển sang "${STATUS_CONFIG[newStatus].label}"`);
      fetchOrders();
      // Nếu đang xem detail thì cập nhật luôn
      if (selectedOrder?._id === order._id) {
        const detail = await orderService.getOrderById(order._id);
        setSelectedOrder(detail);
      }
    } catch (err) {
      showToast(err.message || 'Cập nhật thất bại', 'error');
    }
  };

  // ---- Tính stats ----
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    serving: orders.filter(o => o.status === 'serving').length,
    done: orders.filter(o => o.status === 'done').length,
  };

  return (
    <main className="flex-grow max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all animate-pop ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'}`}>
          <Icon icon={toast.type === 'error' ? 'solar:close-circle-bold' : 'solar:check-circle-bold'} className="text-lg" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 animate-pop" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-1.5">Quản Lý Đơn Hàng</h1>
          <p className="text-sm font-medium text-stone-500">Theo dõi, cập nhật trạng thái và quản lý tất cả đơn hàng.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-all shadow-[0_2px_10px_-3px_rgba(0,0,0,0.3)] active:scale-[0.98]"
        >
          <Icon icon="solar:refresh-bold" className="text-base" />
          Làm Mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-pop" style={{ animationDelay: '0.15s' }}>
        {[
          { label: 'Tất Cả', value: stats.total, icon: 'solar:list-bold', color: 'bg-stone-800', text: 'text-white' },
          { label: 'Chờ Xử Lý', value: stats.pending, icon: 'solar:clock-circle-bold', color: 'bg-amber-500', text: 'text-white' },
          { label: 'Đang Phục Vụ', value: stats.serving, icon: 'solar:serving-dish-bold', color: 'bg-blue-500', text: 'text-white' },
          { label: 'Hoàn Thành', value: stats.done, icon: 'solar:check-circle-bold', color: 'bg-emerald-500', text: 'text-white' },
        ].map(card => (
          <div key={card.label} className={`rounded-2xl p-5 ${card.color} shadow-sm flex items-center gap-4`}>
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon icon={card.icon} className={`text-2xl ${card.text}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${card.text}`}>{card.value}</p>
              <p className={`text-xs font-bold ${card.text} opacity-75`}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 animate-pop" style={{ animationDelay: '0.2s' }}>
        {[
          { value: '', label: 'Tất Cả' },
          { value: 'pending', label: 'Chờ Xử Lý' },
          { value: 'serving', label: 'Đang Phục Vụ' },
          { value: 'done', label: 'Hoàn Thành' },
          { value: 'cancelled', label: 'Đã Hủy' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === f.value
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-300 hover:text-stone-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden animate-pop" style={{ animationDelay: '0.25s' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Icon icon="solar:bill-list-bold" className="text-6xl text-stone-300" />
            <p className="text-sm font-bold text-stone-400">Không có đơn hàng nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Mã Đơn</th>
                <th className="text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Bàn</th>
                <th className="text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Số Món</th>
                <th className="text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Tổng Tiền</th>
                <th className="text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Trạng Thái</th>
                <th className="text-left px-4 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Thời Gian</th>
                <th className="text-right px-6 py-4 text-[11px] font-black uppercase tracking-widest text-stone-500">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const nextStatuses = NEXT_STATUS[order.status] || [];
                return (
                  <tr
                    key={order._id}
                    onClick={() => openDetail(order)}
                    className="hover:bg-stone-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Mã đơn */}
                    <td className="px-6 py-4">
                      <span className="font-black text-stone-900 font-mono text-xs">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    {/* Bàn */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center">
                          <Icon icon="solar:armchair-bold" className="text-stone-500 text-sm" />
                        </div>
                        <span className="font-bold text-stone-700 text-xs">
                          {order.table?.name || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Số món */}
                    <td className="px-4 py-4">
                      <span className="font-bold text-stone-600 text-xs">
                        {order.items?.length || 0} món
                      </span>
                    </td>

                    {/* Tổng tiền */}
                    <td className="px-4 py-4">
                      <span className="font-black text-amber-600">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Thời gian */}
                    <td className="px-4 py-4">
                      <span className="text-[11px] text-stone-400 font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Hành động */}
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {nextStatuses.map(ns => {
                          const nCfg = STATUS_CONFIG[ns];
                          return (
                            <button
                              key={ns}
                              onClick={(e) => handleQuickStatus(order, ns, e)}
                              title={`Chuyển sang: ${nCfg.label}`}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95 ${
                                ns === 'cancelled'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : ns === 'done'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                              }`}
                            >
                              {nCfg.label}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => openDetail(order)}
                          className="w-8 h-8 rounded-lg bg-stone-50 text-stone-500 hover:bg-stone-100 flex items-center justify-center transition-all"
                          title="Xem chi tiết"
                        >
                          <Icon icon="solar:eye-bold" className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => { setDetailModal(false); setSelectedOrder(null); }}
          onStatusChange={async (newStatus) => {
            try {
              await orderService.updateOrderStatus(selectedOrder._id, newStatus);
              showToast(`Đã chuyển sang "${STATUS_CONFIG[newStatus].label}"`);
              const updated = await orderService.getOrderById(selectedOrder._id);
              setSelectedOrder(updated);
              fetchOrders();
            } catch (err) {
              showToast(err.message || 'Cập nhật thất bại', 'error');
            }
          }}
          onUpdateItemQty={async (orderItemId, quantity) => {
            try {
              const updated = await orderService.updateItemInOrder(selectedOrder._id, orderItemId, quantity);
              setSelectedOrder(updated);
              showToast('Đã cập nhật số lượng món');
              fetchOrders();
            } catch (err) {
              showToast(err.message || 'Cập nhật thất bại', 'error');
            }
          }}
          onRemoveItem={async (orderItemId) => {
            try {
              const updated = await orderService.removeItemFromOrder(selectedOrder._id, orderItemId);
              setSelectedOrder(updated);
              showToast('Đã xóa món khỏi đơn hàng');
              fetchOrders();
            } catch (err) {
              showToast(err.message || 'Xóa thất bại', 'error');
            }
          }}
        />
      )}

      <style>{`
        @keyframes pop { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>
    </main>
  );
};

// ============================================================
// MODAL CHI TIẾT ĐƠN HÀNG
// ============================================================
const OrderDetailModal = ({ order, onClose, onStatusChange, onUpdateItemQty, onRemoveItem }) => {
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [updating, setUpdating] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const nextStatuses = NEXT_STATUS[order.status] || [];
  const isEditable = order.status !== 'done' && order.status !== 'cancelled';

  const startEdit = (item) => {
    setEditingItemId(item._id);
    setEditQty(item.quantity);
  };

  const submitEdit = async (orderItemId) => {
    if (editQty < 1) return;
    setUpdating(true);
    await onUpdateItemQty(orderItemId, editQty);
    setEditingItemId(null);
    setUpdating(false);
  };

  const handleRemove = async (orderItemId) => {
    if (!window.confirm('Xác nhận xóa món này khỏi đơn hàng?')) return;
    setUpdating(true);
    await onRemoveItem(orderItemId);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden animate-pop border border-white/20 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className={`px-7 py-6 border-b border-stone-100 flex items-center justify-between ${order.status === 'done' ? 'bg-emerald-50/40' : order.status === 'cancelled' ? 'bg-red-50/30' : ''}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md text-white ${cfg.dot.replace('bg-', 'bg-')}`} style={{ background: order.status === 'pending' ? '#f59e0b' : order.status === 'serving' ? '#3b82f6' : order.status === 'done' ? '#10b981' : '#f87171' }}>
              <Icon icon={cfg.icon} className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  Đơn #{order._id.slice(-6).toUpperCase()}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                Bàn: <strong className="text-stone-600">{order.table?.name || 'N/A'}</strong>
                &nbsp;·&nbsp;{new Date(order.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all">
            <Icon icon="solar:close-circle-bold" className="text-xl" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-grow overflow-y-auto px-7 py-5 space-y-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-3">
            Danh Sách Món ({order.items?.length || 0})
          </h3>

          {order.items?.length === 0 && (
            <div className="flex flex-col items-center py-10 text-stone-300 opacity-60">
              <Icon icon="solar:cart-large-4-linear" className="text-4xl mb-2" />
              <p className="text-xs font-bold">Chưa có món nào</p>
            </div>
          )}

          {order.items?.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-200 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-100 flex items-center justify-center flex-shrink-0">
                <Icon icon="solar:coffee-cup-bold" className="text-stone-400 text-lg" />
              </div>

              <div className="flex-grow min-w-0">
                <p className="font-black text-stone-800 text-sm truncate">{item.name}</p>
                <p className="text-[11px] text-stone-400 font-medium">{(item.price || 0).toLocaleString('vi-VN')}₫ / món</p>
              </div>

              {/* Edit quantity inline */}
              {editingItemId === item._id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={1}
                    value={editQty}
                    onChange={e => setEditQty(Number(e.target.value))}
                    className="w-16 text-center border border-amber-300 rounded-lg py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button onClick={() => submitEdit(item._id)} disabled={updating}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-black rounded-lg hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50">
                    Lưu
                  </button>
                  <button onClick={() => setEditingItemId(null)}
                    className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-black rounded-lg hover:bg-stone-200 active:scale-95 transition-all">
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-stone-700">x{item.quantity}</p>
                    <p className="text-sm font-black text-amber-600">{((item.price || 0) * item.quantity).toLocaleString('vi-VN')}₫</p>
                  </div>
                  {isEditable && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEdit(item)}
                        className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center text-xs transition-all"
                        title="Sửa số lượng">
                        <Icon icon="solar:pen-bold" />
                      </button>
                      <button onClick={() => handleRemove(item._id)} disabled={updating}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-xs transition-all disabled:opacity-50"
                        title="Xóa món">
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer: tổng tiền + cập nhật trạng thái */}
        <div className="px-7 py-5 border-t border-stone-100 bg-stone-50/50 space-y-4">
          {/* Ghi chú */}
          {order.note && (
            <div className="flex items-start gap-2 text-xs text-stone-500">
              <Icon icon="solar:document-text-bold" className="text-stone-400 mt-0.5 flex-shrink-0" />
              <span><strong>Ghi chú:</strong> {order.note}</span>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-stone-500">Tổng Cộng</span>
            <span className="text-2xl font-black text-amber-600">{(order.totalPrice || 0).toLocaleString('vi-VN')}₫</span>
          </div>

          {/* Nút chuyển trạng thái */}
          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.map(ns => {
                const nCfg = STATUS_CONFIG[ns];
                return (
                  <button
                    key={ns}
                    onClick={() => onStatusChange(ns)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      ns === 'cancelled'
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : ns === 'done'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'
                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                    }`}
                  >
                    <Icon icon={nCfg.icon} className="text-base" />
                    {nCfg.label}
                  </button>
                );
              })}
            </div>
          )}

          {nextStatuses.length === 0 && (
            <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider ${cfg.color}`}>
              <Icon icon={cfg.icon} className="text-base" />
              Đơn đã {cfg.label.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
