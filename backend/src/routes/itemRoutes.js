var express = require('express');
var router = express.Router();
let itemController = require('../controllers/itemController');
let { uploadImage } = require('../utils/uploadHandler');
let { ItemValidator, validationResult } = require('../utils/validatorHandler');

/**
 * Định nghĩa RESTful routes cho menu items (Sản phẩm)
 */

// Lấy tất cả món ăn
router.get('/', async (req, res) => {
    try {
        const { search, category, status } = req.query;
        const items = await itemController.GetAllItems(search, category, status);
        res.status(200).json({
            status: true,
            results: items.length,
            data: items,
        });
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Lấy chi tiết 1 món ăn
router.get('/:id', async (req, res) => {
    try {
        const item = await itemController.GetItemById(req.params.id);
        if (item) {
            res.status(200).json({ status: true, data: item });
        } else {
            res.status(404).json({ status: false, message: 'Không tìm thấy món ăn' });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Tạo mới món ăn
router.post('/', uploadImage.single('image'), ItemValidator, validationResult, async (req, res) => {
    try {
        const result = await itemController.CreateItem(req.body, req.file);
        if (result.restored) {
            res.status(200).json({
                status: true,
                message: result.message,
                data: result.data,
            });
        } else {
            res.status(201).json({
                status: true,
                message: 'Tạo món ăn thành công',
                data: result.data,
            });
        }
    } catch (error) {
        res.status(400).send(error.message); // Sử dụng 400 cho lỗi validation/duplicate
    }
});

// Cập nhật món ăn
router.put('/:id', uploadImage.single('image'), ItemValidator, validationResult, async (req, res) => {
    try {
        const item = await itemController.UpdateItem(req.params.id, req.body, req.file);
        if (item) {
            res.status(200).json({
                status: true,
                message: 'Cập nhật món ăn thành công',
                data: item,
            });
        } else {
            res.status(404).json({ status: false, message: 'Không tìm thấy món ăn để cập nhật' });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

// Xóa món ăn (Soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const item = await itemController.DeleteItem(req.params.id);
        if (item) {
            res.status(200).json({ status: true, message: 'Xóa món ăn thành công' });
        } else {
            res.status(404).json({ status: false, message: 'Không tìm thấy món ăn để xóa' });
        }
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;
