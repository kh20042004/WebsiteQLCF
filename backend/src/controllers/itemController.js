let Item = require('../models/Item');
let slugify = require('slugify');

module.exports = {
    // Lấy tất cả món ăn
    GetAllItems: async function (search = '', category = '', status = '') {
        let queryObj = { isDeleted: { $ne: true } };
        if (search) {
            queryObj.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            queryObj.category = category;
        }
        if (status) {
            queryObj.status = status;
        }
        return await Item.find(queryObj).populate({
            path: 'category',
            match: { isDeleted: { $ne: true } }, // Chỉ lấy danh mục chưa bị xóa
            select: 'name'
        });
    },

    // Lấy chi tiết 1 món ăn theo ID
    GetItemById: async function (id) {
        return await Item.findOne({ _id: id, isDeleted: { $ne: true } }).populate({
            path: 'category',
            match: { isDeleted: { $ne: true } },
            select: 'name'
        });
    },

    // Tạo mới món ăn
    CreateItem: async function (data, file = null) {
        const nameTrimmed = data.name.trim();
        // Bước 1: Tìm không phân biệt hoa thường
        let existingItem = await Item.findOne({ 
            name: { $regex: new RegExp(`^${nameTrimmed}$`, 'i') } 
        });

        if (existingItem) {
            if (existingItem.isDeleted) {
                let updateData = { ...data, isDeleted: false };
                if (file) {
                    updateData.image = `/uploads/${file.filename}`;
                }
                updateData.slug = slugify(data.name, { lower: true, strict: true });

                Object.assign(existingItem, updateData);
                await existingItem.save();
                return { 
                    restored: true, 
                    data: existingItem, 
                    message: "Khôi phục thành công món ăn cũ" 
                };
            } else {
                throw new Error("Tên món ăn thức uống này đang tồn tại và đang sử dụng");
            }
        }

        let itemData = { ...data };
        if (file) {
            itemData.image = `/uploads/${file.filename}`;
        }
        itemData.slug = slugify(itemData.name, { lower: true, strict: true });
        
        let newItem = new Item(itemData);
        await newItem.save();
        return { restored: false, data: newItem };
    },

    // Cập nhật món ăn
    UpdateItem: async function (id, data, file = null) {
        let itemData = { ...data };
        if (file) {
            itemData.image = `/uploads/${file.filename}`;
        }
        if (itemData.name) {
            itemData.slug = slugify(itemData.name, { lower: true, strict: true });
        }
        
        return await Item.findOneAndUpdate(
            { _id: id, isDeleted: false },
            itemData,
            { new: true, runValidators: true }
        );
    },

    // Xóa món ăn (Soft delete)
    DeleteItem: async function (id) {
        return await Item.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
    }
};
