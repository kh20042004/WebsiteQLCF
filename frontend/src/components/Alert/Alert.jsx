/**
 * Component: Alert - Hiển thị thông báo (success, error, warning, info)
 * 
 * Sử dụng:
 * <Alert type="success" message="Thành công!" />
 * <Alert type="error" message="Lỗi!" onClose={() => {}} />
 * <Alert 
 *   type="warning" 
 *   message="Cảnh báo!"
 *   autoClose={3000}
 * />
 */

import React, { useState, useEffect } from 'react';
//import '../../styles/Alert.css';

function Alert({ type = 'info', message, onClose, autoClose = null }) {
  const [isVisible, setIsVisible] = useState(true);

  /**
   * Effect: Auto close alert sau khoảng thời gian
   */
  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      handleClose();
    }, autoClose);

    return () => clearTimeout(timer);
  }, [autoClose]);

  /**
   * Hàm đóng alert
   */
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className={`alert alert-${type}`}>
      {/* Icon theo type */}
      <span className="alert-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </span>

      {/* Message */}
      <span className="alert-message">{message}</span>

      {/* Close button */}
      <button 
        className="alert-close"
        onClick={handleClose}
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  );
}

export default Alert;
