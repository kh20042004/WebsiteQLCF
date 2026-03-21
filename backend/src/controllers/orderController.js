/**
 * Controller: orderController
 *
 * Nhiệm vụ: Nhận request → gọi service → trả response
 * Không chứa business logic, chỉ xử lý HTTP layer
 */

const orderService = require('../services/orderService');

// ---------------------------------------------------------------
// POST /orders
// Tạo đơn hàng mới
// Body: { tableId, note }
// ---------------------------------------------------------------
const createOrder = async (req, res, next) => {
  try {
    const { tableId, note } = req.body;
    const userId = req.user?._id; // lấy từ JWT middleware (Khánh làm)

    const order = await orderService.createOrder({ tableId, note, userId });

    return res.status(201).json({
      status: true,
      message: 'Tạo đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /orders
// Lấy danh sách tất cả đơn hàng
// Query: ?status=pending|serving|done|cancelled
// ---------------------------------------------------------------
const getAllOrders = async (req, res, next) => {
  try {
    const { status, tableId } = req.query;

    const orders = await orderService.getAllOrders({ status, tableId });

    return res.status(200).json({
      status: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders,
      total: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// GET /orders/:id
// Lấy chi tiết 1 đơn hàng (có populate bàn, món, người tạo)
// ---------------------------------------------------------------
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(id);

    return res.status(200).json({
      status: true,
      message: 'Lấy chi tiết đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// POST /orders/:id/items
// Thêm món vào đơn hàng
// Body: { itemId, quantity, price, name }
// ---------------------------------------------------------------
const addItemToOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemId, quantity, price, name } = req.body;

    const order = await orderService.addItemToOrder(id, {
      itemId,
      quantity,
      price,
      name,
    });

    return res.status(200).json({
      status: true,
      message: 'Thêm món vào đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------
// DELETE /orders/:id/items/:itemId
// Xóa món khỏi đơn hàng
// :itemId ở đây là _id của subdocument trong items[]
// ---------------------------------------------------------------
const removeItemFromOrder = async (req, res, next) => {
  try {
    const { id, itemId } = req.params;
    const { quantity } = req.body; // Lấy tuỳ chọn số lượng xóa từ Body

    const order = await orderService.removeItemFromOrder(id, itemId, quantity);

    return res.status(200).json({
      status: true,
      message: 'Xóa món khỏi đơn hàng thành công',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  addItemToOrder,
  removeItemFromOrder,
};
