import React from 'react';
import { Icon } from '@iconify/react';

/**
 * LoadingSpinner Component - Enhanced loading states
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} message - Loading message to display
 * @param {string} variant - 'default' | 'card' | 'overlay'
 */
const LoadingSpinner = ({
  size = 'md',
  message = 'Đang tải...',
  variant = 'default'
}) => {

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const SpinnerIcon = ({ className }) => (
    <div className={`${className} border-2 border-amber-500 border-t-transparent rounded-full animate-spin`} />
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <SpinnerIcon className={sizeClasses.lg} />
          <p className="text-stone-600 text-sm mt-3 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-stone-100 shadow-sm animate-pulse">
        <div className="text-center">
          <SpinnerIcon className={sizeClasses.md} />
          <p className="text-stone-500 text-xs mt-2">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <SpinnerIcon className={sizeClasses[size]} />
        <p className="text-stone-500 text-sm mt-2">{message}</p>
      </div>
    </div>
  );
};

/**
 * ErrorMessage Component - Enhanced error display
 * @param {string} message - Error message
 * @param {Function} onRetry - Retry function
 * @param {string} variant - 'inline' | 'card' | 'full'
 */
export const ErrorMessage = ({
  message,
  onRetry = null,
  variant = 'card'
}) => {

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <Icon icon="solar:danger-triangle-outline" className="text-base" />
        <span>{message}</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Icon icon="solar:danger-triangle-bold" className="text-3xl text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-stone-600 text-sm mb-6">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-enhanced btn-bounce focus-visible-enhanced"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center animate-scale-in">
      <div className="flex items-center justify-center gap-3 mb-2">
        <Icon icon="solar:danger-triangle-outline" className="text-xl text-red-500" />
        <h4 className="font-medium text-red-900">Lỗi</h4>
      </div>
      <p className="text-red-700 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-enhanced"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};

/**
 * EmptyState Component - When no data is available
 * @param {string} title - Title message
 * @param {string} description - Description message
 * @param {string} icon - Icon to display
 * @param {Function} onAction - Action function
 * @param {string} actionText - Action button text
 */
export const EmptyState = ({
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có dữ liệu để hiển thị.',
  icon = 'solar:box-linear',
  onAction = null,
  actionText = 'Thêm mới'
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto bg-stone-100 rounded-full flex items-center justify-center mb-4">
        <Icon icon={icon} className="text-3xl text-stone-400" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-enhanced btn-bounce focus-visible-enhanced"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default LoadingSpinner;