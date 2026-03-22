import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle2, AlertCircle, Trash2, Eye } from 'lucide-react';
import { getOrders, deleteOrder } from '../services/orderService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, serving, done, cancelled
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // State cho dialog xóa
  const [notification, setNotification] = useState(null); // State cho notification

  // Fetch orders từ API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      console.log('Orders data:', data);
      const ordersArray = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersArray);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải đơn hàng');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Hàm xóa đơn hàng
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(o => o._id !== orderId));
      setConfirmDelete(null);
      setError(null);
      
      // Hiển thị thông báo thành công
      setNotification({
        type: 'success',
        message: 'Xóa đơn hàng thành công!'
      });
      
      // Auto-dismiss sau 3 giây
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      setError(`Lỗi xóa đơn hàng: ${err.message}`);
      console.error('Error deleting order:', err);
    }
  };

  // Filter orders
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  // Status badge styles
  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Chờ xử lý' },
      serving: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Đang phục vụ' },
      done: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', label: 'Đã hủy' }
    };
    return config[status] || config.pending;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + '₫';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-amber-600" />
          <p className="text-stone-600 font-medium">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right-full duration-300 border ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="font-medium">{notification.message}</p>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Đơn Hàng Mới</h1>
          <p className="text-stone-500 mt-1">Quản lý và theo dõi các đơn hàng từ khách hàng</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-800">Có lỗi xảy ra</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng cộng', value: orders.length, color: 'bg-stone-50 border-stone-200' },
          { label: 'Chờ xử lý', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Đang phục vụ', value: orders.filter(o => o.status === 'serving').length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Hoàn thành', value: orders.filter(o => o.status === 'done').length, color: 'bg-green-50 border-green-200' }
        ].map((stat, idx) => (
          <div key={idx} className={`${stat.color} border rounded-lg p-4`}>
            <p className="text-sm text-stone-600 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-stone-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'Tất cả' },
          { value: 'pending', label: 'Chờ xử lý' },
          { value: 'serving', label: 'Đang phục vụ' },
          { value: 'done', label: 'Hoàn thành' },
          { value: 'cancelled', label: 'Đã hủy' }
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              filter === btn.value
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Orders Table/List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-stone-200">
          <Clock className="w-12 h-12 mx-auto mb-3 text-stone-400" />
          <p className="text-stone-600 font-medium">Không có đơn hàng</p>
          <p className="text-sm text-stone-500 mt-1">Không tìm thấy đơn hàng với bộ lọc này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            
            return (
              <div
                key={order._id}
                className="bg-white border border-stone-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-stone-900">
                        Đơn #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    {/* Order Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-stone-500">Bàn</p>
                        <p className="font-medium text-stone-900">{order.table?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Số món</p>
                        <p className="font-medium text-stone-900">{itemCount} món</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Tổng tiền</p>
                        <p className="font-medium text-amber-600">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-stone-500">Thời gian</p>
                        <p className="font-medium text-stone-900">{formatDate(order.createdAt).split(' ')[1]}</p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 text-sm text-stone-600">
                        <p className="font-medium mb-1">Danh sách món:</p>
                        <p>{order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600"
                      title="Chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(order._id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-lg font-semibold text-stone-900">Xác nhận xóa đơn hàng</h2>
            </div>

            <div className="p-6">
              <p className="text-stone-600 mb-6">
                Bạn chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDeleteOrder(confirmDelete)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-stone-900">
                Chi tiết đơn #{selectedOrder._id?.slice(-6).toUpperCase()}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-500 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-500">Bàn</p>
                  <p className="font-medium text-stone-900">{selectedOrder.table?.name}</p>
                </div>
                <div>
                  <p className="text-stone-500">Trạng thái</p>
                  <p className="font-medium text-stone-900 capitalize">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-stone-500">Tổng tiền</p>
                  <p className="font-medium text-amber-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                </div>
                <div>
                  <p className="text-stone-500">Ngày tạo</p>
                  <p className="font-medium text-stone-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {selectedOrder.note && (
                <div>
                  <p className="text-stone-500 text-sm">Ghi chú</p>
                  <p className="text-stone-900">{selectedOrder.note}</p>
                </div>
              )}

              <div>
                <p className="text-stone-500 text-sm font-medium mb-2">Danh sách món</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-stone-600">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
