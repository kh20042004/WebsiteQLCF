const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên bàn là bắt buộc'],
      trim: true,
      minlength: [2, 'Tên bàn phải có ít nhất 2 ký tự'],
      maxlength: [50, 'Tên bàn không vượt quá 50 ký tự'],
    },
    capacity: {
      type: Number,
      required: [true, 'Sức chứa là bắt buộc'],
      min: [1, 'Sức chứa phải ≥ 1'],
      max: [20, 'Sức chứa không vượt quá 20 người'],
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'occupied', 'reserved'],
        message: 'Trạng thái bàn phải là: available, occupied hoặc reserved',
      },
      default: 'available',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    notes: {
      type: String,
      maxlength: 200,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index để tìm kiếm nhanh
tableSchema.index({ status: 1 });
tableSchema.index({ name: 1 });

// TODO: Virtual - lấy thông tin order hiện tại (sau khi Order model sẵn sàng)
// tableSchema.virtual('order', {
//   ref: 'Order',
//   localField: 'currentOrderId',
//   foreignField: '_id',
//   justOne: true,
// });

// TODO: Kích hoạt virtual khi convert to JSON (sau khi Order model sẵn sàng)
// tableSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Table', tableSchema);
