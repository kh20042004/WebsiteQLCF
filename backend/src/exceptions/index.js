/**
 * ========================================
 * CUSTOM EXCEPTION CLASSES
 * ========================================
 * 
 * Định nghĩa các lớp exception tùy chỉnh để xử lý lỗi
 * Giúp code dễ đọc và dễ maintain hơn
 * 
 * Các loại lỗi chính:
 * 1. BadRequestException - Yêu cầu không hợp lệ (400)
 * 2. UnauthorizedException - Không được phép (401)
 * 3. NotFoundException - Không tìm thấy (404)
 * 4. ForbiddenException - Cấm truy cập (403)
 * 5. ConflictException - Xung đột dữ liệu (409)
 * 6. ServerException - Lỗi server (500)
 */

// ---- BASE EXCEPTION CLASS ----
/**
 * Lớp cha cho tất cả các exception
 * Mọi custom exception nên kế thừa từ lớp này
 */
class AppException extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    // Capture stack trace để debug
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---- 400 BAD REQUEST ----
/**
 * Lỗi yêu cầu không hợp lệ
 * Ví dụ:
 * - Input validation failed
 * - Missing required fields
 * - Mật khẩu không khớp
 * 
 * Cách sử dụng:
 * throw new BadRequestException('Email đã tồn tại');
 */
class BadRequestException extends AppException {
  constructor(message = 'Yêu cầu không hợp lệ') {
    super(message, 400);
    this.name = 'BadRequestException';
  }
}

// ---- 401 UNAUTHORIZED ----
/**
 * Lỗi không được xác thực
 * Ví dụ:
 * - Token không hợp lệ
 * - Token đã hết hạn
 * - Thông tin đăng nhập sai
 * 
 * Cách sử dụng:
 * throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
 */
class UnauthorizedException extends AppException {
  constructor(message = 'Không được phép') {
    super(message, 401);
    this.name = 'UnauthorizedException';
  }
}

// ---- 403 FORBIDDEN ----
/**
 * Lỗi cấm truy cập (người dùng xác thực nhưng không có quyền)
 * Ví dụ:
 * - Admin yêu cầu nhưng user chỉ là customer
 * - Không được phép xóa tài nguyên của người khác
 * 
 * Cách sử dụng:
 * throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
 */
class ForbiddenException extends AppException {
  constructor(message = 'Cấm truy cập') {
    super(message, 403);
    this.name = 'ForbiddenException';
  }
}

// ---- 404 NOT FOUND ----
/**
 * Lỗi không tìm thấy tài nguyên
 * Ví dụ:
 * - User ID không tồn tại
 * - Route không tồn tại
 * - Resource bị xóa
 * 
 * Cách sử dụng:
 * throw new NotFoundException('Người dùng không tồn tại');
 */
class NotFoundException extends AppException {
  constructor(message = 'Không tìm thấy') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

// ---- 409 CONFLICT ----
/**
 * Lỗi xung đột dữ liệu
 * Ví dụ:
 * - Email đã tồn tại (duplicate)
 * - Dữ liệu bị trùng lặp
 * 
 * Cách sử dụng:
 * throw new ConflictException('Email đã được đăng ký');
 */
class ConflictException extends AppException {
  constructor(message = 'Xung đột dữ liệu') {
    super(message, 409);
    this.name = 'ConflictException';
  }
}

// ---- 500 SERVER ERROR ----
/**
 * Lỗi server (internal error)
 * Ví dụ:
 * - Database error
 * - Unexpected runtime error
 * 
 * Cách sử dụng:
 * throw new ServerException('Lỗi server, vui lòng thử lại sau');
 */
class ServerException extends AppException {
  constructor(message = 'Lỗi server') {
    super(message, 500);
    this.name = 'ServerException';
  }
}

// ---- XUẤT CÁC LỚPS EXCEPTION ----
module.exports = {
  AppException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ServerException,
};
