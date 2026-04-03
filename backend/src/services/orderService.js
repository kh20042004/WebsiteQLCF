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

const Table = require('../models/Table');

// ---------------------------------------------------------------
// 1. Tạo đơn hàng mới
//    Input : { tableId, items, totalPrice, note, userId }
//    Output: order document vừa tạo
// ---------------------------------------------------------------
const createOrder = async ({ tableId, items, totalPrice, note, userId }) => {
  // 1. Kiểm tra xem bàn đã có đơn hàng hiện tại chưa
  const table = await Table.findById(tableId);
  const existingOrderId = table?.currentOrderId;

  let order;
  if (existingOrderId) {
    // Nếu đã có, Cập nhật đơn hàng cũ
    order = await Order.findByIdAndUpdate(existingOrderId, {
      items: items || [],
      totalPrice: totalPrice || 0,
      note: note || '',
      status: 'pending' // Reset về pending nếu cần
    }, { new: true });
  } else {
    // Nếu chưa có, tạo Order mới
    order = new Order({
      table: tableId,
      note: note || '',
      createdBy: userId || null,
      items: items || [],
      totalPrice: totalPrice || 0,
      status: 'pending',
    });
    await order.save();

    // Cập nhật thông tin bàn: trạng thái và order hiện tại
    await Table.findByIdAndUpdate(tableId, {
      status: 'occupied',
      currentOrderId: order._id
    });
  }

  // Trả về order đầy đủ
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

// ---------------------------------------------------------------
// 6. Cập nhật số lượng món trong đơn hàng
//    Input : orderId, orderItemId, quantity (mới)
//    Output: order đã cập nhật
// ---------------------------------------------------------------
const updateItemInOrder = async (orderId, orderItemId, quantity) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra đơn hàng còn có thể sửa không
  if (order.status === 'done' || order.status === 'cancelled') {
    const error = new Error(
      `Không thể sửa món trong đơn hàng có trạng thái "${order.status}"`
    );
    error.statusCode = 400;
    throw error;
  }

  // Tìm index món cần cập nhật theo _id subdocument (nhất quán với removeItemFromOrder)
  const itemIndex = order.items.findIndex(
    (i) => i._id.toString() === orderItemId.toString()
  );

  if (itemIndex === -1) {
    const error = new Error('Không tìm thấy món trong đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Ép kiểu quantity về số nguyên để tránh lỗi string từ request
  const newQuantity = Number(quantity);
  if (!newQuantity || newQuantity < 1) {
    const error = new Error('Số lượng phải là số nguyên ít nhất là 1');
    error.statusCode = 400;
    throw error;
  }

  // Cập nhật số lượng
  order.items[itemIndex].quantity = newQuantity;

  // Tính lại tổng tiền
  order.totalPrice = recalculateTotal(order.items);

  await order.save();

  return await Order.findById(orderId);
};

// ---------------------------------------------------------------
// 7. Cập nhật trạng thái đơn hàng
//    Input : orderId, status mới
//    Output: order đã cập nhật
// ---------------------------------------------------------------
const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error('Không tìm thấy đơn hàng');
    error.statusCode = 404;
    throw error;
  }

  // Kiểm tra luồng chuyển trạng thái hợp lệ
  const validTransitions = {
    pending: ['serving', 'cancelled'],
    serving: ['done', 'cancelled'],
    done: [],       // không thể chuyển nữa
    cancelled: [],  // không thể chuyển nữa
  };

  const allowed = validTransitions[order.status];
  if (!allowed.includes(newStatus)) {
    const error = new Error(
      `Không thể chuyển trạng thái từ "${order.status}" sang "${newStatus}"`
    );
    error.statusCode = 400;
    throw error;
  }

  order.status = newStatus;

  // Nếu đơn hoàn thành hoặc hủy -> giải phóng bàn
  if (newStatus === 'done' || newStatus === 'cancelled') {
    await Table.findByIdAndUpdate(order.table, {
      status: 'available',
      currentOrderId: null,
    });
  }

  await order.save();

  return await Order.findById(orderId);
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  addItemToOrder,
  removeItemFromOrder,
  updateItemInOrder,
  updateOrderStatus,
};
