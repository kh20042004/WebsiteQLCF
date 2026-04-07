/**
 * Service: reviewService.js
 * 
 * Lớp business logic cho Review
 * - Tìm kiếm review
 * - Validate dữ liệu
 * - Tính toán thống kê đánh giá
 * - Xử lý logic phức tạp
 * 
 * Giữ controller "lean" bằng cách move logic vào service
 */

const Review = require('../models/Review');
const Item = require('../models/Item');

module.exports = {
  /**
   * TÌM KIẾM VÀ LỌC REVIEW
   * 
   * @param {Object} filters - Các điều kiện lọc
   *   - itemId: Lọc theo item
   *   - status: Lọc theo trạng thái (approved, pending, rejected)
   *   - page: Số trang (default: 1)
   *   - limit: Giới hạn mỗi trang (default: 10)
   *   - sort: Sắp xếp (-createdAt, rating, etc)
   * 
   * @returns {Promise<Object>} - Danh sách review + pagination info
   */
  searchReviews: async (filters) => {
    const { itemId, status = 'approved', page = 1, limit = 10, sort = '-createdAt' } = filters;

    // 🔍 Xây dựng điều kiện lọc
    const query = {};
    if (itemId) query.itemId = itemId;
    if (status) query.status = status;

    // 📊 Tính toán skip cho pagination
    const skip = (page - 1) * limit;

    // 📋 Lấy tổng số review
    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    // 🔗 Lấy review với populate
    const reviews = await Review.find(query)
      .populate('userId', 'name email') // Tên và email người viết
      .populate('itemId', 'name image') // Tên và ảnh item
      .populate('replyBy', 'name') // Tên người trả lời
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * VALIDATE DỮ LIỆU INPUT CỦA REVIEW
   * 
   * @param {Object} input - Dữ liệu cần validate
   *   - itemId: ID item
   *   - rating: Điểm đánh giá (1-5)
   *   - comment: Nội dung bình luận
   * 
   * @returns {Object} - { valid: boolean, message: string }
   */
  validateReviewInput: (input) => {
    const { itemId, rating, comment } = input;

    // ✅ Kiểm tra itemId
    if (!itemId) {
      return {
        valid: false,
        message: 'ID sản phẩm là bắt buộc',
      };
    }

    // ✅ Kiểm tra rating
    if (rating === undefined || rating === null) {
      return {
        valid: false,
        message: 'Điểm đánh giá là bắt buộc',
      };
    }

    if (![1, 2, 3, 4, 5].includes(parseInt(rating))) {
      return {
        valid: false,
        message: 'Điểm đánh giá phải từ 1 đến 5 sao',
      };
    }

    // ✅ Kiểm tra comment
    if (!comment || comment.trim().length === 0) {
      return {
        valid: false,
        message: 'Vui lòng nhập nhận xét',
      };
    }

    if (comment.length < 10) {
      return {
        valid: false,
        message: 'Nhận xét phải ít nhất 10 ký tự',
      };
    }

    if (comment.length > 1000) {
      return {
        valid: false,
        message: 'Nhận xét không được vượt quá 1000 ký tự',
      };
    }

    return {
      valid: true,
      message: 'Dữ liệu hợp lệ',
    };
  },

  /**
   * LẤY THỐNG KÊ ĐÁNH GIÁ CỦA ITEM
   * 
   * @param {ObjectId} itemId - ID của item
   * @returns {Promise<Object>} - Thống kê đánh giá
   */
  getItemRatingStats: async (itemId) => {
    try {
      // 📊 Lấy điểm trung bình
      const avgData = await Review.getAverageRating(itemId);

      // 📈 Lấy số lượng review theo từng sao
      const ratingDistribution = await Review.aggregate([
        {
          $match: {
            itemId: require('mongoose').Types.ObjectId(itemId),
            status: 'approved',
          },
        },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // 🎯 Format dữ liệu
      const stats = {
        average: avgData.average,
        total: avgData.total,
        distribution: {
          '5': 0,
          '4': 0,
          '3': 0,
          '2': 0,
          '1': 0,
        },
      };

      ratingDistribution.forEach((item) => {
        stats.distribution[item._id.toString()] = item.count;
      });

      return stats;
    } catch (error) {
      console.error('💥 Lỗi tính thống kê đánh giá:', error);
      throw error;
    }
  },

  /**
   * LẤY REVIEW THEO USER
   * 
   * @param {ObjectId} userId - ID của user
   * @returns {Promise<Array>} - Danh sách review của user
   */
  getUserReviews: async (userId) => {
    try {
      const reviews = await Review.getReviewsByUser(userId);
      return reviews;
    } catch (error) {
      console.error('💥 Lỗi lấy review của user:', error);
      throw error;
    }
  },

  /**
   * KIỂM TRA USER ĐÃ REVIEW ITEM CHƯA
   * 
   * @param {ObjectId} userId - ID user
   * @param {ObjectId} itemId - ID item
   * @returns {Promise<Boolean>} - true nếu đã review, false nếu chưa
   */
  hasUserReviewedItem: async (userId, itemId) => {
    try {
      const review = await Review.findOne({ userId, itemId });
      return review !== null;
    } catch (error) {
      console.error('💥 Lỗi kiểm tra review:', error);
      throw error;
    }
  },

  /**
   * LẤY REVIEW CỦA USER CHO ITEM CỤ THỂ
   * 
   * @param {ObjectId} userId - ID user
   * @param {ObjectId} itemId - ID item
   * @returns {Promise<Object>} - Review của user cho item
   */
  getUserItemReview: async (userId, itemId) => {
    try {
      const review = await Review.findOne({ userId, itemId })
        .populate('userId', 'name email')
        .populate('itemId', 'name image')
        .populate('replyBy', 'name');

      return review;
    } catch (error) {
      console.error('💥 Lỗi lấy review của user cho item:', error);
      throw error;
    }
  },

  /**
   * LẤY REVIEW ĐƯỢC PHÊDUYỆT CỦA ITEM (CÔNG KHAI)
   * 
   * @param {ObjectId} itemId - ID item
   * @param {Number} limit - Giới hạn số lượng (default: 5)
   * @returns {Promise<Array>} - Danh sách review
   */
  getPublicReviews: async (itemId, limit = 5) => {
    try {
      const reviews = await Review.find({ itemId, status: 'approved' })
        .populate('userId', 'name')
        .populate('replyBy', 'name')
        .sort({ createdAt: -1 })
        .limit(limit);

      return reviews;
    } catch (error) {
      console.error('💥 Lỗi lấy public review:', error);
      throw error;
    }
  },

  /**
   * ĐỀ XUẤT REVIEW CHO SIDEBAR
   * 
   * @returns {Promise<Array>} - Danh sách review nổi bật
   */
  getFeaturedReviews: async () => {
    try {
      // Lấy review mới nhất được phê duyệt
      const reviews = await Review.find({ status: 'approved' })
        .populate('userId', 'name')
        .populate('itemId', 'name image')
        .sort({ createdAt: -1 })
        .limit(5);

      return reviews;
    } catch (error) {
      console.error('💥 Lỗi lấy featured review:', error);
      throw error;
    }
  },

  /**
   * THỐNG KÊ REVIEW CHO ADMIN DASHBOARD
   * 
   * @returns {Promise<Object>} - Tập hợp các thống kê
   */
  getAdminStats: async () => {
    try {
      const totalReviews = await Review.countDocuments();
      const pendingReviews = await Review.countDocuments({ status: 'pending' });
      const approvedReviews = await Review.countDocuments({ status: 'approved' });
      const rejectedReviews = await Review.countDocuments({ status: 'rejected' });

      // 📈 Tính điểm đánh giá trung bình chung
      const avgRatingData = await Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, average: { $avg: '$rating' } } },
      ]);

      const averageRating = avgRatingData.length > 0 ? avgRatingData[0].average : 0;

      return {
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        approvalRate: totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0,
      };
    } catch (error) {
      console.error('💥 Lỗi lấy admin stats:', error);
      throw error;
    }
  },
};
