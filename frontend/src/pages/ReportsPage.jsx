import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert/Alert';
import { getOrders, checkoutOrder } from '../services/orderService';

function ReportsPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Gọi API lấy danh sách đơn hàng
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            setOrders(data || []);
        } catch (error) {
            setAlert({ type: 'error', message: 'Không thể tải dữ liệu đơn hàng.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Xử lý nút Thanh toán
    const handleCheckout = async (orderId) => {
        if (!window.confirm('Xác nhận thanh toán cho đơn hàng này (Tiền mặt)?')) return;

        try {
            await checkoutOrder(orderId, 'Cash');
            setAlert({ type: 'success', message: '✅ Thanh toán thành công! Đã giải phóng bàn.' });
            fetchOrders(); // Load lại danh sách sau khi thanh toán
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Lỗi khi thanh toán' });
        }
    };

    // Các hàm format 
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN');
    };

    // --- TÍNH TOÁN DỮ LIỆU BÁO CÁO (REPORT) ---
    const pendingOrders = orders.filter(o => o.status !== 'Completed');
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return (
        <div className="flex-grow p-6 max-w-7xl mx-auto w-full">
            {/* Alert */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    autoClose={3000}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800">Thanh Toán & Báo Cáo</h1>
                    <p className="text-stone-500 mt-1">Quản lý hóa đơn và theo dõi tổng quan các đơn hàng.</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors shadow-sm font-medium flex items-center gap-2"
                >
                    🔄 Làm mới dữ liệu
                </button>
            </div>

            {/* KHỐI BÁO CÁO: 3 Thẻ Thống Kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-amber-500">
                    <h3 className="text-stone-500 font-medium mb-1">Đơn Chờ Thanh Toán</h3>
                    <p className="text-4xl font-bold text-amber-600">{pendingOrders.length}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-emerald-500">
                    <h3 className="text-stone-500 font-medium mb-1">Đơn Đã Hoàn Thành</h3>
                    <p className="text-4xl font-bold text-emerald-600">{completedOrders.length}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-blue-500">
                    <h3 className="text-stone-500 font-medium mb-1">Tổng Tiền Thu Được</h3>
                    <p className="text-4xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
                </div>
            </div>

            {/* KHỐI THANH TOÁN: Bảng danh sách đơn hàng */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 p-4 border-b border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800">📋 Danh sách đơn hàng trong hệ thống</h3>
                </div>

                {loading ? (
                    <div className="text-center p-12 text-stone-500 animate-pulse">Đang tải danh sách...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-12 text-stone-400 italic">Chưa có đơn hàng nào trong hệ thống.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-stone-50/50 text-stone-500 text-sm uppercase border-b border-stone-200">
                                    <th className="p-4 font-medium">Mã Đơn</th>
                                    <th className="p-4 font-medium">Thời Gian</th>
                                    <th className="p-4 font-medium">Vị Trí</th>
                                    <th className="p-4 font-medium text-right">Tổng Tiền</th>
                                    <th className="p-4 font-medium text-center">Trạng Thái</th>
                                    <th className="p-4 font-medium text-center">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4 font-semibold text-blue-600">
                                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                                        </td>

                                        <td className="p-4 text-stone-500 text-sm">
                                            {formatTime(order.createdAt)}
                                        </td>

                                        <td className="p-4 font-medium text-stone-700">
                                            {order.table?.name ? `🪑 ${order.table.name}` : '🛍️ Mang đi'}
                                        </td>

                                        <td className="p-4 text-right font-bold text-stone-800">
                                            {formatCurrency(order.totalAmount)}
                                        </td>

                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Completed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {order.status === 'Completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">
                                            {order.status !== 'Completed' ? (
                                                <button
                                                    onClick={() => handleCheckout(order._id)}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm"
                                                >
                                                    Thanh Toán
                                                </button>
                                            ) : (
                                                <span className="text-stone-400 text-sm font-medium">Hoàn tất</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsPage;