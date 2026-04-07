/**
 * Routes: itemRoutes.js (ĐÃ PHÂN QUYỀN)
 *
 * Định nghĩa RESTful routes cho menu items (Sản phẩm/Món ăn)
 *
 * 📌 PHÂN QUYỀN:
 * - GET  /items         → Staff + Admin (xem menu để biết món nào còn/hết khi phục vụ)
 * - GET  /items/:id     → Staff + Admin (xem chi tiết món)
 * - POST /items         → CHỈ ADMIN (thêm món mới vào menu)
 * - PUT  /items/:id     → CHỈ ADMIN (cập nhật món: giá, tên, hình ảnh...)
 * - DELETE /items/:id   → CHỈ ADMIN (xóa món khỏi menu)
 *
 * Lý do:
 * - Staff cần xem menu để biết món nào Available/Out of Stock khi gọi món cho khách
 * - Nhưng chỉ Admin mới được quản lý menu (CRUD items) để tránh sai sót
 */

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { uploadImage } = require('../utils/uploadHandler');
const { ItemValidator, validationResult } = require('../utils/validatorHandler');

// Import middleware xác thực và phân quyền
const authenticate = require('../middlewares/authenticate');
const { requireAdmin, requireStaff } = require('../middlewares/authenticate');


// ============================================================
// GET /api/items — Lấy tất cả món ăn
// Public: Tất cả người dùng (kể cả khách không đăng nhập) đều có thể xem menu
// Query params: ?search=... &category=... &status=Available|Out of Stock
// ============================================================
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


