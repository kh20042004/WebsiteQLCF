const { body, param, validationResult } = require('express-validator');

/**
 * Validator cho Item (Product) CRUD operations
 */

// ---- CREATE ITEM ----
const validateCreateItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên sản phẩm không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên sản phẩm phải từ 2-100 ký tự'),
  
  body('categoryId')
    .notEmpty().withMessage('Danh mục không được để trống')
    .isMongoId().withMessage('ID danh mục không hợp lệ'),
  
  body('price')
    .notEmpty().withMessage('Giá không được để trống')
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
];

// ---- UPDATE ITEM ----
const validateUpdateItem = [
  param('id')
    .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tên sản phẩm phải từ 2-100 ký tự'),
  
  body('categoryId')
    .optional()
    .isMongoId().withMessage('ID danh mục không hợp lệ'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
];

// ---- GET ITEM BY ID ----
const validateGetItem = [
  param('id')
    .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
];

// ---- DELETE ITEM ----
const validateDeleteItem = [
  param('id')
    .isMongoId().withMessage('ID sản phẩm không hợp lệ'),
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
  validateCreateItem,
  validateUpdateItem,
  validateGetItem,
  validateDeleteItem,
  handleValidationErrors,
};
