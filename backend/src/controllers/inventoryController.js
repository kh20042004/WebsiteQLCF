/**
 * Controller: inventoryController.js
 *
 * Xử lý logic nghiệp vụ cho quản lý nguyên liệu / kho hàng
 *
 * CHỨC NĂNG:
 * - Lấy danh sách nguyên liệu (có phân trang, tìm kiếm, lọc)
 * - Lấy chi tiết 1 nguyên liệu
 * - Tạo nguyên liệu mới (CHỈ ADMIN)
 * - Cập nhật nguyên liệu (CHỈ ADMIN)
 * - Nhập thêm hàng / Restock (Staff + Admin)
 * - Xóa nguyên liệu - soft delete (CHỈ ADMIN)
 * - Thống kê tổng quan kho (Admin)
 * - Lấy danh sách nguyên liệu sắp hết (cảnh báo)
 *
 * PHÂN QUYỀN:
 * - Staff: Xem danh sách + nhập hàng
 * - Admin: Toàn quyền (CRUD + nhập hàng + thống kê)
 */

const Inventory = require('../models/Inventory');

const inventoryController = {

    // ============================================================
    // LẤY DANH SÁCH NGUYÊN LIỆU (có phân trang + tìm kiếm + lọc)
    // ============================================================
    /**
     * GET /api/inventory
     *
     * Query params:
     * - page: Trang hiện tại (mặc định: 1)
     * - limit: Số item mỗi trang (mặc định: 20, max: 50)
     * - search: Tìm theo tên nguyên liệu
     * - category: Lọc theo danh mục (ingredient/topping/packaging/other)
     * - status: Lọc theo trạng thái (in_stock/low_stock/out_of_stock)
     */
    getAllInventory: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                category,
                status
            } = req.query;

            // Xây dựng query — chỉ lấy bản ghi chưa xóa
            const query = { isDeleted: false };

            // Tìm kiếm theo tên
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            // Lọc theo danh mục
            if (category && ['ingredient', 'topping', 'packaging', 'other'].includes(category)) {
                query.category = category;
            }

            // Lọc theo trạng thái tồn kho
            if (status && ['in_stock', 'low_stock', 'out_of_stock'].includes(status)) {
                query.status = status;
            }

            // Phân trang
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (pageNum - 1) * limitNum;

            // Thực hiện query song song
            const [inventoryItems, totalCount] = await Promise.all([
                Inventory.find(query)
                    .populate('relatedItems', 'name price image')  // Populate món liên quan
                    .populate('updatedBy', 'name email role')      // Populate người cập nhật
                    .sort({ createdAt: -1 })                       // Mới nhất lên đầu
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),

                Inventory.countDocuments(query)
            ]);

            // Metadata phân trang
            const totalPages = Math.ceil(totalCount / limitNum);

            res.status(200).json({
                status: true,
                message: 'Lấy danh sách nguyên liệu thành công',
                data: {
                    inventory: inventoryItems,
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalCount,
                        limit: limitNum,
                        hasNextPage: pageNum < totalPages,
                        hasPrevPage: pageNum > 1
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy danh sách nguyên liệu:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy danh sách nguyên liệu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // LẤY CHI TIẾT 1 NGUYÊN LIỆU
    // ============================================================
    /**
     * GET /api/inventory/:id
     */
    getInventoryById: async (req, res) => {
        try {
            const { id } = req.params;

            const item = await Inventory.findOne({ _id: id, isDeleted: false })
                .populate('relatedItems', 'name price image')
                .populate('updatedBy', 'name email role')
                .populate('restockHistory.createdBy', 'name email');

            if (!item) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy nguyên liệu'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Lấy thông tin nguyên liệu thành công',
                data: item
            });

        } catch (error) {
            console.error('💥 Lỗi lấy chi tiết nguyên liệu:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy chi tiết nguyên liệu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // TẠO NGUYÊN LIỆU MỚI (CHỈ ADMIN)
    // ============================================================
    /**
     * POST /api/inventory
     *
     * Body:
     * {
     *   "name": "Cà phê hạt Robusta",
     *   "description": "Cà phê hạt rang xay loại 1",
     *   "category": "ingredient",
     *   "unit": "kg",
     *   "quantity": 50,
     *   "minQuantity": 10,
     *   "price": 150000,
     *   "supplier": "Công ty TNHH Trung Nguyên",
     *   "relatedItems": ["65abc123...", "65abc456..."]
     * }
     */
    createInventory: async (req, res) => {
        try {
            const {
                name, description, category, unit,
                quantity, minQuantity, price,
                supplier, relatedItems
            } = req.body;

            console.log(`📦 Tạo nguyên liệu mới: "${name}"`);

            // Kiểm tra các trường bắt buộc
            if (!name || !unit) {
                return res.status(400).json({
                    status: false,
                    message: 'Vui lòng điền đầy đủ: tên nguyên liệu và đơn vị tính'
                });
            }

            // Kiểm tra tên đã tồn tại chưa
            const existingItem = await Inventory.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                isDeleted: false
            });

            if (existingItem) {
                return res.status(400).json({
                    status: false,
                    message: `Nguyên liệu "${name}" đã tồn tại trong kho`
                });
            }

            // Tạo nguyên liệu mới
            const newItem = await Inventory.create({
                name: name.trim(),
                description: description || '',
                category: category || 'ingredient',
                unit: unit.trim(),
                quantity: quantity || 0,
                minQuantity: minQuantity || 10,
                price: price || 0,
                supplier: supplier || '',
                relatedItems: relatedItems || [],
                updatedBy: req.user._id,
                lastRestocked: quantity > 0 ? new Date() : null,
                // Nếu tạo với quantity > 0, ghi nhận lịch sử nhập hàng đầu tiên
                restockHistory: quantity > 0 ? [{
                    quantity,
                    price: price || 0,
                    date: new Date(),
                    createdBy: req.user._id,
                    note: 'Nhập kho lần đầu'
                }] : []
            });

            // Populate thông tin liên quan
            const populatedItem = await Inventory.findById(newItem._id)
                .populate('relatedItems', 'name price')
                .populate('updatedBy', 'name email role');

            console.log(`✅ Tạo nguyên liệu thành công: ${newItem._id}`);

            res.status(201).json({
                status: true,
                message: 'Tạo nguyên liệu thành công',
                data: populatedItem
            });

        } catch (error) {
            console.error('💥 Lỗi tạo nguyên liệu:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi tạo nguyên liệu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // CẬP NHẬT NGUYÊN LIỆU (CHỈ ADMIN)
    // ============================================================
    /**
     * PUT /api/inventory/:id
     */
    updateInventory: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            console.log(`🔄 Cập nhật nguyên liệu ID: ${id}`);

            // Tìm nguyên liệu
            const item = await Inventory.findOne({ _id: id, isDeleted: false });

            if (!item) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy nguyên liệu để cập nhật'
                });
            }

            // Nếu đổi tên, kiểm tra tên mới có trùng không
            if (updateData.name && updateData.name.trim().toLowerCase() !== item.name.toLowerCase()) {
                const existingItem = await Inventory.findOne({
                    name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') },
                    _id: { $ne: id },
                    isDeleted: false
                });

                if (existingItem) {
                    return res.status(400).json({
                        status: false,
                        message: `Nguyên liệu "${updateData.name}" đã tồn tại`
                    });
                }
            }

            // Cập nhật các trường (trừ restockHistory, updatedBy)
            const allowedFields = ['name', 'description', 'category', 'unit', 'quantity',
                'minQuantity', 'price', 'supplier', 'relatedItems'];

            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    item[field] = updateData[field];
                }
            });

            // Cập nhật người sửa
            item.updatedBy = req.user._id;

            await item.save(); // pre-save middleware sẽ tự cập nhật status

            // Populate lại thông tin
            const updatedItem = await Inventory.findById(id)
                .populate('relatedItems', 'name price')
                .populate('updatedBy', 'name email role');

            console.log(`✅ Cập nhật nguyên liệu thành công`);

            res.status(200).json({
                status: true,
                message: 'Cập nhật nguyên liệu thành công',
                data: updatedItem
            });

        } catch (error) {
            console.error('💥 Lỗi cập nhật nguyên liệu:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi cập nhật nguyên liệu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // NHẬP THÊM HÀNG / RESTOCK (Staff + Admin)
    // ============================================================
    /**
     * POST /api/inventory/:id/restock
     *
     * Body:
     * {
     *   "quantity": 20,
     *   "price": 150000,
     *   "note": "Nhập từ nhà cung cấp Trung Nguyên"
     * }
     */
    restockInventory: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity, price, note } = req.body;

            console.log(`📦 Nhập thêm hàng - Nguyên liệu ID: ${id}, SL: ${quantity}`);

            // Kiểm tra dữ liệu đầu vào
            if (!quantity || quantity <= 0) {
                return res.status(400).json({
                    status: false,
                    message: 'Số lượng nhập phải lớn hơn 0'
                });
            }

            // Tìm nguyên liệu
            const item = await Inventory.findOne({ _id: id, isDeleted: false });

            if (!item) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy nguyên liệu để nhập hàng'
                });
            }

            // Cập nhật số lượng tồn kho
            const oldQuantity = item.quantity;
            item.quantity += Number(quantity);

            // Cập nhật giá nhập (nếu có)
            if (price) {
                item.price = price;
            }

            // Cập nhật ngày nhập hàng gần nhất
            item.lastRestocked = new Date();

            // Ghi nhận lịch sử nhập hàng
            item.restockHistory.push({
                quantity: Number(quantity),
                price: price || item.price,
                date: new Date(),
                createdBy: req.user._id,
                note: note || ''
            });

            // Cập nhật người sửa
            item.updatedBy = req.user._id;

            await item.save(); // pre-save middleware sẽ tự cập nhật status

            // Populate lại
            const updatedItem = await Inventory.findById(id)
                .populate('relatedItems', 'name price')
                .populate('updatedBy', 'name email role');

            console.log(`✅ Nhập hàng thành công: ${oldQuantity} → ${item.quantity} ${item.unit}`);

            res.status(200).json({
                status: true,
                message: `Nhập hàng thành công! Tồn kho: ${oldQuantity} → ${item.quantity} ${item.unit}`,
                data: updatedItem
            });

        } catch (error) {
            console.error('💥 Lỗi nhập hàng:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi nhập hàng',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // XÓA NGUYÊN LIỆU - SOFT DELETE (CHỈ ADMIN)
    // ============================================================
    /**
     * DELETE /api/inventory/:id
     */
    deleteInventory: async (req, res) => {
        try {
            const { id } = req.params;

            console.log(`🗑️ Xóa nguyên liệu ID: ${id}`);

            const item = await Inventory.findOne({ _id: id, isDeleted: false });

            if (!item) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy nguyên liệu để xóa'
                });
            }

            // Soft delete
            item.isDeleted = true;
            await item.save();

            console.log(`✅ Xóa nguyên liệu thành công: ${item.name}`);

            res.status(200).json({
                status: true,
                message: `Đã xóa nguyên liệu "${item.name}" thành công`
            });

        } catch (error) {
            console.error('💥 Lỗi xóa nguyên liệu:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi xóa nguyên liệu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // THỐNG KÊ TỔNG QUAN KHO (Admin)
    // ============================================================
    /**
     * GET /api/inventory/stats
     * Trả về số liệu tổng quan kho hàng
     */
    getInventoryStats: async (req, res) => {
        try {
            const stats = await Inventory.getInventoryStats();

            res.status(200).json({
                status: true,
                message: 'Lấy thống kê kho hàng thành công',
                data: stats
            });

        } catch (error) {
            console.error('💥 Lỗi lấy thống kê kho:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy thống kê kho',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // LẤY NGUYÊN LIỆU SẮP HẾT (Cảnh báo)
    // ============================================================
    /**
     * GET /api/inventory/low-stock
     * Trả về danh sách nguyên liệu đang ở mức thấp hoặc hết hàng
     */
    getLowStockItems: async (req, res) => {
        try {
            const lowStockItems = await Inventory.getLowStockItems();

            res.status(200).json({
                status: true,
                message: 'Lấy danh sách nguyên liệu sắp hết thành công',
                data: {
                    count: lowStockItems.length,
                    items: lowStockItems
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy nguyên liệu sắp hết:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy nguyên liệu sắp hết',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = inventoryController;
