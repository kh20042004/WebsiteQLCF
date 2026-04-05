/**
 * Controller: notificationController.js
 * 
 * Xử lý logic nghiệp vụ cho hệ thống thông báo
 * 
 * CHỨC NĂNG:
 * - Lấy danh sách thông báo có phân trang
 * - Tạo thông báo mới
 * - Đánh dấu đã đọc/chưa đọc  
 * - Xóa thông báo
 * - Thống kê thông báo
 * 
 * PHÂN QUYỀN:
 * - User: Chỉ xem thông báo của mình
 * - Admin: Xem tất cả + tạo thông báo hệ thống
 */

const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = {

    /**
     * LẤY DANH SÁCH THÔNG BÁO CỦA USER
     * 
     * Query params:
     * - page: Trang hiện tại (mặc định: 1)
     * - limit: Số thông báo mỗi trang (mặc định: 20, max: 50)
     * - type: Lọc theo loại (success, warning, error, info, order, system)
     * - isRead: Lọc theo trạng thái đọc (true/false)
     * 
     * Response: Danh sách thông báo + metadata phân trang
     */
    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user._id;  // Từ middleware authenticate
            const { 
                page = 1, 
                limit = 20, 
                type, 
                isRead 
            } = req.query;

            // Validation tham số
            const pageNum = Math.max(1, parseInt(page));
            const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
            const skip = (pageNum - 1) * limitNum;

            // Xây dựng query
            let query = {
                $or: [
                    { userId: userId },      // Thông báo riêng cho user
                    { userId: null }         // Thông báo broadcast cho tất cả
                ],
                isDeleted: false
            };

            // Lọc theo type nếu có
            if (type && ['success', 'warning', 'error', 'info', 'order', 'system'].includes(type)) {
                query.type = type;
            }

            // Lọc theo trạng thái đọc nếu có
            if (isRead !== undefined) {
                query.isRead = isRead === 'true';
            }

            // ✅ Đã tắt console.log spam
            // console.log(`📋 Lấy thông báo cho user ${userId}, page ${pageNum}, limit ${limitNum}`);

            // Thực hiện query với phân trang
            const [notifications, totalCount] = await Promise.all([
                Notification.find(query)
                    .populate('createdBy', 'username role')  // Populate thông tin người tạo
                    .sort({ createdAt: -1 })  // Mới nhất trước
                    .skip(skip)
                    .limit(limitNum)
                    .lean(),  // Tăng performance
                
                Notification.countDocuments(query)
            ]);

            // Tính toán metadata phân trang
            const totalPages = Math.ceil(totalCount / limitNum);
            const hasNextPage = pageNum < totalPages;
            const hasPrevPage = pageNum > 1;

            // ✅ Đã tắt console.log spam
            // console.log(`✅ Tìm thấy ${notifications.length}/${totalCount} thông báo`);

            res.status(200).json({
                status: true,
                message: `Lấy thông báo thành công`,
                data: {
                    notifications,
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalCount,
                        hasNextPage,
                        hasPrevPage,
                        limit: limitNum
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ĐẾM SỐ THÔNG BÁO CHƯA ĐỌC
     * 
     * Response: Số lượng thông báo chưa đọc (để hiển thị badge)
     */
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user._id;

            const unreadCount = await Notification.countUnreadForUser(userId);

            // ✅ Đã tắt console.log spam
            // console.log(`📊 User ${userId} có ${unreadCount} thông báo chưa đọc`);

            res.status(200).json({
                status: true,
                message: 'Lấy số thông báo chưa đọc thành công',
                data: {
                    unreadCount,
                    hasUnread: unreadCount > 0
                }
            });

        } catch (error) {
            console.error('💥 Lỗi đếm thông báo chưa đọc:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi đếm thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ĐÁNH DẤU THÔNG BÁO ĐÃ ĐỌC
     * 
     * Params: notificationId
     * Body: { isRead: true/false } (optional, mặc định true)
     * 
     * Response: Thông báo đã cập nhật
     */
    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user._id;
            const { isRead = true } = req.body;

            console.log(`📖 Đánh dấu thông báo ${notificationId} ${isRead ? 'đã đọc' : 'chưa đọc'}`);

            // Tìm thông báo (chỉ của user hiện tại hoặc broadcast)
            const notification = await Notification.findOne({
                _id: notificationId,
                $or: [
                    { userId: userId },
                    { userId: null }  // Thông báo broadcast
                ],
                isDeleted: false
            });

            if (!notification) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy thông báo hoặc bạn không có quyền truy cập'
                });
            }

            // Cập nhật trạng thái
            notification.isRead = isRead;
            if (isRead) {
                notification.readAt = new Date();
            } else {
                notification.readAt = null;
            }

            const updatedNotification = await notification.save();

            console.log(`✅ Đánh dấu thông báo thành công`);

            res.status(200).json({
                status: true,
                message: `Đánh dấu thông báo ${isRead ? 'đã đọc' : 'chưa đọc'} thành công`,
                data: updatedNotification
            });

        } catch (error) {
            console.error('💥 Lỗi đánh dấu thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi đánh dấu thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * ĐÁNH DẤU TẤT CẢ THÔNG BÁO ĐÃ ĐỌC
     * 
     * Response: Số lượng thông báo đã đánh dấu
     */
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user._id;

            console.log(`📖📖 Đánh dấu tất cả thông báo của user ${userId} là đã đọc`);

            const result = await Notification.updateMany(
                {
                    $or: [
                        { userId: userId },
                        { userId: null }
                    ],
                    isRead: false,
                    isDeleted: false
                },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            console.log(`✅ Đánh dấu ${result.modifiedCount} thông báo đã đọc`);

            res.status(200).json({
                status: true,
                message: `Đánh dấu ${result.modifiedCount} thông báo đã đọc thành công`,
                data: {
                    modifiedCount: result.modifiedCount
                }
            });

        } catch (error) {
            console.error('💥 Lỗi đánh dấu tất cả thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi đánh dấu tất cả thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * TẠO THÔNG BÁO MỚI (CHỈ ADMIN)
     * 
     * Body: {
     *   title: string (required)
     *   message: string (required) 
     *   type: enum (success|warning|error|info|order|system)
     *   userId: ObjectId (null = broadcast)
     *   priority: number (1-5)
     *   actionUrl: string (optional)
     *   icon: string (optional)
     *   expiresAt: Date (optional)
     * }
     */
    createNotification: async (req, res) => {
        try {
            const {
                title,
                message,
                type = 'info',
                userId = null,  // null = broadcast cho tất cả
                priority = 3,
                actionUrl,
                icon,
                expiresAt
            } = req.body;

            console.log(`📢 Tạo thông báo mới: "${title}"`);

            // Validation cơ bản
            if (!title || !message) {
                return res.status(400).json({
                    status: false,
                    message: 'Tiêu đề và nội dung thông báo không được để trống'
                });
            }

            // Nếu có userId, kiểm tra user có tồn tại không
            if (userId) {
                const targetUser = await User.findById(userId);
                if (!targetUser) {
                    return res.status(404).json({
                        status: false,
                        message: 'Không tìm thấy user để gửi thông báo'
                    });
                }
            }

            // Tạo thông báo
            const newNotification = await Notification.create({
                title,
                message,
                type,
                userId,
                priority,
                actionUrl,
                icon,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: req.user._id  // Admin tạo thông báo
            });

            console.log(`✅ Tạo thông báo thành công: ${newNotification._id}`);

            // TODO: Gửi thông báo realtime qua Socket.IO (implement sau)
            // socketIO.emit('newNotification', newNotification);

            res.status(201).json({
                status: true,
                message: 'Tạo thông báo thành công',
                data: newNotification
            });

        } catch (error) {
            console.error('💥 Lỗi tạo thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi tạo thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * XÓA THÔNG BÁO (SOFT DELETE)
     * 
     * Params: notificationId
     * Response: Xác nhận xóa thành công
     */
    deleteNotification: async (req, res) => {
        try {
            // Route param là :id, không phải :notificationId
            const { id } = req.params;
            const userId = req.user._id;
            const userRole = req.user.role;

            console.log(`🗑️ Xóa thông báo ${id}`);

            // Tìm thông báo
            let query = { _id: id, isDeleted: false };

            // Nếu không phải admin, chỉ được xóa thông báo của mình
            // CHÚ Ý: Role trong database là 'admin' (chữ thường)
            if (userRole !== 'admin') {
                query.$or = [
                    { userId: userId },
                    { userId: null }  // Broadcast notification
                ];
            }

            const notification = await Notification.findOne(query);

            if (!notification) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy thông báo hoặc bạn không có quyền xóa'
                });
            }

            // Soft delete
            notification.isDeleted = true;
            await notification.save();

            console.log(`✅ Xóa thông báo thành công`);

            res.status(200).json({
                status: true,
                message: 'Xóa thông báo thành công'
            });

        } catch (error) {
            console.error('💥 Lỗi xóa thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi xóa thông báo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * LẤY THỐNG KÊ THÔNG BÁO (CHỈ ADMIN)
     * 
     * Response: Số liệu thống kê các loại thông báo
     */
    getNotificationStats: async (req, res) => {
        try {
            console.log(`📊 Lấy thống kê thông báo`);

            const stats = await Notification.aggregate([
                { $match: { isDeleted: false } },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        unreadCount: {
                            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const totalCount = await Notification.countDocuments({ isDeleted: false });
            const totalUnreadCount = await Notification.countDocuments({ 
                isDeleted: false, 
                isRead: false 
            });

            console.log(`✅ Thống kê: ${totalCount} thông báo, ${totalUnreadCount} chưa đọc`);

            res.status(200).json({
                status: true,
                message: 'Lấy thống kê thông báo thành công',
                data: {
                    byType: stats,
                    total: {
                        count: totalCount,
                        unreadCount: totalUnreadCount
                    }
                }
            });

        } catch (error) {
            console.error('💥 Lỗi lấy thống kê thông báo:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy thống kê',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

};