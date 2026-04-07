/**
 * Controller: promotionController.js
 *
 * Xử lý logic nghiệp vụ cho hệ thống khuyến mãi / mã giảm giá
 *
 * CHỨC NĂNG:
 * - Lấy danh sách khuyến mãi (có phân trang, tìm kiếm)
 * - Lấy chi tiết 1 khuyến mãi
 * - Tạo khuyến mãi mới (CHỈ ADMIN)
 * - Cập nhật khuyến mãi (CHỈ ADMIN)
 * - Xóa khuyến mãi - soft delete (CHỈ ADMIN)
 * - Kiểm tra và áp dụng mã giảm giá (Staff + Admin)
 *
 * PHÂN QUYỀN:
 * - Staff: Xem danh sách + kiểm tra/áp dụng mã
 * - Admin: Toàn quyền (CRUD + xem danh sách + áp dụng mã)
 */

const Promotion = require('../models/Promotion');

const promotionController = {

    // ============================================================
    // LẤY DANH SÁCH KHUYẾN MÃI (có phân trang + tìm kiếm)
    // ============================================================
    /**
     * GET /api/promotions
     *
     * Query params:
     * - page: Trang hiện tại (mặc định: 1)
     * - limit: Số item mỗi trang (mặc định: 20, max: 50)
     * - search: Tìm theo mã hoặc tên khuyến mãi
     * - type: Lọc theo loại (percent / fixed)
     * - isActive: Lọc theo trạng thái (true / false)
     */
    getAllPromotions: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 20,
                search,
                type,
                isActive
            } = req.query;

            // Xây dựng query — chỉ lấy các bản ghi chưa xóa
            const query = { isDeleted: false };

            // Tìm kiếm theo mã hoặc tên
            if (search) {
                query.$or = [
                    { code: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } }
                ];
            }

            // Lọc theo loại khuyến mãi
            if (type && ['percent', 'fixed'].includes(type)) {
                query.type = type;
            }

            // Lọc theo trạng thái kích hoạt
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            // Phân trang
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (pageNum - 1) * limitNum;

            // Thực hiện query song song (danh sách + đếm tổng)
            const [promotions, totalCount] = await Promise.all([
                Promotion.find(query)
                    .populate('createdBy', 'name email role')    // Populate người tạo
                    .populate('applicableItems', 'name price')   // Populate món áp dụng
                    .sort({ createdAt: -1 })                     // Mới nhất lên đầu
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),                                     // Tăng performance

                Promotion.countDocuments(query)
            ]);

            // Metadata phân trang
            const totalPages = Math.ceil(totalCount / limitNum);

            res.status(200).json({
                status: true,
                message: 'Lấy danh sách khuyến mãi thành công',
                data: {
                    promotions,
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
            console.error('💥 Lỗi lấy danh sách khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy danh sách khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // LẤY CHI TIẾT 1 KHUYẾN MÃI
    // ============================================================
    /**
     * GET /api/promotions/:id
     */
    getPromotionById: async (req, res) => {
        try {
            const { id } = req.params;

            const promotion = await Promotion.findOne({ _id: id, isDeleted: false })
                .populate('createdBy', 'name email role')
                .populate('applicableItems', 'name price image');

            if (!promotion) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy khuyến mãi'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Lấy thông tin khuyến mãi thành công',
                data: promotion
            });

        } catch (error) {
            console.error('💥 Lỗi lấy chi tiết khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy chi tiết khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // TẠO KHUYẾN MÃI MỚI (CHỈ ADMIN)
    // ============================================================
    /**
     * POST /api/promotions
     *
     * Body:
     * {
     *   "code": "SALE20",
     *   "name": "Giảm 20% mừng khai trương",
     *   "description": "Áp dụng cho tất cả món",
     *   "type": "percent",
     *   "value": 20,
     *   "minOrderAmount": 50000,
     *   "maxDiscount": 100000,
     *   "startDate": "2026-04-01",
     *   "endDate": "2026-04-30",
     *   "usageLimit": 100,
     *   "applicableItems": [],
     *   "isActive": true
     * }
     */
    createPromotion: async (req, res) => {
        try {
            const {
                code, name, description, type, value,
                minOrderAmount, maxDiscount,
                startDate, endDate,
                usageLimit, applicableItems, isActive
            } = req.body;

            console.log(`📢 Tạo khuyến mãi mới: "${code}" - ${name}`);

            // Kiểm tra các trường bắt buộc
            if (!code || !name || !type || value === undefined || !startDate || !endDate) {
                return res.status(400).json({
                    status: false,
                    message: 'Vui lòng điền đầy đủ: mã, tên, loại, giá trị, ngày bắt đầu và kết thúc'
                });
            }

            // Kiểm tra mã đã tồn tại chưa
            const existingPromo = await Promotion.findOne({
                code: code.toUpperCase(),
                isDeleted: false
            });

            if (existingPromo) {
                return res.status(400).json({
                    status: false,
                    message: `Mã khuyến mãi "${code.toUpperCase()}" đã tồn tại`
                });
            }

            // Tạo khuyến mãi mới
            const newPromotion = await Promotion.create({
                code,
                name,
                description: description || '',
                type,
                value,
                minOrderAmount: minOrderAmount || 0,
                maxDiscount: maxDiscount || 0,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                usageLimit: usageLimit || 0,
                applicableItems: applicableItems || [],
                isActive: isActive !== undefined ? isActive : true,
                createdBy: req.user._id      // Admin tạo
            });

            // Populate thông tin liên quan
            const populatedPromotion = await Promotion.findById(newPromotion._id)
                .populate('createdBy', 'name email role')
                .populate('applicableItems', 'name price');

            console.log(`✅ Tạo khuyến mãi thành công: ${newPromotion._id}`);

            res.status(201).json({
                status: true,
                message: 'Tạo khuyến mãi thành công',
                data: populatedPromotion
            });

        } catch (error) {
            console.error('💥 Lỗi tạo khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi tạo khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // CẬP NHẬT KHUYẾN MÃI (CHỈ ADMIN)
    // ============================================================
    /**
     * PUT /api/promotions/:id
     */
    updatePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            console.log(`🔄 Cập nhật khuyến mãi ID: ${id}`);

            // Tìm khuyến mãi
            const promotion = await Promotion.findOne({ _id: id, isDeleted: false });

            if (!promotion) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy khuyến mãi để cập nhật'
                });
            }

            // Nếu đổi mã, kiểm tra mã mới có trùng không
            if (updateData.code && updateData.code.toUpperCase() !== promotion.code) {
                const existingPromo = await Promotion.findOne({
                    code: updateData.code.toUpperCase(),
                    _id: { $ne: id },
                    isDeleted: false
                });

                if (existingPromo) {
                    return res.status(400).json({
                        status: false,
                        message: `Mã khuyến mãi "${updateData.code.toUpperCase()}" đã tồn tại`
                    });
                }
            }

            // Chuyển đổi ngày (nếu có)
            if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
            if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

            // Cập nhật từng trường
            Object.keys(updateData).forEach(key => {
                if (key !== '_id' && key !== 'createdBy' && key !== 'usedCount') {
                    promotion[key] = updateData[key];
                }
            });

            await promotion.save();

            // Populate lại thông tin
            const updatedPromotion = await Promotion.findById(id)
                .populate('createdBy', 'name email role')
                .populate('applicableItems', 'name price');

            console.log(`✅ Cập nhật khuyến mãi thành công`);

            res.status(200).json({
                status: true,
                message: 'Cập nhật khuyến mãi thành công',
                data: updatedPromotion
            });

        } catch (error) {
            console.error('💥 Lỗi cập nhật khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi cập nhật khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // XÓA KHUYẾN MÃI - SOFT DELETE (CHỈ ADMIN)
    // ============================================================
    /**
     * DELETE /api/promotions/:id
     */
    deletePromotion: async (req, res) => {
        try {
            const { id } = req.params;

            console.log(`🗑️ Xóa khuyến mãi ID: ${id}`);

            const promotion = await Promotion.findOne({ _id: id, isDeleted: false });

            if (!promotion) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy khuyến mãi để xóa'
                });
            }

            // Soft delete
            promotion.isDeleted = true;
            promotion.isActive = false;    // Tắt luôn để không ai dùng được
            await promotion.save();

            console.log(`✅ Xóa khuyến mãi thành công: ${promotion.code}`);

            res.status(200).json({
                status: true,
                message: `Đã xóa khuyến mãi "${promotion.code}" thành công`
            });

        } catch (error) {
            console.error('💥 Lỗi xóa khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi xóa khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // KIỂM TRA VÀ ÁP DỤNG MÃ GIẢM GIÁ (Staff + Admin)
    // ============================================================
    /**
     * POST /api/promotions/apply
     *
     * Body:
     * {
     *   "code": "SALE20",
     *   "orderAmount": 150000
     * }
     *
     * Response: Thông tin giảm giá (số tiền giảm, tổng sau giảm)
     */
    applyPromotion: async (req, res) => {
        try {
            const { code, orderAmount } = req.body;

            console.log(`🎫 Kiểm tra mã: "${code}" cho đơn ${orderAmount}đ`);

            // Kiểm tra dữ liệu đầu vào
            if (!code || !orderAmount) {
                return res.status(400).json({
                    status: false,
                    message: 'Vui lòng nhập mã khuyến mãi và tổng giá trị đơn hàng'
                });
            }

            // Tìm mã khuyến mãi
            const promotion = await Promotion.findOne({
                code: code.toUpperCase(),
                isDeleted: false
            });

            // Kiểm tra mã có tồn tại không
            if (!promotion) {
                return res.status(404).json({
                    status: false,
                    message: `Mã khuyến mãi "${code}" không tồn tại`
                });
            }

            // Kiểm tra mã có đang kích hoạt không
            if (!promotion.isActive) {
                return res.status(400).json({
                    status: false,
                    message: 'Mã khuyến mãi đã bị vô hiệu hóa'
                });
            }

            // Kiểm tra thời gian hiệu lực
            const now = new Date();
            if (now < promotion.startDate) {
                return res.status(400).json({
                    status: false,
                    message: `Mã khuyến mãi chưa có hiệu lực. Bắt đầu từ ${promotion.startDate.toLocaleDateString('vi-VN')}`
                });
            }

            if (now > promotion.endDate) {
                return res.status(400).json({
                    status: false,
                    message: 'Mã khuyến mãi đã hết hạn'
                });
            }

            // Kiểm tra số lần sử dụng
            if (promotion.usageLimit > 0 && promotion.usedCount >= promotion.usageLimit) {
                return res.status(400).json({
                    status: false,
                    message: 'Mã khuyến mãi đã hết lượt sử dụng'
                });
            }

            // Kiểm tra đơn hàng tối thiểu
            if (orderAmount < promotion.minOrderAmount) {
                return res.status(400).json({
                    status: false,
                    message: `Đơn hàng phải tối thiểu ${promotion.minOrderAmount.toLocaleString('vi-VN')}đ để áp dụng mã này`
                });
            }

            // Tính số tiền giảm
            const discountAmount = promotion.calculateDiscount(orderAmount);
            const finalAmount = orderAmount - discountAmount;

            console.log(`✅ Mã hợp lệ! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`);

            res.status(200).json({
                status: true,
                message: 'Áp dụng mã khuyến mãi thành công',
                data: {
                    promotion: {
                        code: promotion.code,
                        name: promotion.name,
                        type: promotion.type,
                        value: promotion.value,
                    },
                    orderAmount,                   // Tổng đơn hàng gốc
                    discountAmount,                // Số tiền được giảm
                    finalAmount,                   // Tổng sau giảm
                }
            });

        } catch (error) {
            console.error('💥 Lỗi áp dụng mã khuyến mãi:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi áp dụng mã khuyến mãi',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = promotionController;
