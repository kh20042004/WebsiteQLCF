/**
 * File: Các hàm helper / utilities dùng chung
 * 
 * Lưu ý:
 * - Các hàm tiện ích được sử dụng ở nhiều nơi
 * - Format dữ liệu, validate, xử lý string, ...
 */

import { CURRENCY, DATE_FORMATS } from './constants';

/**
 * Hàm format tiền tệ
 * @param {number} amount - Số tiền
 * @returns {string} - Chuỗi định dạng tiền (VD: 100.000₫)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'symbol',
  }).format(amount);
};

/**
 * Hàm format ngày tháng
 * @param {Date|string} date - Ngày cần format
 * @param {string} format - Format ('DD/MM/YYYY', 'DD/MM/YYYY HH:mm:ss', ...)
 * @returns {string} - Ngày đã format
 */
export const formatDate = (date, format = DATE_FORMATS.DATE_ONLY) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Kiểm tra valid date
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  // Thay thế placeholder
  let result = format;
  result = result.replace('YYYY', year);
  result = result.replace('MM', month);
  result = result.replace('DD', day);
  result = result.replace('HH', hours);
  result = result.replace('mm', minutes);
  result = result.replace('ss', seconds);

  return result;
};

/**
 * Hàm validate email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Hàm validate mật khẩu
 * @param {string} password
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Mật khẩu không được để trống' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải ít nhất 6 ký tự' };
  }

  return { isValid: true, message: '' };
};

/**
 * Hàm cắt ngắn text
 * @param {string} text - Text cần cắt
 * @param {number} maxLength - Số ký tự tối đa
 * @returns {string} - Text đã cắt (thêm ... ở cuối nếu vượt quá)
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Hàm lấy error message từ axios error
 * @param {error} error - Error object từ axios
 * @returns {string} - Message lỗi
 */
export const getErrorMessage = (error) => {
  // Nếu response có message (từ backend)
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Nếu có error message
  if (error.message) {
    return error.message;
  }

  // Default message
  return 'Có lỗi xảy ra. Vui lòng thử lại sau';
};

/**
 * Hàm chuyển đổi array thành object theo key
 * @param {array} arr - Mảng cần chuyển
 * @param {string} keyField - Trường dùng làm key
 * @returns {object} - Object đã chuyển
 */
export const arrayToObject = (arr, keyField = 'id') => {
  if (!Array.isArray(arr)) return {};
  
  return arr.reduce((obj, item) => {
    obj[item[keyField]] = item;
    return obj;
  }, {});
};

/**
 * Hàm sinh ID ngẫu nhiên
 * @returns {string}
 */
export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 11);
};

/**
 * Hàm kiểm tra object rỗng
 * @param {object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (typeof obj !== 'object') return false;
  
  return Object.keys(obj).length === 0;
};

/**
 * Hàm deep clone object
 * @param {object} obj
 * @returns {object} - Copy của object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Hàm chờ (delay)
 * @param {number} ms - Số milliseconds
 * @returns {Promise}
 */
export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Hàm export data ra file CSV
 * @param {array} data - Dữ liệu cần export
 * @param {string} filename - Tên file
 */
export const exportToCSV = (data, filename = 'data.csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('Không có dữ liệu để export');
    return;
  }

  // Lấy headers từ key của object đầu tiên
  const headers = Object.keys(data[0]);
  
  // Tạo CSV content
  let csvContent = headers.join(',') + '\n';
  
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Nếu value có dấu phẩy, bao trong quotes
      return typeof value === 'string' && value.includes(',')
        ? `"${value}"`
        : value;
    });
    csvContent += values.join(',') + '\n';
  });

  // Tạo blob và download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
};
