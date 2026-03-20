import React from 'react';

/**
 * StatusBadge Component
 * Hiển thị trạng thái bàn với màu sắc và animation
 *
 * @param {string} status - 'available' | 'occupied' | 'reserved'
 * @param {boolean} showPing - Hiển thị animation ping (default: false)
 */
const StatusBadge = ({ status, showPing = false }) => {
  const statusConfig = {
    available: {
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      shadow: 'shadow-[0_0_6px_rgba(16,185,129,0.3)]',
      label: 'Trống'
    },
    occupied: {
      color: 'rose',
      bgColor: 'bg-rose-500',
      pingBg: 'bg-rose-400',
      shadow: '',
      label: 'Đang Dùng'
    },
    reserved: {
      color: 'amber',
      bgColor: 'bg-amber-500',
      shadow: 'shadow-[0_0_6px_rgba(245,158,11,0.4)]',
      label: 'Đã Đặt'
    }
  };

  const config = statusConfig[status] || statusConfig.available;

  // For occupied tables, show ping animation by default
  const shouldPing = status === 'occupied' || showPing;

  if (shouldPing && status === 'occupied') {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pingBg} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.bgColor}`}></span>
      </span>
    );
  }

  return (
    <span className={`h-2.5 w-2.5 rounded-full ${config.bgColor} ${config.shadow}`}></span>
  );
};

export default StatusBadge;