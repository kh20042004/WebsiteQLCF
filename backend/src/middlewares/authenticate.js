/**
 * Middleware: authenticate.js (đã cập nhật)
 *
 * Nhiệm vụ chính:
 * 1. `authenticate`   — Xác thực JWT token, load thông tin user từ DB vào req.user
 * 2. `requireAdmin`   — Kiểm tra user phải có role = 'admin'
 * 3. `requireStaff`   — Kiểm tra user phải có role = 'admin' hoặc 'staff'
 *
 * Cách dùng trong routes:
 *   router.get('/', authenticate, requireAdmin, controller)   → Chỉ admin
 *   router.get('/', authenticate, requireStaff, controller)   → Admin + Staff
 *   router.get('/', authenticate, controller)                 → Cả 2 (chỉ cần đăng nhập)
 *
 * Lý do load user từ DB (thay vì chỉ decode JWT):
 * - Đảm bảo user vẫn còn tồn tại trong hệ thống (chưa bị xóa)
 * - Lấy được role mới nhất (phòng trường hợp role bị thay đổi sau khi đăng nhập)
 * - Gắn toàn bộ thông tin user vào req.user để controller dùng được
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// ============================================================
// MIDDLEWARE 1: authenticate
// Xác thực JWT token và load thông tin user từ database
// ============================================================
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization (format: "Bearer <token>")
    const authHeader = req.headers.authorization;

    // Kiểm tra có header Authorization không
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: false,
        message: 'Vui lòng đăng nhập để tiếp tục (thiếu token)',
      });
    }

    // Tách lấy phần token (bỏ "Bearer " ở đầu)
    const token = authHeader.split(' ')[1];

    // Xác thực token — nếu sai/hết hạn sẽ throw error
    const decoded = verifyToken(token);

    // Tìm user trong database theo ID trong token
    // Không lấy password (select: false trong schema)
    const user = await User.findById(decoded.id);

    // Kiểm tra user còn tồn tại không (có thể đã bị xóa sau khi đăng nhập)
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Tài khoản không tồn tại hoặc đã bị xóa',
      });
    }

    // Gắn toàn bộ thông tin user vào request để các middleware/controller sau dùng
    // req.user.id    → ID người dùng
    // req.user.role  → Vai trò: 'admin' | 'staff'
    // req.user.name  → Tên người dùng
    // req.user.email → Email người dùng
    req.user = user;

    // Chuyển tiếp sang middleware/controller tiếp theo
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: error.message || 'Token không hợp lệ hoặc đã hết hạn',
    });
  }
};


// ============================================================
// MIDDLEWARE 2: requireAdmin
// Kiểm tra user phải có role = 'admin'
// PHẢI chạy sau authenticate (cần req.user)
//
// Dùng cho: Quản lý menu (tạo/sửa/xóa category & item),
//           Xóa bàn, Xóa đơn hàng, Xem báo cáo doanh thu
// ============================================================
const requireAdmin = (req, res, next) => {
  // Kiểm tra req.user đã được set chưa (authenticate phải chạy trước)
  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: 'Chưa xác thực người dùng',
    });
  }

  // Chỉ cho phép admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: false,
      message: 'Truy cập bị từ chối: Chỉ quản trị viên (admin) mới có quyền thực hiện thao tác này',
    });
  }

  // User là admin → cho phép tiếp tục
  next();
};


// ============================================================
// MIDDLEWARE 3: requireStaff
// Kiểm tra user phải có role = 'admin' hoặc 'staff'
// Tức là: Bất kỳ ai đã đăng nhập đều được phép
// PHẢI chạy sau authenticate (cần req.user)
//
// Dùng cho: Xem menu, Quản lý bàn (tạo/sửa/đổi status),
//           Tạo và quản lý đơn hàng, Upload ảnh, Thanh toán
// ============================================================
const requireStaff = (req, res, next) => {
  // Kiểm tra req.user đã được set chưa
  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: 'Chưa xác thực người dùng',
    });
  }

  // Cho phép cả admin lẫn staff
  const allowedRoles = ['admin', 'staff'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      status: false,
      message: 'Truy cập bị từ chối: Bạn không có quyền thực hiện thao tác này',
    });
  }

  // User có quyền → cho phép tiếp tục
  next();
};


// ============================================================
// EXPORT TẤT CẢ MIDDLEWARE
// ============================================================
module.exports = authenticate;               // Export mặc định (tương thích ngược)
module.exports.authenticate  = authenticate; // Named export
module.exports.requireAdmin  = requireAdmin; // Named export
module.exports.requireStaff  = requireStaff; // Named export
