const { body, param, validationResult } = require('express-validator');

/**
 * Validator cho Category CRUD operations
 */

// ---- CREATE CATEGORY ----
const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên danh mục phải từ 2-100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
];

// ---- UPDATE CATEGORY ----
const validateUpdateCategory = [
  param('id')
    .isMongoId().withMessage('ID danh mục không hợp lệ'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tên danh mục phải từ 2-100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
];

// ---- GET CATEGORY BY ID ----
const validateGetCategory = [
  param('id')
    .isMongoId().withMessage('ID danh mục không hợp lệ'),
];

// ---- DELETE CATEGORY ----
const validateDeleteCategory = [
  param('id')
    .isMongoId().withMessage('ID danh mục không hợp lệ'),
];

// ---- HANDLE VALIDATION ERRORS ----
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategory,
  validateDeleteCategory,
  handleValidationErrors,
};
