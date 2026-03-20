/**
 * Page: NotFound - Trang 404
 * 
 * Hiển thị khi user truy cập vào route không tồn tại
 */

import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      {/* Container */}
      <div className="not-found-container">
        {/* Số 404 lớn */}
        <div className="not-found-code">404</div>

        {/* Tiêu đề */}
        <h1 className="not-found-title">
          Trang không tìm thấy
        </h1>

        {/* Mô tả */}
        <p className="not-found-description">
          Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>

        {/* Link về trang chủ */}
        <Link to="/" className="btn-back-home">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
