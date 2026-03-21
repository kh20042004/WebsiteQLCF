const { body, param, validationResult } = require('express-validator');

// Validation cho POST /tables (thêm bàn)
const validateCreateTable = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên bàn là bắt buộc')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên bàn phải có 2-50 ký tự'),
  body('capacity')
    .notEmpty()
    .withMessage('Sức chứa là bắt buộc')
    .isInt({ min: 1, max: 20 })
    .withMessage('Sức chứa phải là số từ 1-20'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes không vượt quá 200 ký tự'),
];

// Validation cho PUT /tables/:id (cập nhật bàn)
const validateUpdateTable = [
  param('id')
    .isMongoId()
    .withMessage('ID bàn không hợp lệ'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên bàn phải có 2-50 ký tự'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Sức chứa phải là số từ 1-20'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes không vượt quá 200 ký tự'),
];

// Validation cho PATCH /tables/:id/status (cập nhật trạng thái)
const validateUpdateStatus = [
  param('id')
    .isMongoId()
    .withMessage('ID bàn không hợp lệ'),
  body('status')
    .notEmpty()
    .withMessage('Trạng thái là bắt buộc')
    .isIn(['available', 'occupied', 'reserved'])
    .withMessage('Trạng thái phải là: available, occupied hoặc reserved'),
];

// Validation cho DELETE /tables/:id
const validateDeleteTable = [
  param('id')
    .isMongoId()
    .withMessage('ID bàn không hợp lệ'),
];

// Validation cho GET /tables/:id
const validateGetTable = [
  param('id')
    .isMongoId()
    .withMessage('ID bàn không hợp lệ'),
];

// Middleware xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateCreateTable,
  validateUpdateTable,
  validateUpdateStatus,
  validateDeleteTable,
  validateGetTable,
  handleValidationErrors,
};
