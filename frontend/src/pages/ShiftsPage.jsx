/**
 * Trang Quản Lý Ca Làm Việc (ShiftsPage)
 *
 * Chức năng:
 * - Admin xem tất cả ca, xếp ca mới, sửa/xóa ca
 * - Staff xem lịch ca của mình, check-in/check-out
 * - Lọc theo ngày, loại ca, trạng thái
 *
 * Quyền:
 * - Staff: Xem + Check-in/Check-out ca của mình
 * - Admin: CRUD + xem tất cả ca + xếp lịch
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, AlertCircle, CheckCircle2,
  Clock, Edit2, Trash2, X, LogIn, LogOut, Calendar,
  RefreshCw, User as UserIcon, Sun, Sunset, Moon
} from 'lucide-react';
import shiftService from '../services/shiftService';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { isAdmin } from '../utils/auth';
import api from '../services/api';

const ShiftsPage = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Mặc định hôm nay
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formData, setFormData] = useState({
    user: '', date: '', shiftType: 'morning',
    startTime: '06:00', endTime: '14:00', notes: ''
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Danh sách nhân viên (để chọn trong form)
  const [staffList, setStaffList] = useState([]);

  // Dialog xác nhận xóa
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, item: null });

  // Toast
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ============================================================
  // FUNCTIONS
  // ============================================================

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  /** Tải danh sách ca */
  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterType) params.shiftType = filterType;
      if (filterStatus) params.status = filterStatus;

      const data = await shiftService.getAllShifts(params);
      setShifts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ca.');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, filterType, filterStatus]);

  /** Tải danh sách nhân viên (cho form xếp ca) */
  const fetchStaffList = useCallback(async () => {
    try {
      const data = await api.get('/auth/users');
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Không thể tải DS nhân viên:', err);
    }
  }, []);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);
  useEffect(() => { if (isAdmin()) fetchStaffList(); }, [fetchStaffList]);

  /** Thời gian mặc định theo ca */
  const getDefaultTimes = (type) => {
    const times = {
      morning: { start: '06:00', end: '14:00' },
      afternoon: { start: '14:00', end: '22:00' },
      evening: { start: '22:00', end: '06:00' }
    };
    return times[type] || times.morning;
  };

  /** Mở modal thêm mới */
  const handleOpenAddModal = () => {
    const defaults = getDefaultTimes('morning');
    setEditingShift(null);
    setFormData({
      user: '', date: filterDate || new Date().toISOString().split('T')[0],
      shiftType: 'morning', startTime: defaults.start, endTime: defaults.end, notes: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  /** Mở modal sửa */
  const handleOpenEditModal = (shift) => {
    setEditingShift(shift);
    setFormData({
      user: shift.user?._id || shift.user || '',
      date: shift.date ? new Date(shift.date).toISOString().split('T')[0] : '',
      shiftType: shift.shiftType || 'morning',
      startTime: shift.startTime || '06:00',
      endTime: shift.endTime || '14:00',
      notes: shift.notes || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };

    // Tự động cập nhật thời gian khi đổi loại ca
    if (name === 'shiftType') {
      const times = getDefaultTimes(value);
      newData.startTime = times.start;
      newData.endTime = times.end;
    }

    setFormData(newData);
    if (formError) setFormError('');
  };

  /** Submit form */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user) { setFormError('Vui lòng chọn nhân viên'); return; }
    if (!formData.date) { setFormError('Vui lòng chọn ngày'); return; }

    try {
      setIsSaving(true);
      if (editingShift) {
        await shiftService.updateShift(editingShift._id, formData);
        showNotification('Cập nhật ca thành công');
      } else {
        await shiftService.createShift(formData);
        showNotification('Xếp ca thành công');
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      setFormError(err.message || 'Lỗi khi lưu ca');
    } finally {
      setIsSaving(false);
    }
  };

  /** Xóa ca */
  const handleConfirmDelete = async () => {
    try {
      await shiftService.deleteShift(confirmDialog.item._id);
      showNotification('Đã xóa ca thành công');
      fetchShifts();
      setConfirmDialog({ isOpen: false, item: null });
    } catch (err) {
      showNotification(err.message || 'Lỗi khi xóa ca', 'error');
    }
  };

  /** Check-in */
  const handleCheckIn = async (shiftId) => {
    try {
      await shiftService.checkIn(shiftId);
      showNotification('Check-in thành công! ✅');
      fetchShifts();
    } catch (err) {
      showNotification(err.message || 'Lỗi check-in', 'error');
    }
  };

  /** Check-out */
  const handleCheckOut = async (shiftId) => {
    try {
      await shiftService.checkOut(shiftId);
      showNotification('Check-out thành công! 🎉');
      fetchShifts();
    } catch (err) {
      showNotification(err.message || 'Lỗi check-out', 'error');
    }
  };

  /** Icon loại ca */
  const getShiftIcon = (type) => {
    switch (type) {
      case 'morning': return <Sun size={16} className="text-amber-500" />;
      case 'afternoon': return <Sunset size={16} className="text-orange-500" />;
      case 'evening': return <Moon size={16} className="text-indigo-500" />;
      default: return <Clock size={16} />;
    }
  };

  /** Tên ca tiếng Việt */
  const getShiftName = (type) => {
    const names = { morning: 'Ca sáng', afternoon: 'Ca chiều', evening: 'Ca tối' };
    return names[type] || type;
  };

  /** Style trạng thái */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'scheduled': return { label: 'Đã xếp lịch', color: 'bg-blue-100 text-blue-700' };
      case 'checked_in': return { label: 'Đang làm', color: 'bg-emerald-100 text-emerald-700' };
      case 'checked_out': return { label: 'Hoàn thành', color: 'bg-stone-100 text-stone-600' };
      case 'absent': return { label: 'Vắng mặt', color: 'bg-rose-100 text-rose-700' };
      default: return { label: status, color: 'bg-stone-100 text-stone-600' };
    }
  };

  /** Lấy user ID đang đăng nhập */
  const getCurrentUserId = () => {
    try { return JSON.parse(localStorage.getItem('user'))?.id; }
    catch { return null; }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 animate-in fade-in duration-700">

      {/* Toast */}
      {notification.show && (
        <div className={`fixed top-24 right-4 z-[100] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full duration-500 border ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* ===== HEADER + TOOLBAR ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-sky-100/50 rounded-2xl text-sky-900 border border-sky-200/40 shadow-inner">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight uppercase">
              QUẢN LÝ CA LÀM VIỆC
            </h1>
            <p className="text-stone-500 font-medium">Xếp lịch và chấm công nhân viên.</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xl shadow-stone-200/30 flex flex-col sm:flex-row items-stretch gap-3 lg:w-max">
          {/* Chọn ngày */}
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:ring-2 focus:ring-sky-500/20 outline-none" />

          {/* Lọc loại ca */}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:ring-2 focus:ring-sky-500/20 outline-none">
            <option value="">Tất cả ca</option>
            <option value="morning">Ca sáng</option>
            <option value="afternoon">Ca chiều</option>
            <option value="evening">Ca tối</option>
          </select>

          {/* Lọc trạng thái */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:ring-2 focus:ring-sky-500/20 outline-none">
            <option value="">Tất cả TT</option>
            <option value="scheduled">Đã xếp lịch</option>
            <option value="checked_in">Đang làm</option>
            <option value="checked_out">Hoàn thành</option>
            <option value="absent">Vắng mặt</option>
          </select>

          {/* Nút xếp ca - CHỈ ADMIN */}
          {isAdmin() && (
            <button onClick={handleOpenAddModal}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-stone-300 active:scale-95 group">
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              XẾP CA
            </button>
          )}
        </div>
      </div>

      {/* ===== LỖI ===== */}
      {error && (
        <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-3xl text-rose-800 flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600"><AlertCircle /></div>
            <div><p className="font-bold">Đã xảy ra lỗi!</p><p className="text-sm opacity-80">{error}</p></div>
          </div>
          <button onClick={fetchShifts}
            className="px-5 py-2.5 bg-rose-200/50 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-2">
            <RefreshCw size={16} /> THỬ LẠI
          </button>
        </div>
      )}

      {/* ===== BẢNG ===== */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-sky-600 rounded-full animate-spin" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Clock size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Không có ca nào trong ngày này</p>
          <p className="text-sm">Chọn ngày khác hoặc bấm "Xếp ca" để tạo lịch mới.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Nhân viên</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Ca</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Thời gian</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Check-out</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shifts.map((shift) => {
                  const statusStyle = getStatusStyle(shift.status);
                  const currentUserId = getCurrentUserId();
                  const isMyShift = shift.user?._id === currentUserId || shift.user === currentUserId;

                  return (
                    <tr key={shift._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold">
                            {shift.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900 text-sm">{shift.user?.name || 'N/A'}</p>
                            <p className="text-xs text-stone-400">{shift.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(shift.shiftType)}
                          <span className="text-sm font-semibold text-stone-700">{getShiftName(shift.shiftType)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-stone-600 font-medium">
                        {shift.startTime} → {shift.endTime}
                      </td>

                      <td className="px-6 py-4 text-sm text-stone-600">
                        {shift.checkInTime ? new Date(shift.checkInTime).toLocaleTimeString('vi-VN') : '—'}
                      </td>

                      <td className="px-6 py-4 text-sm text-stone-600">
                        {shift.checkOutTime ? new Date(shift.checkOutTime).toLocaleTimeString('vi-VN') : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Check-in — chỉ hiện cho ca của mình + trạng thái scheduled */}
                          {isMyShift && shift.status === 'scheduled' && (
                            <button onClick={() => handleCheckIn(shift._id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Check-in">
                              <LogIn size={16} />
                            </button>
                          )}

                          {/* Check-out — chỉ hiện cho ca của mình + trạng thái checked_in */}
                          {isMyShift && shift.status === 'checked_in' && (
                            <button onClick={() => handleCheckOut(shift._id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Check-out">
                              <LogOut size={16} />
                            </button>
                          )}

                          {/* Sửa/Xóa — CHỈ ADMIN */}
                          {isAdmin() && (
                            <>
                              <button onClick={() => handleOpenEditModal(shift)}
                                className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setConfirmDialog({ isOpen: true, item: shift })}
                                className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Xóa">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== MODAL THÊM/SỬA CA ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-bold text-stone-900">
                {editingShift ? '✏️ Sửa Ca' : '📅 Xếp Ca Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle size={16} /><span>{formError}</span>
                </div>
              )}

              {/* Chọn nhân viên */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nhân viên *</label>
                <select name="user" value={formData.user} onChange={handleFormChange} disabled={isSaving}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium">
                  <option value="">-- Chọn nhân viên --</option>
                  {staffList.map(staff => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role === 'admin' ? 'Admin' : 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày + Loại ca */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Ngày *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Loại ca *</label>
                  <select name="shiftType" value={formData.shiftType} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium">
                    <option value="morning">🌅 Ca sáng (06:00-14:00)</option>
                    <option value="afternoon">🌇 Ca chiều (14:00-22:00)</option>
                    <option value="evening">🌙 Ca tối (22:00-06:00)</option>
                  </select>
                </div>
              </div>

              {/* Giờ bắt đầu / kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Bắt đầu</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Kết thúc</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleFormChange}
                    disabled={isSaving}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium" />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Ghi chú</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleFormChange}
                  placeholder="VD: Trực quầy, Pha chế..." disabled={isSaving}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-sm font-medium" />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border-2 border-stone-200 rounded-xl text-stone-600 font-bold text-sm hover:bg-stone-50">
                  Hủy
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</>
                  ) : editingShift ? '💾 Cập nhật' : '✅ Xếp ca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog xóa */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa ca"
        message={`Bạn có chắc muốn xóa ca ${getShiftName(confirmDialog.item?.shiftType)} của ${confirmDialog.item?.user?.name || 'nhân viên'} không?`}
        confirmText="Xóa" cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, item: null })}
        variant="danger"
      />
    </div>
  );
};

export default ShiftsPage;
