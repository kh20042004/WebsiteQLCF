/**
 * Service: orderService
 *
 * Nhiệm vụ: Xử lý toàn bộ business logic liên quan đến Order
 * - Tạo đơn hàng mới
 * - Lấy danh sách đơn hàng
 * - Lấy chi tiết đơn hàng (có populate)
 * - Thêm món vào đơn
 * - Xóa món khỏi đơn
 */

const Order = require('../models/Order');

// ---------------------------------------------------------------
// Hàm helper: tính lại totalPrice từ danh sách items
// ---------------------------------------------------------------
const recalculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

// ---------------------------------------------------------------
// 1. Tạo đơn hàng mới
//    Input : { tableId, note, userId }
//    Output: order document vừa tạo
// ---------------------------------------------------------------
const createOrder = async ({ tableId, note, userId }) => {
  const order = new Order({
    table: tableId,
    note: note || '',
    createdBy: userId || null,
    items: [],
    totalPrice: 0,
    status: 'pending',
  });

  await order.save();

  // Trả về order gốc
  return await Order.findById(order._id);
};

// ---------------------------------------------------------------
// 2. Lấy toàn bộ danh sách đơn hàng
//    Input : { status } - filter theo trạng thái (optional)
//    Output: mảng order
// ---------------------------------------------------------------
const getAllOrders = async ({ status, tableId } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  if (tableId) filter.table = tableId; // Tính năng mới: Tìm đơn hàng theo ID Bàn

  return await Order.find(filter)
    .sort({ createdAt: -1 }); // mới nhất lên đầu
};

// ---------------------------------------------------------------
// 3. Lấy chi tiết 1 đơn hàng theo ID (có populate đầy đủ)
//    Input : orderId
//    Output: order document
// ---------------------------------------------------------------
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

// ---------------------------------------------------------------
// 4. Thêm món vào đơn hàng
//    Input : orderId, { itemId, quantity, price, name }
//    Output: order đã cập nhật
// ---------------------------------------------------------------
const addItemToOrder = async (orderId, { itemId, quantity, price, name }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra đơn hàng còn có thể sửa không
  if (order.status === 'done' || order.status === 'cancelled') {
    const error = new Error(
      `Không thể thêm món vào đơn hàng có trạng thái "${order.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  // Kiểm tra món đã có trong đơn chưa → nếu có thì tăng số lượng
  const existingItem = order.items.find(
    (i) => i.item.toString() === itemId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Thêm món mới vào mảng items
    order.items.push({
      item: itemId,
      quantity,
      price,
      name,
    });
  }

  // Tính lại tổng tiền
  order.totalPrice = recalculateTotal(order.items);

  await order.save();

  // Trả về order gốc
  return await Order.findById(orderId);
};

// ---------------------------------------------------------------
// 5. Xóa món khỏi đơn hàng
//    Input : orderId, orderItemId (là _id của subdocument trong items[])
//    Output: order đã cập nhật
// ---------------------------------------------------------------
const removeItemFromOrder = async (orderId, orderItemId, quantityToRemove) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra đơn hàng còn có thể sửa không
  if (order.status === 'done' || order.status === 'cancelled') {
    const error = new Error(
      `Không thể xóa món khỏi đơn hàng có trạng thái "${order.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  // Tìm index của item cần xóa
  const itemIndex = order.items.findIndex(
    (i) => i._id.toString() === orderItemId.toString()
  );

  if (itemIndex === -1) {
    const error = new Error('Không tìm thấy món trong đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Nếu UI có truyền lên số lượng muốn xóa (VD: xoá bớt 1 ly trong 3 ly)
  if (quantityToRemove && Number(quantityToRemove) > 0) {
    const numToRemove = Number(quantityToRemove);
    if (order.items[itemIndex].quantity > numToRemove) {
      // Chỉ trừ số lượng, không xoá hẳn
      order.items[itemIndex].quantity -= numToRemove;
    } else {
      // Số lượng muốn xoá >= số lượng đang có -> Xoá sạch ly đó luôn
      order.items.splice(itemIndex, 1);
    }
  } else {
    // Nếu không truyền số lượng thì xoá hẳn cái món luôn
    order.items.splice(itemIndex, 1);
  }

  // Tính lại tổng tiền
  order.totalPrice = recalculateTotal(order.items);

  await order.save();

  // Trả về order gốc
  return await Order.findById(orderId);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  addItemToOrder,
  removeItemFromOrder,
};
