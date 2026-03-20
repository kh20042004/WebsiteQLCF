const Category = require('../models/Category');
const Item = require('../models/Item');

/**
 * Lấy danh sách danh mục
 */
const getAllCategories = async (req, res, next) => {
  try {
    const { search } = req.query;
    let queryObj = {};

    // Tìm kiếm theo tên (regex không phân biệt hoa thường)
    if (search) {
      queryObj.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(queryObj);

    res.status(200).json({
      status: true,
      results: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết chi tiết 1 danh mục
 */
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy danh mục',
      });
    }

    res.status(200).json({
      status: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo mới danh mục
 */
const createCategory = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);

    res.status(201).json({
      status: true,
      message: 'Tạo danh mục thành công',
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật danh mục
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy danh mục để cập nhật',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Cập nhật danh mục thành công',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa danh mục
 */
const deleteCategory = async (req, res, next) => {
  try {
    // 1. Kiểm tra xem có sản phẩm nào đang thuộc danh mục này không
    const itemCount = await Item.countDocuments({ category: req.params.id });
    
    if (itemCount > 0) {
      return res.status(400).json({
        status: false,
        message: `Không thể xóa danh mục này vì vẫn còn ${itemCount} sản phẩm bên trong. Hãy xóa hoặc chuyển các sản phẩm đó sang danh mục khác trước.`
      });
    }

    // 2. Thực hiện xóa danh mục
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy danh mục để xóa',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Xóa danh mục thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
