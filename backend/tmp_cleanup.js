const mongoose = require('mongoose');
require('dotenv').config();

const cleanDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/coffee-shop'); // Thay bằng URI của bạn nếu khác
    console.log('Connected to MongoDB');

    // Xóa tất cả order để dọn dẹp các đơn bị lỗi validation trước đó
    const Order = mongoose.model('Order', new mongoose.Schema({}));
    const Table = mongoose.model('Table', new mongoose.Schema({}));

    await Order.deleteMany({});
    console.log('Cleared all orders');

    // Reset tất cả bàn về trạng thái available
    await Table.updateMany({}, { status: 'available', currentOrderId: null });
    console.log('Reset all tables to available');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDB();
