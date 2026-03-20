const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

/**
 * Định nghĩa RESTful routes cho menu items (Sản phẩm)
 */

const upload = require('../config/multer');

// Lấy tất cả và tạo mới
router.route('/')
  .get(itemController.getAllItems)
  .post(upload.single('image'), itemController.createItem);

// Lấy 1, cập nhật và xóa theo ID
router.route('/:id')
  .get(itemController.getItemById)
  .put(upload.single('image'), itemController.updateItem)
  .delete(itemController.deleteItem);


module.exports = router;
