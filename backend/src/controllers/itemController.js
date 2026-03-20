const Item = require('../models/Item');
const Category = require('../models/Category');

/**
 * Lấy danh sách sản phẩm (Món)
 * - Hỗ trợ lọc theo tên (search)
 * - Hỗ trợ lọc theo danh mục (category)
 * - Sử dụng populate() để lấy tên danh mục
 */
const getAllItems = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let queryObj = {};

    // Tìm kiếm theo tên (không phân biệt hoa thường)
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }

    // Lọc theo danh mục
    if (category) {
      queryObj.category = category;
    }

    // Thực hiện truy vấn và populate() thông tin danh mục
    const items = await Item.find(queryObj).populate({
      path: 'category',
      select: 'name description',
    });

    res.status(200).json({
      status: true,
      results: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết chi tiết 1 sản phẩm
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('category');

    if (!item) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy sản phẩm với ID này',
      });
    }

    res.status(200).json({
      status: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới một món ăn/uống
 */
const createItem = async (req, res, next) => {
  try {
    // Kiểm tra xem category_id hợp lệ không
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({
        status: false,
        message: 'Danh mục không tồn tại. Vui lòng chọn danh mục hợp lệ.',
      });
    }

    // --- Xử lý logic upload ảnh ---
    const itemData = req.body;

    // Debug dữ liệu cho create (Xóa sau khi fix xong)
    console.log('Create Data received:', itemData);
    console.log('File for create:', req.file);
    
    // Nếu có file upload từ Multer (req.file)
    if (req.file) {
      // Lưu địa chỉ URL của ảnh thật trên server
      itemData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      // Nếu không có file mới, đảm bảo không lưu Object trống {} vào trường image của MongoDB
      if (typeof itemData.image === 'object' || itemData.image === '{}' || itemData.image === '[object Object]') {
        delete itemData.image;
      }
    }
    
    // Tạo sản phẩm mới
    const newItem = await Item.create(itemData);

    res.status(201).json({
      status: true,
      message: 'Tạo sản phẩm thành công',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin món
 */
const updateItem = async (req, res, next) => {
  try {
    // Nếu có cập nhật category, kiểm tra xem nó có tồn tại không
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({
          status: false,
          message: 'Danh mục không hợp lệ.',
        });
      }
    }

    // --- Xử lý logic cập nhật ảnh ---
    const updateData = req.body;

    // Debug dữ liệu nhận được (Xóa sau khi fix xong)
    console.log('Update Data received:', updateData);
    console.log('File received:', req.file);

    // Nếu có file mới được upload từ Multer
    if (req.file) {
      updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else {
      // Nếu KHÔNG có file mới, đảm bảo không lưu Object trống {} vào trường image
      if (typeof updateData.image === 'object' || updateData.image === '{}' || updateData.image === '[object Object]') {
        delete updateData.image;
      }
    }

    const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy sản phẩm để cập nhật',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Cập nhật sản phẩm thành công',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa một món
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy sản phẩm để xóa',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
