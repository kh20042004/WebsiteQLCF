/**
 * Controller: itemController.js
 * 
 * Xử lý các logic nghiệp vụ liên quan đến món ăn:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Upload ảnh lên Cloudinary
 * - Tạo slug SEO-friendly
 * - Soft delete (đánh dấu xóa thay vì xóa thật)
 * 
 * Dependencies:
 * - Item model: Schema MongoDB cho món ăn
 * - slugify: Tạo URL slug từ tên món
 * - cloudinary: Upload ảnh lên cloud storage
 * - streamifier: Chuyển đổi buffer thành stream cho Cloudinary
 */

const Item = require('../models/Item');
const slugify = require('slugify');

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

    // Cập nhật món ăn theo ID
    UpdateItem: async function (id, data, file = null) {
        let itemData = { ...data };
        
        /**
         * XỬ LÝ UPLOAD ẢNH MỚI (nếu có)
         * - Nếu client gửi file ảnh mới → upload lên Cloudinary
         * - Nếu không có file → giữ nguyên ảnh cũ (không thay đổi trường image)
         */
        if (file) {
            console.log('📤 Có ảnh mới, đang upload lên Cloudinary...');
            try {
                // Upload ảnh lên Cloudinary bằng buffer (memory storage)
                const cloudinary = require('../config/cloudinary');
                const streamifier = require('streamifier');
                
                // Tạo promise để upload file buffer lên Cloudinary
                const uploadFromBuffer = () => {
                    return new Promise((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'coffee-shop/items',  // Thư mục lưu trên Cloudinary
                                transformation: [
                                    { width: 800, height: 600, crop: 'fit' },  // Resize ảnh
                                    { quality: 'auto' }  // Tự động optimize chất lượng
                                ]
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        
                        // Chuyển buffer thành stream và pipe vào Cloudinary
                        streamifier.createReadStream(file.buffer).pipe(uploadStream);
                    });
                };
                
                const cloudinaryResult = await uploadFromBuffer();
                itemData.image = cloudinaryResult.secure_url;  // Lưu URL ảnh từ Cloudinary
                console.log('✅ Upload ảnh thành công:', cloudinaryResult.secure_url);
                
            } catch (uploadError) {
                console.error('❌ Lỗi upload ảnh:', uploadError.message);
                throw new Error('Upload ảnh thất bại: ' + uploadError.message);
            }
        } else {
            console.log('📷 Không có ảnh mới, giữ nguyên ảnh cũ');
        }
        
        /**
         * TẠO SLUG TỰ ĐỘNG TỪ TÊN MÓN
         * - Chuyển tên món thành slug URL-friendly (vd: "Cà phê đen" → "ca-phe-den")
         * - Dùng cho SEO và URL clean
         */
        if (itemData.name) {
            const slugify = require('slugify');
            itemData.slug = slugify(itemData.name, { 
                lower: true,           // Chuyển thành chữ thường
                strict: true,          // Xóa ký tự đặc biệt
                locale: 'vi'           // Hỗ trợ tiếng Việt
            });
            console.log(`🔗 Slug được tạo: "${itemData.name}" → "${itemData.slug}"`);
        }
        
        /**
         * CẬP NHẬT VÀO DATABASE
         * - Chỉ update các món chưa bị xóa (isDeleted: false)
         * - runValidators: true → Chạy validation schema trước khi lưu
         * - new: true → Trả về dữ liệu sau khi update (thay vì trước update)
         */
        console.log(`🔄 Đang cập nhật món ăn ID: ${id}`);
        const updatedItem = await Item.findOneAndUpdate(
            { _id: id, isDeleted: false },  // Điều kiện: tìm theo ID và chưa xóa
            itemData,                       // Dữ liệu cập nhật
            { 
                new: true,                  // Trả về bản ghi sau khi update
                runValidators: true         // Chạy validation Mongoose
            }
        );
        
        if (!updatedItem) {
            console.log('❌ Không tìm thấy món ăn hoặc món đã bị xóa');
            throw new Error('Món ăn không tồn tại hoặc đã bị xóa');
        }
        
        console.log('✅ Cập nhật món ăn thành công');
        return updatedItem;
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
