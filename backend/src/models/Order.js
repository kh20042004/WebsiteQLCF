/**
 * Model: Order (Đơn hàng)
 *
 * Schema đơn hàng của quán cà phê:
 * - table: bàn được gọi món
 * - items: danh sách các món trong đơn (mảng)
 * - totalPrice: tổng tiền (tự động tính)
 * - status: trạng thái đơn hàng
 * - note: ghi chú thêm
 */

const mongoose = require('mongoose');

// Schema cho từng món trong đơn hàng
const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // tham chiếu tới model Item (Ngân làm)
      required: [true, 'Món hàng là bắt buộc'],
    },
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [1, 'Số lượng phải ít nhất là 1'],
    },
    price: {
      type: Number,
      required: [true, 'Giá món là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    // Tên snapshot tại thời điểm đặt (phòng khi sau này giá đổi)
    name: {
      type: String,
      required: [true, 'Tên món là bắt buộc'],
    },
  },
  { _id: true } // cho phép mỗi item trong đơn có _id riêng để xóa dễ hơn
);

// Schema chính của Order
const orderSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table', // tham chiếu tới model Table (Kiệt làm)
      required: [true, 'Bàn là bắt buộc'],
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Tổng tiền không được âm'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'serving', 'done', 'cancelled'],
        message: 'Trạng thái không hợp lệ',
      },
      default: 'pending',
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Ghi chú không được quá 500 ký tự'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // tham chiếu tới model User (Khánh làm)
    },
  },
  {
    timestamps: true, // tự thêm createdAt, updatedAt
  }
);

// ---- MIDDLEWARE: Tự động tính lại totalPrice trước khi save ----
orderSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  next();
});

// ---- VIRTUAL: Số lượng món trong đơn ----
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
