/**
 * Controller: reportController
 *
 * Nhiệm vụ: Cung cấp API thống kê và báo cáo doanh thu cho quán cà phê
 *
 * Các endpoint:
 * - GET /reports/daily?date=YYYY-MM-DD  → Doanh thu + số đơn trong ngày
 * - GET /reports/top-items?date=YYYY-MM-DD → Top 5 món bán chạy nhất
 */

const Order = require('../models/Order');

/**
 * Hàm tiện ích: Tính khoảng thời gian đầu/cuối ngày từ chuỗi date
 *
 * @param {string} dateStr - Ngày theo định dạng 'YYYY-MM-DD', nếu không có thì dùng ngày hôm nay
 * @returns {{ startOfDay, endOfDay, reportDate }}
 */
const getDateRange = (dateStr) => {
    let startOfDay, endOfDay, reportDate;
    if (dateStr) {
        // Nếu client truyền ngày cụ thể → parse và tạo khoảng 00:00:00 → 23:59:59
        const [year, month, day] = dateStr.split('-');
        startOfDay = new Date(year, month - 1, day, 0, 0, 0);
        endOfDay   = new Date(year, month - 1, day, 23, 59, 59, 999);
        reportDate = dateStr;
    } else {
        // Mặc định: ngày hôm nay theo giờ máy chủ
        const now = new Date();
        startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        reportDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    return { startOfDay, endOfDay, reportDate };
};

const reportController = {

    /**
     * GET /reports/daily?date=YYYY-MM-DD
     *
     * Trả về báo cáo doanh thu trong ngày:
     * - Tổng số đơn đã hoàn thành (status: 'done')
     * - Tổng doanh thu (tổng các totalPrice của đơn đã done)
     * - Ngày báo cáo
     */
    getDailyReport: async (req, res) => {
        try {
            const { startOfDay, endOfDay, reportDate } = getDateRange(req.query.date);

            // Lấy tất cả đơn đã hoàn thành (status = 'done') trong khoảng ngày
            // Lưu ý: status phải là 'done' — không phải 'Completed' (sai enum)
            const orders = await Order.find({
                status: 'done',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            // Tính tổng doanh thu từ field totalPrice (không phải totalAmount)
            const totalRevenue = orders.reduce(
                (sum, order) => sum + (order.totalPrice || 0),
                0
            );

            res.status(200).json({
                status: true,
                message: 'Lấy báo cáo doanh thu thành công',
                data: {
                    date: reportDate,
                    totalRevenue,           // Tổng tiền thu được trong ngày
                    totalOrders: orders.length  // Số đơn đã hoàn thành trong ngày
                }
            });
        } catch (error) {
            console.error('💥 Lỗi getDailyReport:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi khi lấy báo cáo doanh thu',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * GET /reports/top-items?date=YYYY-MM-DD
     *
     * Trả về top 5 món bán chạy nhất trong ngày:
     * - Dùng MongoDB Aggregation Pipeline
     * - Chỉ tính từ các đơn có status: 'done' (đã thanh toán)
     * - Tổng hợp số lượng bán theo từng món (item._id)
     * - Join với collection 'items' để lấy tên và hình ảnh
     */
    getTopItems: async (req, res) => {
        try {
            const { startOfDay, endOfDay } = getDateRange(req.query.date);

            console.log(`📊 Top items query: startOfDay=${startOfDay}, endOfDay=${endOfDay}`);

            const topItems = await Order.aggregate([
                // Bước 1: Lọc đơn đã hoàn thành trong khoảng ngày
                // Lưu ý: status = 'done' — đồng bộ với Order model enum
                {
                    $match: {
                        status: 'done',
                        createdAt: { $gte: startOfDay, $lte: endOfDay }
                    }
                },

                // Bước 2: Tách mảng items thành từng document riêng lẻ
                { $unwind: '$items' },

                // Bước 3: Gom nhóm theo item._id, cộng dồn số lượng
                {
                    $group: {
                        _id: '$items.item',
                        totalQuantity: { $sum: '$items.quantity' },
                        // Lấy tên món từ snapshot 'name' trong order item
                        name: { $first: '$items.name' }
                    }
                },

                // Bước 4: Sắp xếp giảm dần theo số lượng bán
                { $sort: { totalQuantity: -1 } },

                // Bước 5: Chỉ lấy top 5
                { $limit: 5 },

                // Bước 6: Join với collection 'items' để lấy hình ảnh (nếu có)
                {
                    $lookup: {
                        from: 'items',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'itemInfo'
                    }
                },

                // Bước 7: Unwind kết quả join (có thể không có nếu món đã bị xóa)
                {
                    $unwind: {
                        path: '$itemInfo',
                        preserveNullAndEmptyArrays: true // Giữ item dù không tìm thấy trong collection
                    }
                },

                // Bước 8: Chọn các trường cần trả về
                {
                    $project: {
                        _id: 0,
                        itemId: '$_id',
                        // Ưu tiên tên từ snapshot, fallback sang itemInfo nếu có
                        name: { $ifNull: ['$name', '$itemInfo.name'] },
                        image: '$itemInfo.image',
                        totalSold: '$totalQuantity'
                    }
                }
            ]);

            console.log(`📊 Found ${topItems.length} top items for date ${req.query.date || 'today'}`);

            res.status(200).json({
                status: true,
                message: 'Lấy top món bán chạy thành công',
                data: topItems
            });
        } catch (error) {
            console.error('💥 Lỗi getTopItems:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi khi lấy top món bán chạy',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = reportController;