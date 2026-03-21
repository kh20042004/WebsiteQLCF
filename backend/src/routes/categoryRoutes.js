const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

/**
 * Định nghĩa RESTful routes cho menu categories (Danh mục)
 */

router.route('/')
  .get(categoryController.getAllCategories)
  .post(categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
