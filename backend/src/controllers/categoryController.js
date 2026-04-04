let Category = require('../models/Category');
let Item = require('../models/Item');
let mongoose = require('mongoose');

module.exports = {
    // Lấy tất cả danh mục
    GetAllCategories: async function (search = '') {
        let queryObj = { isDeleted: { $ne: true } }; // Lấy tất cả trừ những cái đã xóa (isDeleted: true)
        if (search) {
            queryObj.name = { $regex: search, $options: 'i' };
        }
        return await Category.find(queryObj);
    },

    // Lấy chi tiết 1 danh mục theo ID
    GetCategoryById: async function (id) {
        return await Category.findOne({ _id: id, isDeleted: { $ne: true } });
    },

    // Tạo mới danh mục
    CreateCategory: async function (data) {
        const nameTrimmed = data.name.trim();
        
        let existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${nameTrimmed}$`, 'i') } 
        });

        if (existingCategory) {
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
                throw new Error("Tên danh mục món ăn thức uống này đang tồn tại và đang sử dụng");
            }
        }

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
       
        const categoryId = new mongoose.Types.ObjectId(id);
        await Item.updateMany({ category: categoryId }, { $unset: { category: 1 } });
        
        const deletedCategory = await Category.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

 
    return {
        success: true,
        data: deletedCategory,
        message: "Đã xóa danh mục món ăn thức uống thành công"
    }
}
};
