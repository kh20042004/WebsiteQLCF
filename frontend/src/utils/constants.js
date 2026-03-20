/**
 * File: Các hằng số dùng chung
 * 
 * Lưu ý:
 * - Tập trung các magic string, error messages, status codes
 * - Dễ bảo trì và thay đổi
 * - Sử dụng lại ở nhiều component
 */

// ---- API ENDPOINTS ----
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/me',
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // Menu Items
  ITEMS: {
    LIST: '/items',
    CREATE: '/items',
    UPDATE: (id) => `/items/${id}`,
    DELETE: (id) => `/items/${id}`,
  },

  // Tables
  TABLES: {
    LIST: '/tables',
    CREATE: '/tables',
    UPDATE: (id) => `/tables/${id}`,
    DELETE: (id) => `/tables/${id}`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
  },

  // Reports
  REPORTS: {
    REVENUE: '/reports/revenue',
    STATISTICS: '/reports/statistics',
  },
};

// ---- HTTP STATUS CODES ----
export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

// ---- ERROR MESSAGES ----
export const ERROR_MESSAGES = {
  // Auth errors
  AUTH_LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác',
  AUTH_REGISTER_FAILED: 'Đăng ký thất bại',
  AUTH_TOKEN_INVALID: 'Token không hợp lệ',
  AUTH_TOKEN_EXPIRED: 'Token đã hết hạn',
  
  // Network errors
  NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra lại mạng',
  API_ERROR: 'Lỗi từ máy chủ. Vui lòng thử lại sau',
  
  // Validation errors
  REQUIRED_FIELD: 'Trường bắt buộc không được để trống',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải ít nhất 6 ký tự',
  PASSWORD_NOT_MATCH: 'Mật khẩu không khớp',
};

// ---- SUCCESS MESSAGES ----
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  CREATE_SUCCESS: 'Tạo thành công',
  UPDATE_SUCCESS: 'Cập nhật thành công',
  DELETE_SUCCESS: 'Xóa thành công',
};

// ---- ROLES ----
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// ---- TABLE STATUS ----
export const TABLE_STATUS = {
  AVAILABLE: 'available', // Bàn trống
  OCCUPIED: 'occupied',   // Bàn đang có khách
  RESERVED: 'reserved',   // Bàn được đặt trước
};

// ---- ORDER STATUS ----
export const ORDER_STATUS = {
  PENDING: 'pending',         // Chờ xử lý
  PREPARING: 'preparing',     // Đang chuẩn bị
  READY: 'ready',             // Sẵn sàng
  SERVED: 'served',           // Đã phục vụ
  PAID: 'paid',               // Đã thanh toán
  CANCELLED: 'cancelled',     // Hủy
};

// ---- PAGINATION ----
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// ---- DATE FORMATS ----
export const DATE_FORMATS = {
  DATE_ONLY: 'DD/MM/YYYY',
  DATE_TIME: 'DD/MM/YYYY HH:mm:ss',
  TIME_ONLY: 'HH:mm:ss',
};

// ---- CURRENCY ----
export const CURRENCY = {
  SYMBOL: '₫',
  CODE: 'VND',
};
