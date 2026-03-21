/**
 * Model: Table (STUB - tạm thời để test Order API)
 * Model thực sự do Kiệt implement
 * Chỉ cần schema tối thiểu để populate không bị lỗi
 */

const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved'],
      default: 'available',
    },
    capacity: { type: Number, default: 4 },
  },
  { timestamps: true }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