// ============================================================
// GET /api/items/:id — Lấy chi tiết 1 món ăn
// Staff + Admin: Cả hai đều được xem chi tiết món
// ============================================================
router.get('/:id', authenticate, requireStaff, async (req, res) => {
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


// ============================================================
// POST /api/items — Tạo mới món ăn
// CHỈ ADMIN: Chỉ quản lý mới được thêm món vào menu
// Body: form-data với các field (name, price, category, status, image)
// ============================================================
router.post(
    '/',
    authenticate,                      // Bước 1: Xác thực token
    requireAdmin,                      // Bước 2: Kiểm tra phải admin
    uploadImage.single('image'),       // Bước 3: Multer xử lý upload ảnh (field: 'image')
    ItemValidator,                     // Bước 4: Validate dữ liệu
    validationResult,                  // Bước 5: Xử lý lỗi validation
    async (req, res) => {
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
            res.status(400).send(error.message);
        }
    }
);


// ============================================================
// PUT /api/items/:id — Cập nhật món ăn
// CHỈ ADMIN: Chỉ quản lý mới được sửa thông tin món (giá, tên, ảnh...)
// ============================================================
router.put(
    '/:id',
    authenticate,                      // Bước 1: Xác thực token
    requireAdmin,                      // Bước 2: Kiểm tra phải admin
    (req, res, next) => {              // Bước 3: Xử lý upload ảnh linh hoạt
        /**
         * VẤN ĐỀ: Khi update món ăn, có thể có hoặc không có ảnh mới
         * - Nếu có ảnh: cần dùng .single('image') để nhận vào req.file
         * - Nếu không có ảnh: cần parse form-data để có req.body
         * 
         * GIẢI PHÁP: Dùng .single('image') trước, nếu lỗi thì fallback sang .none()
         */
        uploadImage.single('image')(req, res, (err) => {
            if (err) {
                // Nếu có lỗi upload file (vd: không có field 'image')
                // → Fallback sang .none() để parse form-data thường
                console.log('🔄 Không có ảnh upload, chỉ parse form-data');
                uploadImage.none()(req, res, next);
            } else {
                // Upload file thành công hoặc không có file
                console.log('✅ Parse form-data thành công');
                next();
            }
        });
    },
    ItemValidator,                     // Bước 4: Validate dữ liệu (name, price, category)
    validationResult,                  // Bước 5: Xử lý lỗi validation và trả JSON error
    async (req, res) => {
        /**
         * CONTROLLER XỬ LÝ CHÍNH - CẬP NHẬT MÓN ĂN
         * 
         * Input nhận được:
         * - req.params.id: ID của món ăn cần update
         * - req.body: Dữ liệu form (name, price, category, status)
         * - req.file: File ảnh mới (nếu có) từ multer
         * 
         * Luồng xử lý:
         * 1. Gọi itemController.UpdateItem với 3 tham số
         * 2. Controller sẽ tự động upload ảnh lên Cloudinary (nếu có)
         * 3. Cập nhật database với dữ liệu mới
         * 4. Trả về JSON response
         */
        try {
            console.log(`📝 Đang xử lý cập nhật món ăn ID: ${req.params.id}`);
            console.log('📦 Dữ liệu nhận được:', {
                body: req.body,
                hasFile: !!req.file,
                fileName: req.file ? req.file.originalname : 'Không có file'
            });

            // Gọi controller để thực hiện update
            const updatedItem = await itemController.UpdateItem(
                req.params.id,    // ID món ăn
                req.body,         // Dữ liệu cập nhật (name, price, category, status)
                req.file          // File ảnh (có thể null nếu không upload ảnh mới)
            );

            /**
             * XỬ LÝ KẾT QUẢ TRẢ VỀ
             * - Nếu tìm thấy và cập nhật thành công → 200 OK
             * - Nếu không tìm thấy món ăn (ID sai hoặc đã xóa) → 404 Not Found
             */
            if (updatedItem) {
                console.log('✅ Cập nhật món ăn thành công');
                res.status(200).json({
                    status: true,
                    message: 'Cập nhật món ăn thành công',
                    data: {
                        _id: updatedItem._id,
                        name: updatedItem.name,
                        slug: updatedItem.slug,
                        price: updatedItem.price,
                        category: updatedItem.category,
                        image: updatedItem.image,
                        status: updatedItem.status,
                        updatedAt: updatedItem.updatedAt
                    }
                });
            } else {
                console.log('❌ Không tìm thấy món ăn để cập nhật');
                res.status(404).json({ 
                    status: false, 
                    message: 'Không tìm thấy món ăn để cập nhật. Kiểm tra lại ID món ăn.' 
                });
            }

        } catch (error) {
            /**
             * XỬ LÝ LỖI TOÀN DIỆN
             * 
             * Các loại lỗi có thể xảy ra:
             * 1. Validation error (name quá ngắn, price không hợp lệ)
             * 2. Database error (MongoDB connection, invalid ObjectId)
             * 3. Cloudinary error (upload ảnh thất bại)
             * 4. File processing error (file không đúng định dạng)
             */
            console.error('💥 Lỗi khi cập nhật món ăn:', error.message);
            console.error('📊 Stack trace:', error.stack);

            // Xác định loại lỗi và trả về status code phù hợp
            let statusCode = 500;
            let errorMessage = 'Lỗi server không xác định';

            if (error.message.includes('Cast to ObjectId failed')) {
                statusCode = 400;
                errorMessage = 'ID món ăn không đúng định dạng';
            } else if (error.message.includes('validation')) {
                statusCode = 400;
                errorMessage = 'Dữ liệu không hợp lệ: ' + error.message;
            } else if (error.message.includes('Upload ảnh thất bại')) {
                statusCode = 400;
                errorMessage = error.message;
            } else if (error.message.includes('Món ăn không tồn tại')) {
                statusCode = 404;
                errorMessage = error.message;
            }

            res.status(statusCode).json({
                status: false,
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);


// ============================================================
// DELETE /api/items/:id — Xóa món ăn (Soft delete)
// CHỈ ADMIN: Chỉ quản lý mới được xóa món khỏi menu
// Lý do: Tránh nhân viên xóa nhầm món đang bán
// ============================================================
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
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
