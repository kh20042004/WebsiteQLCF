var express = require('express');
var router = express.Router();
let categoryController = require('../controllers/categoryController');
let { CategoryValidator, validationResult } = require('../utils/validatorHandler');

/**
 * Định nghĩa RESTful routes cho menu categories (Danh mục)
 */

// Lấy tất cả danh mục
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const categories = await categoryController.GetAllCategories(search);
        res.status(200).json({
            status: true,
            results: categories.length,
            data: categories,
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Lấy chi tiết 1 danh mục
router.get('/:id', async (req, res) => {
    try {
        const category = await categoryController.GetCategoryById(req.params.id);
        if (category) {
            res.status(200).json({ status: true, data: category });
        } else {
            res.status(404).json({ status: false, message: 'Không tìm thấy danh mục' });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Tạo mới danh mục
router.post('/', CategoryValidator, validationResult, async (req, res) => {
    try {
        const result = await categoryController.CreateCategory(req.body);
        if (result.restored) {
            res.status(200).json({
                status: true,
                message: result.message,
                data: result.data,
            });
        } else {
            res.status(201).json({
                status: true,
                message: 'Tạo danh mục thành công',
                data: result.data,
            });
        }
    } catch (error) {
        res.status(400).send(error.message); // Sử dụng 400 cho lỗi validation/duplicate
    }
});

// Cập nhật danh mục
router.put('/:id', CategoryValidator, validationResult, async (req, res) => {
    try {
        const category = await categoryController.UpdateCategory(req.params.id, req.body);
        if (category) {
            res.status(200).json({
                status: true,
                message: 'Cập nhật danh mục thành công',
                data: category,
            });
        } else {
            res.status(404).json({ status: false, message: 'Không tìm thấy danh mục để cập nhật' });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Xóa danh mục
router.delete('/:id', async (req, res) => {
    try {
        await categoryController.DeleteCategory(req.params.id);
        res.status(200).json({ 
            status: true, 
            message: "Đã xóa danh mục và chuyển các sản phẩm liên quan về trạng thái Chưa phân loại" 
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;
