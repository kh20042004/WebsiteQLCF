/**
 * Routes: categoryRoutes.js (ĐÃ PHÂN QUYỀN)
 *
 * Định nghĩa RESTful routes cho menu categories (Danh mục)
 *
 * 📌 PHÂN QUYỀN:
 * - GET  /categories      → Staff + Admin (xem danh sách để biết có danh mục nào)
 * - GET  /categories/:id  → Staff + Admin (xem chi tiết)
 * - POST /categories      → CHỈ ADMIN (tạo danh mục mới)
 * - PUT  /categories/:id  → CHỈ ADMIN (sửa danh mục)
 * - DELETE /categories/:id → CHỈ ADMIN (xóa danh mục)
 *
 * Lý do:
 * - Staff cần xem danh sách categories khi tạo/sửa món ăn
 * - Nhưng chỉ Admin mới được quản lý (CRUD) categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { CategoryValidator, validationResult } = require('../utils/validatorHandler');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ============================================================
// GET /api/categories — Lấy tất cả danh mục
// Staff + Admin: Cả hai đều cần xem danh sách categories
// ============================================================
router.get('/', authenticate, requireStaff, async (req, res) => {
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


// ============================================================
// GET /api/categories/:id — Lấy chi tiết 1 danh mục
// Staff + Admin: Cả hai đều được xem chi tiết
// ============================================================
router.get('/:id', authenticate, requireStaff, async (req, res) => {
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


// ============================================================
// POST /api/categories — Tạo mới danh mục
// CHỈ ADMIN: Chỉ quản lý mới được tạo danh mục mới
// ============================================================
router.post(
    '/',
    authenticate,           // Bước 1: Xác thực token
    requireAdmin,           // Bước 2: Kiểm tra phải admin
    CategoryValidator,      // Bước 3: Validate dữ liệu
    validationResult,       // Bước 4: Xử lý lỗi validation
    async (req, res) => {
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
            res.status(400).send(error.message);
        }
    }
);


// ============================================================
// PUT /api/categories/:id — Cập nhật danh mục
// CHỈ ADMIN: Chỉ quản lý mới được sửa danh mục
// ============================================================
router.put(
    '/:id',
    authenticate,           // Bước 1: Xác thực token
    requireAdmin,           // Bước 2: Kiểm tra phải admin
    CategoryValidator,      // Bước 3: Validate dữ liệu
    validationResult,       // Bước 4: Xử lý lỗi validation
    async (req, res) => {
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
    }
);


// ============================================================
// DELETE /api/categories/:id — Xóa danh mục
// CHỈ ADMIN: Chỉ quản lý mới được xóa danh mục
// Lý do: Tránh nhân viên xóa nhầm danh mục quan trọng
// ============================================================
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
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
