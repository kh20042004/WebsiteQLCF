let Category = require('../models/Category');
let Item = require('../models/Item');
let mongoose = require('mongoose');

module.exports = {
    // Lấy tất cả danh mục
    GetAllCategories: async function (search = '') {
        let queryObj = { isDeleted: false };
        if (search) {
            queryObj.name = { $regex: search, $options: 'i' };
        }
        return await Category.find(queryObj);
    },

    // Lấy chi tiết 1 danh mục theo ID
    GetCategoryById: async function (id) {
        return await Category.findOne({ _id: id, isDeleted: false });
    },

    // Tạo mới danh mục
    CreateCategory: async function (data) {
        // Bước 1: Tìm trong Database xem có bản ghi nào trùng name không
        let existingCategory = await Category.findOne({ name: data.name });

        if (existingCategory) {
            // Nếu tìm thấy bản ghi có isDeleted: true: Cập nhật thành false (Khôi phục)
            if (existingCategory.isDeleted) {
                existingCategory.isDeleted = false;
                if (data.description) existingCategory.description = data.description;
                await existingCategory.save();
                return { 
                    restored: true, 
                    data: existingCategory, 
                    message: "Khôi phục thành công danh mục cũ" 
                };
            } else {
                // Nếu tìm thấy bản ghi có isDeleted: false: Trả về lỗi
                throw new Error("Tên này đang tồn tại và đang sử dụng");
            }
        }

        // Nếu không tìm thấy: Tiến hành create() mới hoàn toàn
        let newCategory = new Category(data);
        await newCategory.save();
        return { restored: false, data: newCategory };
    },

    // Cập nhật danh mục
    UpdateCategory: async function (id, data) {
        return await Category.findOneAndUpdate(
            { _id: id, isDeleted: false },
            data,
            { new: true, runValidators: true }
        );
    },

    // Xóa danh mục
    DeleteCategory: async function (id) {
        // Bước 1: Tìm tất cả sản phẩm có category khớp với id này và thiết lập lại thành null
        // Đảm bảo id được chuyển sang ObjectId nếu cần thiết
        const categoryId = new mongoose.Types.ObjectId(id);
        await Item.updateMany({ category: categoryId }, { $unset: { category: 1 } });
        
        // Bước 2: Sau khi bước 1 thành công, tiến hành xóa mềm danh mục
        return await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
};
