import React from 'react';
import { Icon } from '@iconify/react';
import { formatCurrency } from '../../utils/helpers';

/**
 * MenuTable Component - Hiển thị danh sách món ăn dưới dạng bảng
 * 
 * @param {Array} items - Danh sách món ăn
 * @param {Function} onEdit - Callback khi nhấn nút Sửa
 * @param {Function} onDelete - Callback khi nhấn nút Xóa
 * @param {boolean} loading - Trạng thái đang tải dữ liệu
 */
const MenuTable = ({ items, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="animate-pulse p-8 space-y-4">
          <div className="h-4 bg-stone-100 rounded w-full"></div>
          <div className="h-12 bg-stone-50 rounded w-full"></div>
          <div className="h-12 bg-stone-50 rounded w-full"></div>
          <div className="h-12 bg-stone-50 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-50 text-stone-400 mb-4">
          <Icon icon="lucide:search-x" className="text-3xl" />
        </div>
        <h3 className="text-lg font-medium text-stone-900 mb-1">Không tìm thấy món nào</h3>
        <p className="text-stone-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm món mới.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/50 border-b border-stone-200">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Hình ảnh</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Tên món</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Danh mục</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-right">Giá</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-stone-500 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((item) => (
              <tr 
                key={item._id} 
                className="hover:bg-stone-50/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-200">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/100x100?text=Coffee';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-stone-400">
                        <Icon icon="lucide:coffee" className="text-xl" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-stone-900">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-stone-500 truncate max-w-[200px]">{item.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                    {item.category?.name || 'Chưa phân loại'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-stone-900">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'available' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      item.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}></span>
                    {item.status === 'available' ? 'Đang bán' : 'Hết hàng'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
                      title="Sửa"
                    >
                      <Icon icon="lucide:edit-2" className="text-lg" />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Xóa"
                    >
                      <Icon icon="lucide:trash-2" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuTable;
