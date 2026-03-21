/**
 * Component: Loading Spinner - Hiển thị loading state
 * 
 * Sử dụng:
 * <Loading />
 * <Loading size="large" />
 * <Loading color="#FF5733" />
 */

import React from 'react';
import '../../styles/Loading.css';

function Loading({ size = 'medium', color = '#8B4513' }) {
  return (
    <div className="loading-container">
      <div 
        className={`spinner spinner-${size}`}
        style={{
          borderColor: `${color}33`,
          borderTopColor: color,
          borderRightColor: color,
        }}
      />
      <p className="loading-text">Đang tải dữ liệu...</p>
    </div>
  );
}

export default Loading;
