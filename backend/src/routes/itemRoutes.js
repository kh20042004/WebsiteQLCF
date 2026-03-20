const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

/**
 * Định nghĩa RESTful routes cho menu items (Sản phẩm)
 */

// Lấy tất cả và tạo mới
router.route('/')
  .get(itemController.getAllItems)
  .post(itemController.createItem);

// Lấy 1, cập nhật và xóa theo ID
router.route('/:id')
  .get(itemController.getItemById)
  .put(itemController.updateItem)
  .delete(itemController.deleteItem);

module.exports = router;
