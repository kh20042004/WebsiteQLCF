/**
 * Component: Footer - Chân trang
 * 
 * Nhiệm vụ:
 * - Hiển thị thông tin copyright
 * - Links utils
 * - Thông tin liên hệ
 * 
 * Props: (none)
 */

import React from 'react';
import '../../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Container footer */}
      <div className="footer-container">
        {/* Thông tin công ty */}
        <div className="footer-section">
          <h3 className="footer-title">☕ Quản Lý Café</h3>
          <p className="footer-desc">
            Hệ thống quản lý quán cà phê hiệu quả
          </p>
        </div>

        {/* Links hữu ích */}
        <div className="footer-section">
          <h4 className="footer-section-title">Liên Kết</h4>
          <ul className="footer-links">
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/about">Về chúng tôi</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>

        {/* Thông tin liên hệ */}
        <div className="footer-section">
          <h4 className="footer-section-title">Liên Hệ</h4>
          <ul className="footer-contact">
            <li>📧 Email: support@coffeeshop.com</li>
            <li>📱 Điện thoại: (84) 123-456-789</li>
            <li>📍 Địa chỉ: Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="footer-divider" />

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {currentYear} Quản Lý Café. Bảo lưu mọi quyền.
        </p>
        <div className="footer-social">
          <a href="#" className="social-link">Facebook</a>
          <span className="divider">|</span>
          <a href="#" className="social-link">Twitter</a>
          <span className="divider">|</span>
          <a href="#" className="social-link">Instagram</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
