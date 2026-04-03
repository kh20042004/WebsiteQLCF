let mongoose = require('mongoose');

let itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên món là bắt buộc'],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true
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
        required: false, // Thay đổi từ true thành false để hỗ trợ trạng thái null khi xóa danh mục
    },
    status: {
        type: String,
        enum: {
            values: ['Available', 'Out of Stock'],
            message: 'Trạng thái chỉ có thể là Available hoặc Out of Stock',
        },
        default: 'Available',
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Item', itemSchema);
