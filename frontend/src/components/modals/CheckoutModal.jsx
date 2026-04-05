import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';

const CheckoutModal = ({ order, isOpen, onClose, onConfirm }) => {
  const [discountType, setDiscountType] = useState('amount'); // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerPaid, setCustomerPaid] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setDiscountType('amount');
      setDiscountValue(0);
      setSurcharge(0);
      setPaymentMethod('cash');
      setCustomerPaid(0);
    }
  }, [isOpen]);

  const itemsTotal = order?.totalPrice || 0;
  const taxAmount = itemsTotal * 0.08; // Thuế 8% đồng bộ với BillPanel
  const subTotal = itemsTotal + taxAmount;

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (itemsTotal * discountValue) / 100;
    }
    return discountValue;
  }, [itemsTotal, discountType, discountValue]);

  const grandTotal = Math.max(0, subTotal - discountAmount + surcharge);
  const changeAmount = customerPaid - grandTotal;
  const isPaidEnough = customerPaid >= grandTotal;

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleInputChange = (value, setter, max = Infinity) => {
    const rawValue = value.replace(/,/g, '');
    if (!isNaN(rawValue)) {
      const val = Math.min(Number(rawValue), max);
      setter(val);
    }
  };

  const handlePrint = () => { window.print(); };

  const handleConfirm = () => {
    onConfirm({
      orderId: order._id, subTotal, discount: discountAmount, surcharge, grandTotal, paymentMethod,
      customerPaid: paymentMethod === 'cash' ? customerPaid : grandTotal,
      changeAmount: paymentMethod === 'cash' ? Math.max(0, changeAmount) : 0,
      timestamp: new Date().toISOString()
    });
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md animate-fade-in no-print" onClick={onClose}></div>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl h-[82vh] bg-white rounded-[32px] shadow-2xl flex overflow-hidden animate-pop no-print border border-stone-100">

        {/* LEFT: Bill Preview */}
        <div className="w-[320px] bg-stone-50 border-r border-stone-100 flex flex-col flex-shrink-0">
          <div className="p-6 pb-4">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Hóa đơn xem trước</h3>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-amber-500"></div>
              <div className="text-center">
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-tighter">ANTIGRAVITY POS</h4>
              </div>

              <div className="border-y border-dashed border-stone-100 py-4 space-y-4 max-h-[45vh] overflow-y-auto custom-scrollbar pr-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <div className="flex-grow min-w-0">
                      <p className="text-[14px] font-black text-stone-900 uppercase leading-snug break-words">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-bold text-stone-400 mt-0.5">
                        Số lượng: <span className="text-stone-900">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-stone-900 flex-shrink-0">
                      {formatNumber(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase">
                  <span>Tạm tính</span>
                  <span>{formatNumber(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase">
                  <span>Thuế (8%)</span>
                  <span>{formatNumber(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold text-rose-500 uppercase">
                    <span>Giảm giá</span>
                    <span>-{formatNumber(discountAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-stone-900 text-white rounded-t-[32px] shadow-2xl">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Cần trả</span>
              <span className="text-3xl font-black text-amber-400 tracking-tighter">{formatNumber(grandTotal)}₫</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Main Actions */}
        <div className="flex-grow bg-white flex flex-col min-w-0">
          <div className="p-6 border-b border-stone-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-amber-400 shadow-lg shadow-stone-200">
                <Icon icon="solar:cash-out-bold-duotone" className="text-xl" />
              </div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight uppercase">Thanh Toán</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-stone-50 text-stone-400 hover:text-red-500 rounded-full transition-all active:scale-95">
              <Icon icon="solar:close-circle-bold" className="text-xl" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="grid grid-cols-2 gap-6 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Giảm giá</label>
                  <div className="flex bg-stone-50 rounded-lg p-0.5 border border-stone-100">
                    <button onClick={() => { setDiscountType('amount'); setDiscountValue(0); }} className={`px-2.5 py-1 rounded-md text-[8px] font-black transition-all ${discountType === 'amount' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-300'}`}>VNĐ</button>
                    <button onClick={() => { setDiscountType('percent'); setDiscountValue(0); }} className={`px-2.5 py-1 rounded-md text-[8px] font-black transition-all ${discountType === 'percent' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-300'}`}>%</button>
                  </div>
                </div>
                <div className="relative">
                  <input type="text" value={formatNumber(discountValue)} onChange={(e) => handleInputChange(e.target.value, setDiscountValue, discountType === 'percent' ? 100 : itemsTotal)} className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-4 px-6 text-xl font-black text-rose-500 focus:bg-white focus:border-rose-200 outline-none transition-all" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-stone-300">{discountType === 'percent' ? '%' : '₫'}</span>
                </div>
                {/* Nút chọn nhanh cho % */}
                {discountType === 'percent' && (
                  <div className="flex gap-1.5 mt-2">
                    {[10, 20, 50].map(val => (
                      <button key={val} onClick={() => setDiscountValue(val)} className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${discountValue === val ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>-{val}%</button>
                    ))}
                    <button onClick={() => setDiscountValue(0)} className="px-3 py-1 rounded-lg text-[9px] font-black bg-stone-50 text-stone-300">XÓA</button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Phụ thu</label>
                <div className="relative">
                  <input type="text" value={formatNumber(surcharge)} onChange={(e) => handleInputChange(e.target.value, setSurcharge)} className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-4 px-6 text-xl font-black text-stone-900 focus:bg-white focus:border-stone-300 outline-none transition-all" />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-stone-300">₫</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Phương thức</label>
              <div className="grid grid-cols-3 gap-3">
                <CompactMethodBtn active={paymentMethod === 'cash'} icon="solar:wad-of-money-bold" label="Tiền mặt" onClick={() => setPaymentMethod('cash')} color="amber" />
                <CompactMethodBtn active={paymentMethod === 'transfer'} icon="solar:qr-code-bold" label="Chuyển khoản" onClick={() => setPaymentMethod('transfer')} color="blue" />
                <CompactMethodBtn active={paymentMethod === 'card'} icon="solar:card-bold" label="Quẹt thẻ" onClick={() => setPaymentMethod('card')} color="emerald" />
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="bg-stone-900 p-6 rounded-[24px] shadow-xl animate-pop">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest">Tiền khách đưa</label>
                  <button onClick={() => setCustomerPaid(grandTotal)} className="text-[9px] font-black text-amber-500 hover:text-white transition-colors underline-offset-4 underline">NHẬN CHẴN {formatNumber(grandTotal)}₫</button>
                </div>
                <input type="text" value={formatNumber(customerPaid)} onChange={(e) => handleInputChange(e.target.value, setCustomerPaid)} className="w-full bg-transparent border-none text-4xl font-black text-white outline-none p-0 focus:ring-0 mb-4" placeholder="0" autoFocus />
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map(val => (
                    <button key={val} onClick={() => setCustomerPaid(val * 1000)} className="py-2 bg-stone-800 border border-stone-700/50 rounded-xl text-[10px] font-black text-stone-400 hover:text-white transition-all">{val}K</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4">
            <div className="flex gap-8">
              <div>
                <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Cần trả</p>
                <p className="text-2xl font-black text-stone-900 tracking-tighter">{formatNumber(grandTotal)}₫</p>
              </div>
              {paymentMethod === 'cash' && (
                <div>
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Tiền thừa</p>
                  <p className={`text-2xl font-black tracking-tighter ${changeAmount >= 0 ? 'text-emerald-500' : 'text-rose-500/20'}`}>
                    {formatNumber(Math.max(0, changeAmount))}₫
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button onClick={handlePrint} className="px-5 py-4 bg-white border border-stone-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-100 transition-all flex items-center gap-2 shadow-sm active:scale-95">
                <Icon icon="solar:printer-bold" className="text-lg" />
                In Bill
              </button>
              <button onClick={handleConfirm} disabled={paymentMethod === 'cash' && !isPaidEnough} className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 ${paymentMethod === 'cash' && !isPaidEnough ? 'bg-stone-200 text-stone-400' : 'bg-stone-900 text-white hover:bg-black shadow-stone-900/20'}`}>
                <Icon icon="solar:check-circle-bold" className="text-lg text-amber-500" />
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* US MODERN STYLE BILL TEMPLATE (80mm) */}
      <div className="print-only font-sans">
        <div style={{ width: '80mm', padding: '10mm 6mm', backgroundColor: 'white', color: 'black' }}>
          <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
            <h1 style={{ margin: '0', fontSize: '18pt', fontWeight: '900', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>ANTIGRAVITY</h1>
            <p style={{ margin: '1mm 0 0 0', fontSize: '8pt', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#666' }}>Portland / OR / Since 2024</p>
            <p style={{ margin: '4mm 0 0 0', fontSize: '7.5pt', lineHeight: '1.4' }}>
              123 Industrial Dr, Suite 400<br />
              Insta: @antigravity_local
            </p>
          </div>

          <div style={{ fontSize: '8.5pt', borderTop: '0.5px solid black', borderBottom: '0.5px solid black', padding: '4mm 0', margin: '4mm 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: '800' }}>#{order._id.slice(-6).toUpperCase()}</div>
            <div style={{ color: '#444' }}>Table: {order.table?.name}</div>
            <div style={{ width: '100%', marginTop: '1mm', fontSize: '7.5pt', color: '#666' }}>
              {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          <div style={{ margin: '6mm 0' }}>
            {order.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3mm', fontSize: '9pt', fontWeight: '700' }}>
                <div style={{ flexGrow: 1, paddingRight: '4mm' }}>
                  <div style={{ textTransform: 'uppercase' }}>{i.name}</div>
                  <div style={{ fontSize: '7pt', color: '#666', fontWeight: '500', marginTop: '0.5mm' }}>QTY: {i.quantity}</div>
                </div>
                <div style={{ whiteSpace: 'nowrap' }}>{formatNumber(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #ccc', paddingTop: '4mm', marginTop: '4mm', fontSize: '8.5pt', fontWeight: '600' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
              <span>SUBTOTAL ITEM</span>
              <span>{formatNumber(itemsTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm' }}>
              <span>TAX (8%)</span>
              <span>{formatNumber(taxAmount)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5mm', fontStyle: 'italic', fontWeight: '500' }}>
                <span>DISCOUNT</span>
                <span>-{formatNumber(discountAmount)}</span>
              </div>
            )}

            <div style={{ marginTop: '5mm', borderTop: '2px solid black', paddingTop: '4mm' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '10pt', fontWeight: '900' }}>TOTAL</span>
                <span style={{ fontSize: '18pt', fontWeight: '900', letterSpacing: '-1px' }}>{formatNumber(grandTotal)}₫</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '15mm', textAlign: 'center' }}>
            <p style={{ margin: '0', fontSize: '8pt', fontWeight: '800', letterSpacing: '1px' }}>THANKS FOR SUPPORTING LOCAL!</p>
            <div style={{ margin: '8mm auto', width: '22mm', height: '22mm', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6pt', fontWeight: '900' }}>
              QR SCAN
            </div>
            <p style={{ margin: '1mm 0', fontSize: '9pt', fontWeight: '900' }}>*** SEE YOU AGAIN ***</p>
          </div>
        </div>
      </div>

      <style>{`
        @media screen { .print-only { display: none; } .no-print { display: flex; } }
        @media print { body * { visibility: hidden; } .no-print { display: none !important; } .print-only, .print-only * { visibility: visible; } .print-only { position: absolute; left: 0; top: 0; width: 80mm; } @page { size: 80mm auto; margin: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
        .animate-pop { animation: pop 0.4s cubic-bezier(0.17, 1, 0.3, 1); }
        @keyframes pop { from { scale: 0.98; opacity: 0; } to { scale: 1; opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

const CompactMethodBtn = ({ active, icon, label, onClick, color }) => {
  const themes = {
    amber: 'border-stone-100 bg-stone-50 text-stone-500 active:border-amber-400 active:bg-amber-50 active:text-amber-600',
    blue: 'border-stone-100 bg-stone-50 text-stone-500 active:border-blue-400 active:bg-blue-50 active:text-blue-600',
    emerald: 'border-stone-100 bg-stone-50 text-stone-500 active:border-emerald-400 active:bg-emerald-50 active:text-emerald-600',
  };
  const activeThemes = {
    amber: 'border-amber-400 bg-amber-50 text-amber-600 shadow-lg shadow-amber-900/5',
    blue: 'border-blue-400 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5',
    emerald: 'border-emerald-400 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-900/5',
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${active ? activeThemes[color] : themes[color] + ' hover:border-stone-200'}`}>
      <Icon icon={icon} className="text-xl" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default CheckoutModal;