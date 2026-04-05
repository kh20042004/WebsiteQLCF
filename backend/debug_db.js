/**
 * Script debug MongoDB để kiểm tra dữ liệu orders
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function debugDatabase() {
  try {
    // Kết nối MongoDB
    console.log('🔗 Đang kết nối MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối thành công MongoDB\n');

    // 1. Đếm tổng số orders
    console.log('📊 1. TỔNG QUAN DATABASE');
    console.log('=' .repeat(50));
    const totalOrders = await Order.countDocuments();
    console.log(`📦 Tổng số orders: ${totalOrders}`);
    
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('📈 Phân bổ theo status:');
    ordersByStatus.forEach(status => {
      console.log(`   - ${status._id}: ${status.count} orders`);
    });
    console.log();

    // 2. Liệt kê 5 orders gần nhất với status 'done'
    console.log('🎯 2. TOP 5 ORDERS GẦN NHẤT VỚI STATUS "DONE"');
    console.log('=' .repeat(50));
    const recentDoneOrders = await Order.find({ status: 'done' })
      .populate('table', 'name tableNumber')
      .populate('items.item', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    if (recentDoneOrders.length === 0) {
      console.log('❌ Không có order nào với status "done"');
    } else {
      recentDoneOrders.forEach((order, index) => {
        console.log(`\n📝 Order ${index + 1}:`);
        console.log(`   ID: ${order._id}`);
        console.log(`   Bàn: ${order.table?.name || 'N/A'} (${order.table?.tableNumber || 'N/A'})`);
        console.log(`   Ngày tạo: ${order.createdAt}`);
        console.log(`   Ngày cập nhật: ${order.updatedAt}`);
        console.log(`   Tổng tiền: ${order.totalPrice.toLocaleString('vi-VN')} VND`);
        console.log(`   Số món: ${order.items.length}`);
        console.log(`   Items:`);
        order.items.forEach(item => {
          console.log(`      - ${item.name}: ${item.quantity} x ${item.price.toLocaleString('vi-VN')} VND`);
        });
      });
    }
    console.log();

    // 3. Check format ngày tháng
    console.log('📅 3. FORMAT NGÀY THÁNG VÀ PHÂN TÍCH ITEMS');
    console.log('=' .repeat(50));
    const sampleOrders = await Order.find()
      .populate('items.item', 'name')
      .limit(3);
    
    if (sampleOrders.length > 0) {
      sampleOrders.forEach((order, index) => {
        console.log(`\n🔍 Sample Order ${index + 1}:`);
        console.log(`   createdAt: ${order.createdAt} (Type: ${typeof order.createdAt})`);
        console.log(`   updatedAt: ${order.updatedAt} (Type: ${typeof order.updatedAt})`);
        console.log(`   ISO Date: ${order.createdAt.toISOString()}`);
        console.log(`   Local Date: ${order.createdAt.toLocaleDateString('vi-VN')}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Items count: ${order.items.length}`);
      });
    }
    console.log();

    // 4. Tìm orders trong ngày 2026-04-04 và 2026-04-05
    console.log('🔍 4. ORDERS TRONG NGÀY 2026-04-04 VÀ 2026-04-05');
    console.log('=' .repeat(50));
    
    // Tạo các khoảng thời gian
    const startDate1 = new Date('2026-04-04T00:00:00.000Z');
    const endDate1 = new Date('2026-04-04T23:59:59.999Z');
    const startDate2 = new Date('2026-04-05T00:00:00.000Z');
    const endDate2 = new Date('2026-04-05T23:59:59.999Z');

    console.log(`Tìm kiếm từ: ${startDate1} đến ${endDate2}`);

    const ordersInDateRange = await Order.find({
      $or: [
        { createdAt: { $gte: startDate1, $lte: endDate1 } },
        { createdAt: { $gte: startDate2, $lte: endDate2 } }
      ]
    }).populate('table', 'name tableNumber')
      .populate('items.item', 'name')
      .sort({ createdAt: -1 });

    console.log(`📊 Tìm thấy ${ordersInDateRange.length} orders trong khoảng ngày này`);

    if (ordersInDateRange.length > 0) {
      ordersInDateRange.forEach((order, index) => {
        console.log(`\n📄 Order ${index + 1}:`);
        console.log(`   ID: ${order._id}`);
        console.log(`   Ngày: ${order.createdAt.toISOString()}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Bàn: ${order.table?.name || 'N/A'}`);
        console.log(`   Tổng tiền: ${order.totalPrice.toLocaleString('vi-VN')} VND`);
        console.log(`   Items (${order.items.length}):`);
        order.items.forEach(item => {
          console.log(`      - ${item.name}: ${item.quantity} x ${item.price.toLocaleString('vi-VN')} = ${(item.quantity * item.price).toLocaleString('vi-VN')} VND`);
        });
      });
    } else {
      console.log('❌ Không tìm thấy orders nào trong khoảng ngày 2026-04-04 và 2026-04-05');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎯 TỔNG KẾT DEBUG:');
    console.log(`📦 Tổng orders: ${totalOrders}`);
    console.log(`✅ Orders hoàn thành: ${ordersByStatus.find(s => s._id === 'done')?.count || 0}`);
    console.log(`📅 Orders trong ngày target: ${ordersInDateRange.length}`);
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Lỗi khi debug database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

debugDatabase();