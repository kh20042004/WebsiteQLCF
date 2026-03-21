const Order = require('../models/Order');
const Table = require('../models/Table'); // Phải import Table để lát nữa cập nhật

const orderController = {
    // Hàm tạo đơn hàng (Hôm trước làm để test)
    createOrder: async (req, res) => {
        try {
            const newOrder = new Order(req.body);
            await newOrder.save();
            res.status(201).json({ success: true, data: newOrder });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
    // Lấy danh sách tất cả đơn hàng (Mới nhất lên đầu)
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('table', 'name') // Lấy thêm tên bàn để UI hiển thị cho đẹp
                .sort({ createdAt: -1 });  // Sắp xếp đơn mới nhất lên đầu
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Hàm THANH TOÁN (Nhiệm vụ của Anh)
    // POST /api/orders/:id/checkout
    checkoutOrder: async (req, res) => {
        try {
            const orderId = req.params.id;
            const { paymentMethod } = req.body; // Ví dụ: 'Cash', 'Transfer', 'Card'

            // 1. Tìm đơn hàng
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng này' });
            }

            // 2. Kiểm tra xem đơn đã thanh toán chưa
            if (order.status === 'Completed') {
                return res.status(400).json({ success: false, message: 'Đơn hàng này đã được thanh toán rồi!' });
            }

            // 3. Cập nhật Đơn hàng thành Đã thanh toán
            order.status = 'Completed';
            order.paymentMethod = paymentMethod || 'Cash'; // Mặc định là tiền mặt nếu không truyền
            await order.save();

            // 4. Giải phóng Bàn (Nếu đơn hàng này có khách ngồi tại bàn)
            if (order.table) {
                await Table.findByIdAndUpdate(
                    order.table,
                    {
                        status: 'available',    // Chuyển về bàn trống theo chuẩn file Table.js
                        currentOrderId: null    // Xóa liên kết đơn hàng
                    }
                );
            }

            res.status(200).json({
                success: true,
                message: 'Thanh toán thành công! Đã giải phóng bàn.',
                data: order
            });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi khi thanh toán', error: error.message });
        }
    }
};

module.exports = orderController;