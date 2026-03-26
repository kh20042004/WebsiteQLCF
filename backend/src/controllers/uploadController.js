/**
 * Controller: uploadController.js
 *
 * Nhiệm vụ: Xử lý các request liên quan đến upload và quản lý ảnh
 * Gồm các chức năng:
 *
 * 1. uploadSingleImage   — POST /api/upload/single
 *    → Upload 1 ảnh lên Cloudinary + lưu thông tin vào MongoDB
 *
 * 2. uploadMultipleImages — POST /api/upload/multiple
 *    → Upload nhiều ảnh cùng lúc (tối đa 10 ảnh)
 *
 * 3. getAllImages         — GET /api/upload
 *    → Lấy danh sách tất cả ảnh đã upload (có phân trang)
 *
 * 4. getImageById        — GET /api/upload/:id
 *    → Lấy chi tiết 1 ảnh theo MongoDB ID
 *
 * 5. deleteImage         — DELETE /api/upload/:id
 *    → Xóa ảnh khỏi cả Cloudinary lẫn MongoDB
 *
 * Luồng hoạt động:
 * Client gửi file → Multer nhận (memoryStorage) → Stream lên Cloudinary
 * → Cloudinary trả về URL + publicId → Lưu vào MongoDB → Trả response về Client
 */

const cloudinary = require('../config/cloudinary');
const Image = require('../models/Image');

// ---- HÀM HELPER: Upload buffer lên Cloudinary ----
// Cloudinary SDK không hỗ trợ trực tiếp Buffer, cần dùng upload_stream
const uploadToCloudinary = (buffer, folder = 'coffee-shop') => {
  return new Promise((resolve, reject) => {
    // Tạo upload stream lên Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,               // Thư mục lưu trên Cloudinary
        resource_type: 'image',       // Loại resource: image / video / raw
        use_filename: false,          // Không dùng tên file gốc (tránh trùng)
        unique_filename: true,        // Cloudinary tự tạo tên unique
        overwrite: false,             // Không ghi đè file cũ
        quality: 'auto',              // Tự động tối ưu chất lượng ảnh
        fetch_format: 'auto',         // Tự động chọn định dạng tốt nhất (WebP nếu có thể)
      },
      (error, result) => {
        // Nếu upload thất bại → reject Promise
        if (error) return reject(error);
        // Nếu thành công → resolve với thông tin ảnh
        resolve(result);
      }
    );

    // Đẩy buffer của file vào stream để upload
    uploadStream.end(buffer);
  });
};


// ============================================================
// 1. POST /api/upload/single
//    Upload 1 ảnh lên Cloudinary
//    Middleware trước: uploadSingle (Multer nhận field "image")
//    Body: multipart/form-data với field "image"
// ============================================================
const uploadSingleImage = async (req, res, next) => {
  try {
    // Kiểm tra có file được gửi lên không
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'Vui lòng chọn file ảnh để upload (field name: "image")',
      });
    }

    // Upload buffer lên Cloudinary
    const cloudResult = await uploadToCloudinary(
      req.file.buffer,
      'coffee-shop/products' // Lưu vào thư mục products trên Cloudinary
    );

    // Lưu thông tin ảnh vào MongoDB
    const image = new Image({
      url: cloudResult.secure_url,         // URL https của ảnh
      publicId: cloudResult.public_id,     // ID duy nhất trên Cloudinary
      originalName: req.file.originalname, // Tên file gốc
      size: req.file.size,                 // Dung lượng file (bytes)
      width: cloudResult.width,            // Chiều rộng ảnh
      height: cloudResult.height,          // Chiều cao ảnh
      format: cloudResult.format,          // Định dạng (jpg, png...)
      folder: cloudResult.folder || 'coffee-shop/products',
      uploadedBy: req.user?._id || null,   // ID người upload (từ JWT middleware)
    });

    await image.save(); // Lưu vào MongoDB

    // Trả về response thành công
    return res.status(201).json({
      status: true,
      message: 'Upload ảnh thành công',
      data: {
        _id: image._id,
        url: image.url,
        publicId: image.publicId,
        originalName: image.originalName,
        size: image.size,
        width: image.width,
        height: image.height,
        format: image.format,
        createdAt: image.createdAt,
      },
    });
  } catch (error) {
    // Xử lý lỗi từ Cloudinary hoặc MongoDB
    console.error('❌ Lỗi upload ảnh:', error.message);
    next(error);
  }
};


