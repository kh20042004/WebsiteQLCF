/**
 * File: utils/auth.js
 * 
 * Nhiệm vụ: Cung cấp các helper functions để kiểm tra phân quyền user
 * 
 * Các function:
 * - getUser()      — Lấy thông tin user từ localStorage
 * - isAuthenticated() — Kiểm tra user đã đăng nhập chưa
 * - isAdmin()      — Kiểm tra user có phải admin không
 * - isStaff()      — Kiểm tra user có phải staff không (hoặc admin)
 * - hasRole()      — Kiểm tra user có role cụ thể không
 * - getUserRole()  — Lấy role của user hiện tại
 */


/**
 * Lấy thông tin user từ localStorage
 * @returns {Object|null} - User object hoặc null nếu không có
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('❌ Lỗi parse user từ localStorage:', error);
    return null;
  }
};


/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns {boolean} - true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = getUser();
  
  // Phải có cả token và user mới coi là đã đăng nhập
  return !!(token && user);
};


/**
 * Kiểm tra user có phải ADMIN không
 * @returns {boolean} - true nếu là admin, false nếu không
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};


/**
 * Kiểm tra user có phải STAFF không (bao gồm cả admin)
 * Admin cũng được coi là staff (vì admin có mọi quyền của staff)
 * @returns {boolean} - true nếu là staff hoặc admin
 */
export const isStaff = () => {
  const user = getUser();
  return user?.role === 'staff' || user?.role === 'admin';
};


/**
 * Kiểm tra user có role cụ thể không
 * @param {string} role - Role cần kiểm tra ('admin' hoặc 'staff')
 * @returns {boolean} - true nếu user có role này
 */
export const hasRole = (role) => {
  const user = getUser();
  return user?.role === role;
};


/**
 * Lấy role của user hiện tại
 * @returns {string|null} - 'admin', 'staff', hoặc null nếu chưa đăng nhập
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};


/**
 * Kiểm tra user có một trong các role cho phép không
 * @param {string[]} allowedRoles - Mảng các role được phép (vd: ['admin', 'staff'])
 * @returns {boolean} - true nếu user có một trong các role này
 * 
 * Ví dụ:
 * hasAnyRole(['admin', 'staff']) → true nếu user là admin hoặc staff
 */
export const hasAnyRole = (allowedRoles = []) => {
  const user = getUser();
  if (!user?.role) return false;
  
  return allowedRoles.includes(user.role);
};


/**
 * Lấy tên hiển thị của user
 * @returns {string} - Tên user hoặc email nếu không có tên
 */
export const getUserDisplayName = () => {
  const user = getUser();
  return user?.name || user?.email || 'User';
};


/**
 * Logout user - xóa token và user khỏi localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login'; // Redirect về trang login
};
