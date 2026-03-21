const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên món là bắt buộc'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Giá món là bắt buộc'],
    min: [0, 'Giá món không được âm'],
  },
  image: {
    type: String,
    default: 'default-product.jpg',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc'],
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'Out of Stock'],
      message: 'Trạng thái chỉ có thể là Available hoặc Out of Stock',
    },
    default: 'Available',
  },
}, {
  timestamps: true,
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