// ============================================================
// 2. POST /api/upload/multiple
//    Upload nhiều ảnh cùng lúc (tối đa 10 ảnh)
//    Middleware trước: uploadMultiple (Multer nhận field "images")
//    Body: multipart/form-data với field "images" (nhiều file)
// ============================================================
const uploadMultipleImages = async (req, res, next) => {
  try {
    // Kiểm tra có file không
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Vui lòng chọn ít nhất 1 file ảnh (field name: "images")',
      });
    }

    // Upload song song tất cả ảnh lên Cloudinary (Promise.all chạy đồng thời)
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'coffee-shop/gallery').then(
        (cloudResult) => ({
          file,
          cloudResult,
        })
      )
    );

    // Chờ tất cả upload hoàn thành
    const results = await Promise.all(uploadPromises);

    // Tạo danh sách Image documents để lưu vào MongoDB
    const imageDocuments = results.map(({ file, cloudResult }) => ({
      url: cloudResult.secure_url,
      publicId: cloudResult.public_id,
      originalName: file.originalname,
      size: file.size,
      width: cloudResult.width,
      height: cloudResult.height,
      format: cloudResult.format,
      folder: cloudResult.folder || 'coffee-shop/gallery',
      uploadedBy: req.user?._id || null,
    }));

    // Lưu tất cả vào MongoDB cùng lúc (insertMany hiệu quả hơn save() từng cái)
    const savedImages = await Image.insertMany(imageDocuments);

    // Trả về response
    return res.status(201).json({
      status: true,
      message: `Upload thành công ${savedImages.length} ảnh`,
      data: savedImages.map((img) => ({
        _id: img._id,
        url: img.url,
        publicId: img.publicId,
        originalName: img.originalName,
        size: img.size,
        width: img.width,
        height: img.height,
        format: img.format,
        createdAt: img.createdAt,
      })),
      total: savedImages.length,
    });
  } catch (error) {
    console.error('❌ Lỗi upload nhiều ảnh:', error.message);
    next(error);
  }
};


// ============================================================
// 3. GET /api/upload
//    Lấy danh sách toàn bộ ảnh đã upload (có phân trang)
//    Query: ?page=1&limit=20&folder=coffee-shop/products
// ============================================================
const getAllImages = async (req, res, next) => {
  try {
    // Lấy tham số phân trang từ query string
    const page = Math.max(1, parseInt(req.query.page) || 1);   // Trang hiện tại (mặc định: 1)
    const limit = Math.min(50, parseInt(req.query.limit) || 20); // Số ảnh mỗi trang (max: 50)
    const skip = (page - 1) * limit;

    // Bộ lọc theo thư mục (nếu có)
    const filter = {};
    if (req.query.folder) {
      filter.folder = req.query.folder;
    }

    // Đếm tổng số ảnh để tính số trang
    const total = await Image.countDocuments(filter);

    // Lấy ảnh theo trang (populate người upload)
    const images = await Image.find(filter)
      .populate('uploadedBy', 'name email') // Hiển thị tên + email người upload
      .sort({ createdAt: -1 })             // Ảnh mới nhất lên đầu
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      message: 'Lấy danh sách ảnh thành công',
      data: images,
      pagination: {
        total,                               // Tổng số ảnh
        page,                                // Trang hiện tại
        limit,                               // Số ảnh mỗi trang
        totalPages: Math.ceil(total / limit), // Tổng số trang
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// 4. GET /api/upload/:id
//    Lấy chi tiết 1 ảnh theo MongoDB _id
// ============================================================
const getImageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm ảnh theo ID, populate người upload
    const image = await Image.findById(id).populate('uploadedBy', 'name email');

    // Nếu không tìm thấy → lỗi 404
    if (!image) {
      const error = new Error('Không tìm thấy ảnh');
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      status: true,
      message: 'Lấy thông tin ảnh thành công',
      data: image,
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// 5. DELETE /api/upload/:id
//    Xóa ảnh theo MongoDB _id
//    → Xóa trên Cloudinary (theo publicId) + xóa bản ghi trong MongoDB
// ============================================================
const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm ảnh trong MongoDB
    const image = await Image.findById(id);

    if (!image) {
      const error = new Error('Không tìm thấy ảnh để xóa');
      error.statusCode = 404;
      throw error;
    }

    // Bước 1: Xóa ảnh trên Cloudinary (dùng publicId)
    const cloudResult = await cloudinary.uploader.destroy(image.publicId, {
      resource_type: 'image',
    });

    // Kiểm tra kết quả xóa trên Cloudinary
    if (cloudResult.result !== 'ok' && cloudResult.result !== 'not found') {
      const error = new Error('Xóa ảnh trên Cloudinary thất bại');
      error.statusCode = 500;
      throw error;
    }

    // Bước 2: Xóa bản ghi trong MongoDB
    await Image.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: 'Xóa ảnh thành công',
      data: {
        _id: image._id,
        url: image.url,
        publicId: image.publicId,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi xóa ảnh:', error.message);
    next(error);
  }
};


// ---- EXPORT TẤT CẢ CONTROLLER ----
module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  getAllImages,
  getImageById,
  deleteImage,
};
