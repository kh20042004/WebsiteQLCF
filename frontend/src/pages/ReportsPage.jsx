/**
 * Trang: Báo Cáo Doanh Thu (ReportsPage)
 *
 * Mục đích:
 * - Hiển thị thống kê tổng quan: doanh thu hôm nay, số đơn hoàn thành, trung bình/đơn
 * - Hiển thị top 5 món bán chạy nhất trong ngày
 * - Hiển thị lịch sử toàn bộ đơn hàng (chỉ đọc, không có nút thanh toán)
 *
 * Lưu ý thiết kế:
 * - Trang này KHÔNG xử lý thanh toán — việc đó thuộc về trang Tổng Quan Bàn (BillPanel)
 * - Dùng 2 API riêng: /reports/daily (thống kê) và /orders (lịch sử)
 */

import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert/Alert';
import { getOrders } from '../services/orderService';
import api from '../services/api';

function ReportsPage() {
    // ---- STATE ----
    const [orders, setOrders] = useState([]);           // Toàn bộ lịch sử đơn hàng
    const [dailyReport, setDailyReport] = useState(null); // Dữ liệu báo cáo ngày
    const [topItems, setTopItems] = useState([]);        // Top 5 món bán chạy
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Ngày hiện tại dùng làm tham số query mặc định (định dạng YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);

    /**
     * Lấy thống kê doanh thu theo ngày từ API /reports/daily
     * và top món bán chạy từ API /reports/top-items
     */
    const fetchDailyReport = async (date) => {
        try {
            // Gọi đồng thời cả 2 API để tiết kiệm thời gian chờ
            const [reportRes, topRes] = await Promise.all([
                api.get(`/reports/daily?date=${date}`),
                api.get(`/reports/top-items?date=${date}`)
            ]);
            setDailyReport(reportRes);   // { date, totalRevenue, totalOrders }
            setTopItems(topRes || []);   // Mảng top 5 món
        } catch (error) {
            // Nếu API báo cáo lỗi → chỉ hiện cảnh báo nhỏ, không block trang
            console.error('Lỗi lấy báo cáo ngày:', error);
            setDailyReport({ date: date, totalRevenue: 0, totalOrders: 0 });
        }
    };

    /**
     * Lấy lịch sử toàn bộ đơn hàng từ API /orders
     * Dùng để hiển thị bảng lịch sử phía dưới
     */
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getOrders();
            // API trả về mảng trực tiếp (đã được extract bởi interceptor trong api.js)
            setOrders(Array.isArray(data) ? data : data?.orders || []);
            setAlert(null);
        } catch (error) {
            setAlert({ type: 'error', message: 'Không thể tải lịch sử đơn hàng.' });
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu lần đầu khi component mount
    useEffect(() => {
        fetchOrders();
        fetchDailyReport(selectedDate);
    }, []);

    // Tải lại báo cáo khi người dùng thay đổi ngày
    useEffect(() => {
        fetchDailyReport(selectedDate);
    }, [selectedDate]);

    // ---- CÁC HÀM FORMAT ----

    /** Định dạng số tiền theo chuẩn VND */
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    /** Định dạng ngày giờ sang giờ:phút - ngày/tháng/năm */
    const formatTime = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return (
            date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
            ' - ' +
            date.toLocaleDateString('vi-VN')
        );
    };

    // ---- TÍNH TOÁN THỐNG KÊ ----

    // Số đơn đã hoàn thành (status = 'done')
    const completedOrders = orders.filter(o => o.status === 'done');

    // Số đơn đang chờ xử lý hoặc đang phục vụ (chưa thanh toán)
    const pendingOrders = orders.filter(o => o.status !== 'done' && o.status !== 'cancelled');

    // Trung bình doanh thu mỗi đơn (chỉ tính đơn đã done, dùng dữ liệu realtime từ orders)
    const avgPerOrder = completedOrders.length > 0
        ? completedOrders.reduce((s, o) => s + o.totalPrice, 0) / completedOrders.length
        : 0;

    return (
        <div className="flex-grow p-6 pt-28 max-w-7xl mx-auto w-full">

            {/* ---- ALERT THÔNG BÁO ---- */}
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    autoClose={3000}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* ---- HEADER TRANG ---- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800">Báo Cáo Doanh Thu</h1>
                    <p className="text-stone-500 mt-1">
                        Thống kê theo ngày và theo dõi hiệu quả kinh doanh của quán.
                    </p>
                </div>

                {/* Nút làm mới toàn bộ dữ liệu */}
                <button
                    onClick={() => { fetchOrders(); fetchDailyReport(selectedDate); }}
                    className="bg-white border border-stone-200 text-stone-600 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors shadow-sm font-medium flex items-center gap-2"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* ---- BỘ LỌC NGÀY ---- */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-stone-600">📅 Xem theo ngày:</span>
                <input
                    type="date"
                    value={selectedDate}
                    max={todayStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                />
                {/* Nút quay về hôm nay nhanh */}
                {selectedDate !== todayStr && (
                    <button
                        onClick={() => setSelectedDate(todayStr)}
                        className="text-xs text-amber-600 font-semibold hover:underline"
                    >
                        Về hôm nay
                    </button>
                )}
            </div>

            {/* ---- 3 THẺ THỐNG KÊ CHÍNH ---- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* Thẻ 1: Doanh thu ngày */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-amber-500">
                    <h3 className="text-stone-500 font-medium mb-1 text-sm">
                        💰 Doanh Thu Ngày{' '}
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                    </h3>
                    <p className="text-3xl font-bold text-amber-600">
                        {formatCurrency(dailyReport?.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                        Từ {dailyReport?.totalOrders || 0} đơn đã hoàn thành
                    </p>
                </div>

                {/* Thẻ 2: Tổng đơn hoàn thành (toàn thời gian) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-emerald-500">
                    <h3 className="text-stone-500 font-medium mb-1 text-sm">✅ Đơn Đã Thanh Toán</h3>
                    <p className="text-3xl font-bold text-emerald-600">{completedOrders.length}</p>
                    <p className="text-xs text-stone-400 mt-1">
                        {pendingOrders.length} đơn đang chờ xử lý
                    </p>
                </div>

                {/* Thẻ 3: Trung bình doanh thu / đơn */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 border-l-4 border-l-blue-500">
                    <h3 className="text-stone-500 font-medium mb-1 text-sm">📊 Trung Bình / Đơn</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(avgPerOrder)}</p>
                    <p className="text-xs text-stone-400 mt-1">Tính trên đơn đã hoàn thành</p>
                </div>
            </div>

            {/* ---- TOP 5 MÓN BÁN CHẠY ---- */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-8">
                <div className="bg-stone-50 p-4 border-b border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800">
                        🏆 Top Món Bán Chạy — {new Date(selectedDate + 'T00:00:00').toLocaleDateString('vi-VN')}
                    </h3>
                </div>

                {topItems.length === 0 ? (
                    // Hiển thị khi chưa có dữ liệu (ngày chưa có đơn nào done)
                    <div className="text-center p-10 text-stone-400 italic">
                        Chưa có dữ liệu bán hàng cho ngày này.
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {topItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors">
                                {/* Hạng thứ */}
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                                    idx === 0 ? 'bg-amber-400 text-white' :
                                    idx === 1 ? 'bg-stone-300 text-stone-700' :
                                    idx === 2 ? 'bg-orange-300 text-white' :
                                    'bg-stone-100 text-stone-500'
                                }`}>
                                    {idx + 1}
                                </span>

                                {/* Tên món */}
                                <span className="flex-grow font-semibold text-stone-800">
                                    {item.name || 'Không rõ'}
                                </span>

                                {/* Số lượng bán */}
                                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                    {item.totalSold} phần
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ---- LỊCH SỬ ĐƠN HÀNG (chỉ đọc) ---- */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-800">📋 Lịch Sử Đơn Hàng</h3>
                    <span className="text-xs text-stone-400">{orders.length} đơn tổng cộng</span>
                </div>

                {loading ? (
                    <div className="text-center p-12 text-stone-500 animate-pulse">
                        Đang tải lịch sử...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center p-12 text-stone-400 italic">
                        Chưa có đơn hàng nào trong hệ thống.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-stone-50/50 text-stone-500 text-xs uppercase border-b border-stone-200">
                                    <th className="p-4 font-semibold">Mã Đơn</th>
                                    <th className="p-4 font-semibold">Thời Gian</th>
                                    <th className="p-4 font-semibold">Vị Trí</th>
                                    <th className="p-4 font-semibold">Số Món</th>
                                    <th className="p-4 font-semibold text-right">Tổng Tiền</th>
                                    <th className="p-4 font-semibold text-center">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {orders.map((order) => {
                                    // Đếm tổng số lượng món trong đơn
                                    const itemCount = order.items?.reduce(
                                        (sum, i) => sum + i.quantity, 0
                                    ) || 0;

                                    return (
                                        <tr
                                            key={order._id}
                                            className="hover:bg-stone-50/50 transition-colors"
                                        >
                                            {/* Mã đơn — hiển thị 6 ký tự cuối của ObjectId */}
                                            <td className="p-4 font-semibold text-blue-600 text-sm">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>

                                            {/* Thời gian tạo đơn */}
                                            <td className="p-4 text-stone-500 text-sm">
                                                {formatTime(order.createdAt)}
                                            </td>

                                            {/* Tên bàn (đã populate từ backend) hoặc "Mang đi" */}
                                            <td className="p-4 font-medium text-stone-700">
                                                {order.table?.name
                                                    ? `🪑 ${order.table.name}`
                                                    : '🛍️ Mang đi'}
                                            </td>

                                            {/* Tổng số lượng món */}
                                            <td className="p-4 text-stone-600 text-sm">
                                                {itemCount} món
                                            </td>

                                            {/* Tổng tiền đơn (field totalPrice trong model Order) */}
                                            <td className="p-4 text-right font-bold text-stone-800">
                                                {formatCurrency(order.totalPrice)}
                                            </td>

                                            {/* Badge trạng thái đơn hàng */}
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    order.status === 'done'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : order.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {order.status === 'done'       ? '✓ Đã thanh toán' :
                                                     order.status === 'cancelled'  ? '✕ Đã hủy'        :
                                                     order.status === 'serving'    ? '🍽 Đang phục vụ'  :
                                                                                     '⏳ Chờ xử lý'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsPage;