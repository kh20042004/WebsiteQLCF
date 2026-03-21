import React from 'react';
import { Icon } from '@iconify/react';

/**
 * ConfirmDialog Component - Modal xác nhận deletion
 * @param {boolean} isOpen - Dialog có mở không
 * @param {string} title - Tiêu đề dialog
 * @param {string} message - Nội dung message
 * @param {string} confirmText - Text cho confirm button
 * @param {string} cancelText - Text cho cancel button
 * @param {Function} onConfirm - Callback khi confirm
 * @param {Function} onCancel - Callback khi cancel
 * @param {boolean} isLoading - Loading state
 * @param {string} variant - 'danger' | 'warning' | 'info'
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: 'solar:trash-bin-trash-outline',
      iconColor: 'text-red-500',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      iconBg: 'bg-red-50'
    },
    warning: {
      icon: 'solar:danger-triangle-outline',
      iconColor: 'text-amber-500',
      confirmBg: 'bg-amber-500 hover:bg-amber-600',
      iconBg: 'bg-amber-50'
    },
    info: {
      icon: 'solar:info-circle-outline',
      iconColor: 'text-blue-500',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-50'
    }
  };

  const config = variants[variant];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 transition-enhanced animate-fade-in"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden modal-enter">

          <div className="p-6 text-center">
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
              <Icon icon={config.icon} className={`text-3xl ${config.iconColor}`} />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              {title}
            </h3>

            {/* Message */}
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white rounded-lg text-sm font-medium transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;