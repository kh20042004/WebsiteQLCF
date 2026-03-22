import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { apiGet, apiPost } from '../../services/api';

const OrderMenuModal = ({ table, isOpen, onClose, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        apiGet('/items'),
        apiGet('/categories')
      ]);
      const allItems = itemsRes || [];
      setItems(allItems);
      setCategories(catsRes || []);

      if (table.currentOrderId && typeof table.currentOrderId === 'object') {
        const existingOrderItems = table.currentOrderId.items.map(oldItem => {
          const itemId = oldItem.item?._id || oldItem.item;
          const matchedProduct = allItems.find(p => String(p._id) === String(itemId));
          return {
            item: matchedProduct || { _id: String(itemId), name: oldItem.name, price: oldItem.price, image: '' },
            quantity: oldItem.quantity,
            price: oldItem.price
          };
        });
        setOrderItems(existingOrderItems);
      } else {
        setOrderItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, table._id]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory || item.category?._id === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const handleAddItem = (product) => {
    setOrderItems(prev => {
      const productId = String(product._id);
      const existing = prev.find(i => String(i.item._id) === productId);
      if (existing) {
        return prev.map(i => String(i.item._id) === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item: product, quantity: 1, price: product.price }];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    const idToUpdate = String(itemId);
    setOrderItems(prev => {
      return prev.map(i => {
        if (String(i.item._id) === idToUpdate) {
          return { ...i, quantity: Math.max(0, i.quantity + delta) };
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  };

  const calculateTotal = () => orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const handleSubmit = async () => {
    if (orderItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderPayload = {
        tableId: table._id,
        items: orderItems.map(i => ({
          item: i.item._id,
          quantity: i.quantity,
          price: i.price,
          name: i.item.name
        })),
        totalPrice: calculateTotal()
      };
      await apiPost('/orders', orderPayload);
      if (onSuccess) onSuccess(table.currentOrderId ? `Đã cập nhật đơn hàng thành công!` : `Đã tạo đơn hàng thành công!`);
      onClose();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-pop border border-white/20">

        {/* Header */}
        <div className={`px-8 py-6 border-b border-stone-100 flex items-center justify-between transition-all duration-500 ${table.currentOrderId ? 'bg-amber-50/40' : 'bg-white'}`}>
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-105 ${table.currentOrderId ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white' : 'bg-stone-900 text-white'}`}>
              <Icon icon={table.currentOrderId ? "solar:pen-new-square-bold" : "solar:tea-cup-bold"} className="text-3xl" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-stone-900 tracking-tight leading-none uppercase">
                  {table.currentOrderId ? 'Chỉnh Sửa Đơn' : 'Tạo Đơn Hàng'}
                </h2>
                {table.currentOrderId && (
                  <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase rounded-full shadow-sm animate-pulse-gentle">
                    Editing Mode
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-stone-500">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded-md text-[11px] font-bold">
                  <Icon icon="solar:armchair-bold" className="text-stone-400" />
                  BÀN: {table.name}
                </div>
                {table.currentOrderId && (
                  <div className="text-[11px] font-bold text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-md">
                    #{typeof table.currentOrderId === 'object' ? table.currentOrderId._id.slice(-6).toUpperCase() : table.currentOrderId.slice(-6).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-90">
            <Icon icon="solar:close-circle-bold" className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow flex overflow-hidden">

          {/* Menu Selection (Left) */}
          <div className="flex-grow flex flex-col bg-white overflow-hidden">
            <div className="px-8 py-5 border-b border-stone-50 space-y-5">
              <div className="relative group">
                <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors text-lg" />
                <input
                  type="text"
                  placeholder="Tìm món ngon của bạn ngay..."
                  className="w-full pl-12 pr-6 py-3.5 bg-stone-50 border-stone-100 border-[1.5px] rounded-2xl text-sm font-medium focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none placeholder:text-stone-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <CategoryBtn active={selectedCategory === 'all'} label="Tất Cả" onClick={() => setSelectedCategory('all')} />
                {categories.map(cat => (
                  <CategoryBtn key={cat._id} active={selectedCategory === cat._id} label={cat.name} onClick={() => setSelectedCategory(cat._id)} />
                ))}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-8 py-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 custom-scrollbar bg-white">
              {loading ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Đang tải thực đơn...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 grayscale">
                  <Icon icon="solar:box-minimalistic-linear" className="text-7xl mb-4" />
                  <p className="font-bold uppercase text-[11px] tracking-widest">Không có món bạn tìm</p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const orderItem = orderItems.find(i => String(i.item._id) === String(item._id));
                  const currentQuantity = orderItem ? orderItem.quantity : 0;

                  return (
                    <ProductCard
                      key={item._id}
                      item={item}
                      quantity={currentQuantity}
                      onAdd={() => handleAddItem(item)}
                      onUpdate={(delta) => handleUpdateQuantity(item._id, delta)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Checkout Side (Right) */}
          <div className="w-[420px] bg-stone-50/50 border-l border-stone-100 flex flex-col overflow-hidden">
            <div className="px-6 py-6 border-b border-stone-100 flex items-center justify-between bg-white shadow-sm">
              <div>
                <h3 className="font-black text-stone-900 text-sm uppercase tracking-wider mb-0.5">Giỏ Hàng</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">Chi tiết món đang chọn</p>
              </div>
              <div className="bg-stone-900 text-white text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-lg shadow-lg">
                {orderItems.length}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {orderItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 opacity-60">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-stone-100 shadow-sm flex items-center justify-center mb-4">
                    <Icon icon="solar:cart-large-4-linear" className="text-2xl" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">Giỏ hàng rỗng</p>
                </div>
              ) : (
                orderItems.map((item, idx) => (
                  <CartItem key={idx} item={item} onUpdate={handleUpdateQuantity} />
                ))
              )}
            </div>

            <div className="px-6 py-6 bg-white border-t border-stone-100 space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-stone-500 font-bold text-xs uppercase tracking-tight">
                  <span>Tạm tính</span>
                  <span className="text-stone-900 font-black">{calculateTotal().toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between items-center text-stone-400 font-bold text-[10px] uppercase tracking-tight">
                  <span>Khuyến mãi</span>
                  <span className="text-emerald-600 font-black">-0₫</span>
                </div>
                <div className="h-px bg-dashed-stone-200 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Tổng Cộng</span>
                  <span className="text-2xl font-black text-amber-600 tracking-tighter">
                    {calculateTotal().toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={orderItems.length === 0 || isSubmitting}
                className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transform transition-all active:scale-95 ${orderItems.length === 0 || isSubmitting
                  ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  : table.currentOrderId
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-amber-500/40 hover:brightness-110'
                    : 'bg-stone-900 text-white shadow-stone-900/40 hover:bg-black'
                  }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Icon icon={table.currentOrderId ? "solar:refresh-square-bold" : "solar:check-circle-bold"} className="text-xl" />
                    <span>{table.currentOrderId ? 'Cập Nhật Đơn' : 'Xác Nhận Đơn'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-pulse-gentle { animation: pulseGentle 2s infinite ease-in-out; }
        @keyframes pulseGentle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.95); } }
        @keyframes pop { 0% { transform: scale(0.9) translateY(20px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

/* --- REUSABLE SUB-COMPONENTS --- */

const CategoryBtn = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${active
      ? 'bg-stone-900 text-white shadow-md'
      : 'bg-white text-stone-500 border border-stone-100 hover:border-amber-300 hover:text-amber-600'
      }`}
  >
    {label}
  </button>
);

const ProductCard = ({ item, quantity, onAdd, onUpdate }) => {
  const isSelected = quantity > 0;

  return (
    <div
      onClick={!isSelected ? onAdd : undefined}
      className={`group bg-white rounded-[24px] p-4 flex flex-col h-full transition-all duration-500 relative ${isSelected
        ? 'border-2 border-amber-400 shadow-[0_8px_30px_rgb(0,0,0,0.08)]'
        : 'border-2 border-transparent border-stone-100 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-900/5 cursor-pointer active:scale-95'
        }`}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 text-white text-[13px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20 animate-pop">
          {quantity}
        </div>
      )}

      <div className="aspect-[4/5] rounded-[20px] bg-stone-50 mb-4 overflow-hidden relative shadow-inner">
        {item.image ? (
          <img
            src={item.image.startsWith('http') ? item.image : `http://localhost:3000${item.image}`}
            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3127/3127450.png'; e.target.className = 'w-24 h-24 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20'; }}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <Icon icon="solar:coffee-cup-bold" className="text-4xl" />
          </div>
        )}

        {!isSelected && (
          <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg">
              <span className="text-[22px] font-bold leading-none mb-[2px]">+</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1 flex-grow flex flex-col">
        <h4 className="text-[13px] font-black text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors uppercase tracking-tight">
          {item.name}
        </h4>
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-2 flex-grow">
          {item.category?.name || 'Thực đơn'}
        </p>

        <div className="flex items-center justify-between border-t border-stone-50 pt-3 mt-auto h-9">
          <span className="text-sm font-black text-amber-600">
            {item.price.toLocaleString('vi-VN')}₫
          </span>

          {/* Sửa icon thành text ở Card Món Ăn */}
          {isSelected ? (
            <div className="flex items-center bg-amber-50 rounded-xl p-0.5 border border-amber-100" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onUpdate(-1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-500 hover:text-red-500 hover:border-red-200 border border-transparent shadow-sm transition-all active:scale-90"
              >
                <span className="text-[18px] font-medium leading-none mb-[2px]">-</span>
              </button>
              <span className="text-[13px] font-black w-7 text-center text-amber-700">{quantity}</span>
              <button
                onClick={() => onUpdate(1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-sm transition-all active:scale-90"
              >
                <span className="text-[16px] font-medium leading-none mb-[2px]">+</span>
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 hover:bg-amber-500 hover:text-white transition-all"
            >
              <span className="text-[20px] font-medium leading-none mb-[2px]">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, onUpdate }) => {
  const iId = item.item?._id || item.item;
  return (
    <div className="group flex flex-col p-3.5 bg-white border border-stone-100 rounded-[20px] hover:border-amber-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 animate-fade-in relative">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-[14px] bg-stone-50 overflow-hidden flex-shrink-0 border border-stone-100/80 flex items-center justify-center">
          {item.item.image ? (
            <img
              src={item.item.image.startsWith('http') ? item.item.image : `http://localhost:3000${item.item.image}`}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              alt={item.item.name}
            />
          ) : null}
          <div className={`${item.item.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-stone-300 bg-stone-50`}>
            <Icon icon="solar:tea-cup-bold" className="text-xl" />
          </div>
        </div>

        <div className="flex-grow min-w-0 pr-2 pt-0.5">
          <h5 className="text-[13px] font-black text-stone-900 uppercase leading-snug truncate" title={item.item.name}>
            {item.item.name}
          </h5>
          <p className="text-[11px] font-bold text-stone-400 mt-1">
            {item.price.toLocaleString('vi-VN')}₫
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-stone-100">
        <div className="text-[14px] font-black text-amber-600 tracking-tighter">
          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
        </div>

        {/* Sửa icon thành text ở Giỏ Hàng */}
        <div className="flex items-center bg-stone-50/80 rounded-xl p-1 border border-stone-100">
          <button
            onClick={() => onUpdate(iId, -1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-stone-100 text-stone-500 hover:text-red-500 hover:border-red-200 transition-all active:scale-90 shadow-sm"
          >
            <span className="text-[18px] font-medium leading-none mb-[2px]">-</span>
          </button>
          <span className="text-[13px] font-black w-8 text-center text-stone-800">{item.quantity}</span>
          <button
            onClick={() => onUpdate(iId, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-stone-100 text-stone-500 hover:text-amber-600 hover:border-amber-200 transition-all active:scale-90 shadow-sm"
          >
            <span className="text-[16px] font-medium leading-none mb-[2px]">+</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => onUpdate(iId, -item.quantity)}
        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-stone-100 text-stone-400 hover:text-red-500 hover:border-red-200 shadow-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10"
        title="Xóa món"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="text-[13px]" />
      </button>
    </div>
  );
};

export default OrderMenuModal;