import React from 'react';
import { Edit3, Trash2, Image as ImageIcon, Search, Tag, DollarSign, ListFilter, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../../utils/constants';

const MenuTable = ({ items, onEdit, onDelete, isLoading }) => {
  // Định dạng tiền tệ VNĐ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 font-medium">Đang tải danh sách thực đơn...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-3xl border border-stone-200 border-dashed animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
          <Search size={32} />
        </div>
        <h3 className="text-xl font-semibold text-stone-900 mb-2">Không tìm thấy món ăn nào</h3>
        <p className="text-stone-500">Hãy thử đổi từ khóa tìm kiếm hoặc thêm món mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl shadow-stone-200/40 overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-100">
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Hình ảnh</th>
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Tên món</th>
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Danh mục</th>
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Giá tiền</th>
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4.5 text-xs font-bold text-stone-500 uppercase tracking-wider text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100/60">
            {items.map((item, index) => (
              <tr 
                key={item._id} 
                className="group hover:bg-stone-50/50 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Hình ảnh */}
                <td className="px-6 py-4.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=No+Img'; }}
                      />
                    ) : (
                      <ImageIcon className="text-stone-300" size={20} />
                    )}
                  </div>
                </td>

                {/* Tên món */}
                <td className="px-6 py-4.5">
                  <div className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors uppercase tracking-tight">
                    {item.name}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5 max-w-[200px] truncate">
                    ID: {item._id.slice(-6).toUpperCase()}
                  </div>
                </td>

                {/* Danh mục */}
                <td className="px-6 py-4.5">
                  {item.category ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium border border-stone-200">
                      <Tag size={12} />
                      {item.category.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 text-stone-400 rounded-full text-xs font-medium border border-stone-100 italic">
                      <Tag size={12} className="opacity-50" />
                      Chưa phân loại
                    </span>
                  )}
                </td>

                {/* Giá tiền */}
                <td className="px-6 py-4.5">
                  <div className="font-bold text-stone-800 text-sm">
                    {formatCurrency(item.price)}
                  </div>
                </td>

                {/* Trạng thái */}
                <td className="px-6 py-4.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
                    item.status === 'Available' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-50 text-rose-700 border-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.1)]'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${item.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {item.status === 'Available' ? 'SẴN SÀNG' : 'HẾT MÓN'}
                  </span>
                </td>

                {/* Hành động */}
                <td className="px-6 py-4.5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2.5 bg-white border border-stone-200 text-stone-600 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all shadow-sm"
                      title="Sửa món"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-2.5 bg-white border border-stone-200 text-stone-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                      title="Xóa món"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer bảng */}
      <div className="px-6 py-4 bg-stone-50/50 border-t border-stone-100 text-xs text-stone-500 flex justify-between items-center">
        <span>Hiển thị {items.length} món ăn</span>
        <div className="flex items-center gap-1.5 font-medium">
          <AlertCircle size={12} />
          Mẹo: Hover chuột vào dòng để thực hiện Sửa/Xóa nhanh.
        </div>
      </div>
    </div>
  );
};

export default MenuTable;
