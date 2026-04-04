/**
 * Trang: Bảng Điều Khiển (Dashboard) - ĐÃ CÓ PHÂN QUYỀN
 *
 * Mục đích: Trang tổng quan đầu tiên khi vào hệ thống
 *
 * 📌 PHÂN QUYỀN:
 * - ADMIN: Thấy tất cả (doanh thu, top món, thống kê đầy đủ)
 * - STAFF: Chỉ thấy việc cần làm (bàn chờ, đơn pending, thông báo công việc)
 *
 * Khối thông tin:
 * - Chào mừng nhân viên theo tên + giờ trong ngày
 * - [ADMIN] 4 thẻ KPI: Doanh thu hôm nay, Đơn hoàn thành, Bàn đang dùng, Đơn đang chờ
 * - [ADMIN] Top 5 món bán chạy nhất hôm nay
 * - [STAFF] Danh sách bàn đang có khách (để phục vụ)
 * - [STAFF] Đơn hàng cần xử lý (pending, serving)
 *
 * API sử dụng:
 * - GET /reports/daily    → doanh thu + số đơn (CHỈ ADMIN)
 * - GET /reports/top-items → top 5 món bán chạy (CHỈ ADMIN)
 * - GET /tables           → trạng thái bàn (TẤT CẢ)
 * - GET /orders           → đơn đang chờ xử lý (TẤT CẢ)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDailyReport, getTopItems } from '../services/reportService';
import { apiGet } from '../services/api';
import { isAdmin } from '../utils/auth'; // Import helper function

// ---- HÀM TIỆN ÍCH ----

/** Định dạng số tiền sang VNĐ */
const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

/** Trả về lời chào theo giờ trong ngày */
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
};

/** Định dạng ngày thứ tiếng Việt */
const formatDateVN = (date) =>
    date.toLocaleDateString('vi-VN', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });

// ---- COMPONENT CHÍNH ----

