const Order = require('../models/Order');

const getDateRange = (dateStr) => {
    let startOfDay, endOfDay, reportDate;
    if (dateStr) {
        const [year, month, day] = dateStr.split('-');
        startOfDay = new Date(year, month - 1, day, 0, 0, 0);
        endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
        reportDate = dateStr;
    } else {
        const now = new Date();
        startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        reportDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    return { startOfDay, endOfDay, reportDate };
};

const reportController = {
    getDailyReport: async (req, res) => {
        try {
            const { startOfDay, endOfDay, reportDate } = getDateRange(req.query.date);

            const orders = await Order.find({
                status: 'Completed',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            });

            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

            res.status(200).json({
                success: true,
                data: {
                    date: reportDate,
                    totalRevenue,
                    totalOrders: orders.length
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    },

    getTopItems: async (req, res) => {
        try {
            const { startOfDay, endOfDay } = getDateRange(req.query.date);

            const topItems = await Order.aggregate([
                { $match: { status: 'Completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                { $unwind: '$items' },
                { $group: { _id: '$items.item', totalQuantity: { $sum: '$items.quantity' } } },
                { $sort: { totalQuantity: -1 } },
                { $limit: 5 },
                { $lookup: { from: 'items', localField: '_id', foreignField: '_id', as: 'itemInfo' } },
                { $unwind: '$itemInfo' },
                {
                    $project: {
                        _id: 0,
                        itemId: '$_id',
                        name: '$itemInfo.name',
                        image: '$itemInfo.image',
                        totalSold: '$totalQuantity'
                    }
                }
            ]);

            res.status(200).json({
                success: true,
                data: topItems
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = reportController;