/**
 * Validator: orderValidator
 *
 * Nhiệm vụ: Validate dữ liệu đầu vào cho các API Order
 * Sử dụng express-validator (đã có trong package.json)
 */

const { body, param } = require('express-validator');

// ---------------------------------------------------------------
// Validate tạo đơn hàng mới
// POST /orders
// ---------------------------------------------------------------
const validateCreateOrder = [
  body('tableId')
    .notEmpty()
    .withMessage('tableId là bắt buộc')
    .isMongoId()
    .withMessage('tableId không hợp lệ'),

  body('note')
    .optional()
    .isString()
    .withMessage('Ghi chú phải là chuỗi ký tự')
    .isLength({ max: 500 })
    .withMessage('Ghi chú không được vượt quá 500 ký tự'),
];

// ---------------------------------------------------------------
// Validate thêm món vào đơn hàng
// POST /orders/:id/items
// ---------------------------------------------------------------
const validateAddItem = [
  param('id')
    .isMongoId()
    .withMessage('ID đơn hàng không hợp lệ'),

  body('itemId')
    .notEmpty()
    .withMessage('itemId là bắt buộc')
    .isMongoId()
    .withMessage('itemId không hợp lệ'),

  body('quantity')
    .notEmpty()
    .withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên ít nhất là 1'),

  body('price')
    .notEmpty()
    .withMessage('Giá là bắt buộc')
    .isFloat({ min: 0 })
    .withMessage('Giá phải là số không âm'),

  body('name')
    .notEmpty()
    .withMessage('Tên món là bắt buộc')
    .isString()
    .withMessage('Tên món phải là chuỗi ký tự')
    .trim(),
];

// ---------------------------------------------------------------
// Validate xóa món khỏi đơn hàng
// DELETE /orders/:id/items/:itemId
// ---------------------------------------------------------------
const validateRemoveItem = [
  param('id')
    .isMongoId()
    .withMessage('ID đơn hàng không hợp lệ'),

  param('itemId')
    .isMongoId()
    .withMessage('ID món không hợp lệ'),
];

// ---------------------------------------------------------------
// Validate cập nhật số lượng món trong đơn hàng
// PUT /orders/:id/items/:itemId
// ---------------------------------------------------------------
const validateUpdateItem = [
  param('id')
    .isMongoId()
    .withMessage('ID đơn hàng không hợp lệ'),

  param('itemId')
    .isMongoId()
    .withMessage('ID món không hợp lệ'),

  body('quantity')
    .notEmpty()
    .withMessage('Số lượng là bắt buộc')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên ít nhất là 1'),
];

// ---------------------------------------------------------------
// Validate cập nhật trạng thái đơn hàng
// PATCH /orders/:id/status
// ---------------------------------------------------------------
const validateUpdateStatus = [
  param('id')
    .isMongoId()
    .withMessage('ID đơn hàng không hợp lệ'),

  body('status')
    .notEmpty()
    .withMessage('Trạng thái là bắt buộc')
    .isIn(['pending', 'serving', 'done', 'cancelled'])
    .withMessage('Trạng thái phải là: pending, serving, done hoặc cancelled'),
];

module.exports = {
  validateCreateOrder,
  validateAddItem,
  validateRemoveItem,
  validateUpdateItem,
  validateUpdateStatus,
};