function Dashboard() {
    // Lấy user từ localStorage thay vì AuthContext để tránh lỗi import file .js có JSX
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user')) || {}; }
        catch { return {}; }
    })();


    // Ngày hôm nay dùng làm tham số query
    const todayStr = new Date().toISOString().split('T')[0];

    // ---- STATE ----
    const [reportData, setReportData]   = useState({ totalRevenue: 0, totalOrders: 0 });
    const [topItems, setTopItems]       = useState([]);
    const [tables, setTables]           = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [now, setNow]                 = useState(new Date());

    // Cập nhật đồng hồ mỗi giây
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    /**
     * Tải toàn bộ dữ liệu cần thiết cho dashboard cùng lúc
     * Dùng Promise.allSettled để không block nếu 1 API lỗi
     * 
     * PHÂN QUYỀN:
     * - Admin: Gọi tất cả API (reports, tables, orders)
     * - Staff: Chỉ gọi tables và orders (không gọi reports vì không có quyền)
     */
    const fetchAll = async () => {
        setLoading(true);
        try {
            // Nếu là Admin → gọi đầy đủ API (bao gồm reports)
            // Nếu là Staff → chỉ gọi tables và orders (bỏ reports)
            const promises = isAdmin() 
                ? [
                    getDailyReport(todayStr),      // Doanh thu + số đơn hôm nay (CHỈ ADMIN)
                    getTopItems(todayStr),          // Top 5 món bán chạy (CHỈ ADMIN)
                    apiGet('/tables'),              // Trạng thái bàn
                    apiGet('/orders')               // Toàn bộ đơn để lọc pending
                  ]
                : [
                    Promise.resolve(null),          // Placeholder - Staff không gọi daily report
                    Promise.resolve(null),          // Placeholder - Staff không gọi top items
                    apiGet('/tables'),              // Trạng thái bàn
                    apiGet('/orders')               // Toàn bộ đơn để lọc pending
                  ];

            const [dailyRes, topRes, tablesRes, ordersRes] = await Promise.allSettled(promises);

            // Xử lý từng kết quả — chỉ cập nhật nếu API thành công
            if (dailyRes.status === 'fulfilled' && dailyRes.value) {
                setReportData({
                    totalRevenue: dailyRes.value?.totalRevenue || 0,
                    totalOrders:  dailyRes.value?.totalOrders  || 0
                });
            }

            if (topRes.status === 'fulfilled' && topRes.value) {
                setTopItems(topRes.value || []);
            }

            if (tablesRes.status === 'fulfilled') {
                // API /tables trả về mảng hoặc object có .tables
                const list = Array.isArray(tablesRes.value)
                    ? tablesRes.value
                    : tablesRes.value?.tables || [];
                setTables(list);
            }

            if (ordersRes.status === 'fulfilled') {
                // Chỉ lấy đơn đang chờ xử lý hoặc đang phục vụ (chưa thanh toán)
                const list = Array.isArray(ordersRes.value)
                    ? ordersRes.value
                    : ordersRes.value?.orders || [];
                setPendingOrders(list.filter(o => o.status === 'pending' || o.status === 'serving'));
            }
        } catch (err) {
            console.error('Lỗi tải dữ liệu dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi component mount
    useEffect(() => {
        fetchAll();
    }, []);

    // ---- TÍNH TOÁN THỐNG KÊ TỪ DATA ----
    const occupiedTables  = tables.filter(t => t.status === 'occupied').length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const totalTables     = tables.length;

    return (
        <main className="flex-grow max-w-[85rem] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

            {/* ---- HEADER: Chào mừng + Đồng hồ ---- */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    {/* Lời chào theo giờ */}
                    <p className="text-sm font-medium text-amber-600 mb-1">
                        ☕ {getGreeting()},
                        <span className="font-bold text-stone-800 ml-1">
                            {user?.name || user?.email?.split('@')[0] || 'Nhân viên'}!
                        </span>
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                        Bảng Điều Khiển
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                        {formatDateVN(now)}
                    </p>
                </div>

                {/* Đồng hồ số thời gian thực + nút làm mới */}
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-stone-200 rounded-xl px-4 py-2 shadow-sm text-center">
                        <p className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
                            {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="p-2.5 bg-white border border-stone-200 rounded-xl shadow-sm text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all disabled:opacity-50"
                        title="Làm mới dữ liệu"
                    >
                        {/* Icon làm mới */}
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ---- 4 THẺ KPI CHÍNH ---- */}
            {/* ADMIN: Hiển thị tất cả 4 KPI (bao gồm doanh thu + đơn hoàn thành) */}
            {/* STAFF: Chỉ hiển thị 2 KPI (bàn đang dùng + đơn đang chờ) */}
            <div className={`grid gap-4 mb-8 ${isAdmin() ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>

                {/* KPI 1 & 2: Doanh thu + Đơn hoàn thành - CHỈ ADMIN 🔒 */}
                {isAdmin() && (
                    <>
                        {/* KPI 1: Doanh thu hôm nay */}
                        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                    Doanh Thu Hôm Nay
                                </p>
                                {/* Icon tiền */}
                                <span className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
                                    💰
                                </span>
                            </div>
                            <p className="text-2xl font-black text-emerald-600 tracking-tight">
                                {loading ? '—' : formatCurrency(reportData.totalRevenue)}
                            </p>
                            <p className="text-xs text-stone-400 mt-1">Từ các đơn đã thanh toán</p>
                        </div>

                        {/* KPI 2: Số đơn hoàn thành hôm nay */}
                        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                                    Đơn Hoàn Thành
                                </p>
                                <span className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">
                                    ✅
                                </span>
                            </div>
                            <p className="text-2xl font-black text-blue-600 tracking-tight">
                                {loading ? '—' : reportData.totalOrders}
                            </p>
                            <p className="text-xs text-stone-400 mt-1">Trong ngày hôm nay</p>
                        </div>
                    </>
                )}

                {/* KPI 3: Bàn đang có khách - TẤT CẢ user */}
                <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                            Bàn Đang Có Khách
                        </p>
                        <span className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-lg">
                            🪑
                        </span>
                    </div>
                    <p className="text-2xl font-black text-rose-600 tracking-tight">
                        {loading ? '—' : `${occupiedTables} / ${totalTables}`}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{availableTables} bàn còn trống</p>
                </div>

                {/* KPI 4: Đơn đang chờ xử lý - TẤT CẢ user */}
                <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                            Đơn Đang Chờ
                        </p>
                        <span className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg">
                            ⏳
                        </span>
                    </div>
                    <p className="text-2xl font-black text-amber-600 tracking-tight">
                        {loading ? '—' : pendingOrders.length}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">Cần xử lý hoặc thanh toán</p>
                </div>
            </div>

            {/* ---- PHẦN GIỮA: Top món + Bàn đang dùng ---- */}
            {/* Layout khác nhau theo role:
                - ADMIN: Grid 2 cột (Top món + Bàn đang dùng)
                - STAFF: Full width (chỉ Bàn đang dùng)
            */}
            <div className={`grid gap-6 mb-8 ${isAdmin() ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

                {/* ---- TOP 5 MÓN BÁN CHẠY - CHỈ ADMIN 🔒 ---- */}
                {isAdmin() && (
                    <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                            <h2 className="font-semibold text-stone-900">🏆 Top Món Bán Chạy Hôm Nay</h2>
                            <Link to="/reports" className="text-xs text-amber-600 hover:underline font-medium">
                                Xem báo cáo →
                            </Link>
                        </div>

                        {loading ? (
                            // Skeleton loading
                            <div className="p-6 space-y-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : topItems.length === 0 ? (
                            // Trạng thái rỗng
                            <div className="p-10 text-center text-stone-400">
                                <p className="text-4xl mb-2">☕</p>
                                <p className="text-sm italic">Chưa có đơn nào hoàn thành hôm nay</p>
                            </div>
                        ) : (
                            // Danh sách top món
                            <div className="divide-y divide-stone-50">
                                {topItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors">
                                        {/* Hạng (màu khác nhau cho top 3) */}
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                            idx === 0 ? 'bg-amber-400 text-white' :
                                            idx === 1 ? 'bg-stone-300 text-stone-700' :
                                            idx === 2 ? 'bg-orange-300 text-white' :
                                            'bg-stone-100 text-stone-500'
                                        }`}>
                                            {idx + 1}
                                        </span>

                                        {/* Tên món */}
                                        <span className="flex-grow text-sm font-medium text-stone-800 truncate">
                                            {item.name || 'Không rõ'}
                                        </span>

                                        {/* Số lượng bán */}
                                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full flex-shrink-0">
                                            {item.totalSold} phần
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ---- BÀN ĐANG CÓ KHÁCH ---- */}
                <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                        <h2 className="font-semibold text-stone-900">
                            🪑 Bàn Đang Có Khách
                            <span className="ml-2 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                {occupiedTables}
                            </span>
                        </h2>
                        <Link to="/tables" className="text-xs text-amber-600 hover:underline font-medium">
                            Quản lý bàn →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : occupiedTables === 0 ? (
                        <div className="p-10 text-center text-stone-400">
                            <p className="text-4xl mb-2">✨</p>
                            <p className="text-sm italic">Tất cả bàn đang trống</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-50 max-h-72 overflow-y-auto">
                            {tables
                                .filter(t => t.status === 'occupied')
                                .map((table) => {
                                    // Lấy dữ liệu order từ bàn nếu đã populate
                                    const order = typeof table.currentOrderId === 'object'
                                        ? table.currentOrderId
                                        : null;
                                    const total   = order?.totalPrice || 0;
                                    const count   = order?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

                                    return (
                                        <div key={table._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors">
                                            {/* Chấm đỏ đang hoạt động */}
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] flex-shrink-0" />

                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-semibold text-stone-900 truncate">
                                                    {table.name}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {count > 0 ? `${count} món` : 'Chưa có món'}
                                                </p>
                                            </div>

                                            {/* Tổng tiền tạm tính */}
                                            <span className="text-sm font-bold text-amber-600 flex-shrink-0">
                                                {total > 0 ? formatCurrency(total) : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            {/* ---- LỐI TẮT ĐIỀU HƯỚNG NHANH ---- */}
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-semibold text-stone-900 mb-4">⚡ Truy Cập Nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { to: '/tables',  icon: '🪑', label: 'Quản Lý Bàn',    color: 'hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700'    },
                        { to: '/menu',    icon: '🍽️', label: 'Thực Đơn',       color: 'hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'  },
                        { to: '/orders',  icon: '📋', label: 'Đơn Hàng Mới',  color: 'hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'      },
                        { to: '/reports', icon: '📊', label: 'Báo Cáo',        color: 'hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700' },
                        { to: '/dashboard', icon: '🔄', label: 'Làm Mới', color: 'hover:border-stone-300 hover:bg-stone-100 hover:text-stone-800', onClick: fetchAll },
                    ].map(({ to, icon, label, color, onClick }) => (
                        <Link
                            key={to + label}
                            to={to}
                            onClick={onClick}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-100 text-stone-500 text-sm font-medium transition-all ${color}`}
                        >
                            <span className="text-2xl">{icon}</span>
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}

export default Dashboard;