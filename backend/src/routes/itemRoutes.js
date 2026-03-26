const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

/**
 * Định nghĩa RESTful routes cho menu items (Sản phẩm)
 */

// Import uploadSingle từ multer config (đã cập nhật sang named export)
// uploadSingle: nhận 1 file ảnh từ field "image" (multipart/form-data)
const { uploadSingle } = require('../config/multer');

// Lấy tất cả và tạo mới
router.route('/')
  .get(itemController.getAllItems)
  .post(uploadSingle, itemController.createItem); // Nhận ảnh sản phẩm khi tạo mới

// Lấy 1, cập nhật và xóa theo ID
router.route('/:id')
  .get(itemController.getItemById)
  .put(uploadSingle, itemController.updateItem)   // Nhận ảnh sản phẩm khi cập nhật
  .delete(itemController.deleteItem);


module.exports = router;
