/**
 * Controller: reviewController.js
 * 
 * Quản lý các request liên quan đến Review
 * - Lấy danh sách review
 * - Tạo review mới
 * - Cập nhật review
 * - Đánh giá review (phê duyệt/từ chối)
 * - Trả lời review
 * - Xóa review
 * 
 * Mỗi function xử lý request và response một cách độc lập
 */

const Review = require('../models/Review');
const Item = require('../models/Item');
const reviewService = require('../services/reviewService');

// ============================================================
// LỆNH CÁC ENDPOINT
// ============================================================

module.exports = {
  /**
   * LẤY DANH SÁCH REVIEW
   * 
   * Phương thức: GET /api/reviews
   * Quyền: Ai cũng có thể xem
   * 
   * Query params:
   * - itemId: Lọc theo item cụ thể
   * - status: Lọc theo trạng thái (approved, pending, rejected)
   * - page: Trang hiện tại (mặc định: 1)
   * - limit: Số review mỗi trang (mặc định: 10)
   * - sort: Sắp xếp (-createdAt, rating, etc)
   * 
   * Response: Danh sách review + thông tin phân trang
   */
  getAllReviews: async (req, res) => {
    try {
      const { itemId, status = 'approved', page = 1, limit = 10, sort = '-createdAt' } = req.query;

      // 🔍 Tìm kiếm review
      const reviews = await reviewService.searchReviews({
        itemId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
      });

      res.status(200).json({
        status: true,
        message: 'Lấy danh sách review thành công',
        data: reviews,
      });
    } catch (error) {
      console.error('💥 Lỗi lấy danh sách review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi lấy danh sách review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  /**
   * LẤY REVIEW CỦA MỘT ITEM CỤ THỂ
   * 
   * Phương thức: GET /api/reviews/item/:itemId
   * Quyền: Ai cũng có thể xem
   * 
   * Params:
   * - itemId: ID của item
   * 
   * Response: Danh sách review được phê duyệt + thông tin item
   */
  getReviewsByItem: async (req, res) => {
    try {
      const { itemId } = req.params;

      // ✅ Kiểm tra item tồn tại
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Món ăn không tồn tại',
        });
      }

      // 📊 Lấy review được phê duyệt
      const reviews = await Review.getApprovedReviews(itemId);

      // 📈 Tính điểm đánh giá trung bình
      const averageRating = await Review.getAverageRating(itemId);

      res.status(200).json({
        status: true,
        message: 'Lấy review thành công',
        data: {
          item: {
            id: item._id,
            name: item.name,
            image: item.image,
          },
          reviews,
          averageRating: averageRating.average,
          totalReviews: averageRating.total,
        },
      });
    } catch (error) {
      console.error('💥 Lỗi lấy review của item:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi lấy review',
      });
    }
  },

  /**
   * LẤY CHI TIẾT REVIEW
   * 
   * Phương thức: GET /api/reviews/:id
   * Quyền: Ai cũng có thể xem
   * 
   * Params:
   * - id: ID của review
   * 
   * Response: Thông tin chi tiết review
   */
  getReviewById: async (req, res) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id)
        .populate('userId', 'name email')
        .populate('itemId', 'name image')
        .populate('replyBy', 'name');

      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      res.status(200).json({
        status: true,
        message: 'Lấy review thành công',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi lấy review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi lấy review',
      });
    }
  },

  /**
   * TẠO REVIEW MỚI
   * 
   * Phương thức: POST /api/reviews
   * Quyền: Ai cũng có thể tạo review (user đã đăng nhập)
   * 
   * Body:
   * {
   *   itemId: "64f...", // ID của item được review
   *   rating: 4,        // Điểm đánh giá (1-5)
   *   comment: "Rất ngon!" // Nội dung bình luận
   * }
   * 
   * Response: Review đã tạo
   */
  createReview: async (req, res) => {
    try {
      const { itemId, rating, comment } = req.body;
      const userId = req.user._id;

      // 📋 Validate input
      const validation = reviewService.validateReviewInput({ itemId, rating, comment });
      if (!validation.valid) {
        return res.status(400).json({
          status: false,
          message: validation.message,
        });
      }

      // ✅ Kiểm tra item tồn tại
      const item = await Item.findById(itemId);
      if (!item) {
        return res.status(404).json({
          status: false,
          message: 'Món ăn không tồn tại',
        });
      }

      // ✅ Kiểm tra user đã review item này chưa
      const existingReview = await Review.findOne({ userId, itemId });
      if (existingReview) {
        return res.status(400).json({
          status: false,
          message: 'Bạn đã review món này rồi. Hãy cập nhật review cũ thay vì tạo mới.',
        });
      }

      // 💾 Tạo review mới
      const review = new Review({
        userId,
        itemId,
        rating,
        comment,
      });

      await review.save();

      // 📍 Populate thông tin liên quan
      await review.populate('userId', 'name email');
      await review.populate('itemId', 'name image');

      res.status(201).json({
        status: true,
        message: 'Tạo review thành công. Đang chờ phê duyệt từ admin.',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi tạo review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi tạo review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  /**
   * CẬP NHẬT REVIEW
   * 
   * Phương thức: PUT /api/reviews/:id
   * Quyền: Chỉ chủ sở hữu review hoặc admin
   * 
   * Params:
   * - id: ID của review
   * 
   * Body:
   * {
   *   rating: 5,
   *   comment: "Cập nhật chi tiết hơn"
   * }
   * 
   * Response: Review đã cập nhật
   */
  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      // 🔒 Kiểm tra quyền (chỉ chủ sở hữu hoặc admin)
      if (review.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: false,
          message: 'Bạn không có quyền cập nhật review này',
        });
      }

      // 📋 Validate input
      if (rating !== undefined) {
        if (![1, 2, 3, 4, 5].includes(rating)) {
          return res.status(400).json({
            status: false,
            message: 'Điểm đánh giá phải từ 1 đến 5',
          });
        }
        review.rating = rating;
      }

      if (comment !== undefined) {
        if (comment.length < 10) {
          return res.status(400).json({
            status: false,
            message: 'Nhận xét phải ít nhất 10 ký tự',
          });
        }
        review.comment = comment;
        // Đặt lại trạng thái về pending sau khi cập nhật
        review.status = 'pending';
      }

      await review.save();

      res.status(200).json({
        status: true,
        message: 'Cập nhật review thành công',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi cập nhật review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi cập nhật review',
      });
    }
  },

  /**
   * XÓA REVIEW
   * 
   * Phương thức: DELETE /api/reviews/:id
   * Quyền: Chỉ chủ sở hữu review hoặc admin
   * 
   * Params:
   * - id: ID của review
   * 
   * Response: Thông báo xóa thành công
   */
  deleteReview: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      // 🔒 Kiểm tra quyền
      if (review.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: false,
          message: 'Bạn không có quyền xóa review này',
        });
      }

      await Review.deleteOne({ _id: id });

      res.status(200).json({
        status: true,
        message: 'Xóa review thành công',
      });
    } catch (error) {
      console.error('💥 Lỗi xóa review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi xóa review',
      });
    }
  },

  /**
   * PHÊ DUYỆT REVIEW (ADMIN ONLY)
   * 
   * Phương thức: PATCH /api/reviews/:id/approve
   * Quyền: Chỉ admin
   * 
   * Params:
   * - id: ID của review
   * 
   * Response: Review đã phê duyệt
   */
  approveReview: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user._id;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      await review.approve(adminId);

      res.status(200).json({
        status: true,
        message: 'Phê duyệt review thành công',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi phê duyệt review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi phê duyệt review',
      });
    }
  },

  /**
   * TỪ CHỐI REVIEW (ADMIN ONLY)
   * 
   * Phương thức: PATCH /api/reviews/:id/reject
   * Quyền: Chỉ admin
   * 
   * Params:
   * - id: ID của review
   * 
   * Response: Review đã từ chối
   */
  rejectReview: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user._id;

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      await review.reject(adminId);

      res.status(200).json({
        status: true,
        message: 'Từ chối review thành công',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi từ chối review:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi từ chối review',
      });
    }
  },

  /**
   * TRẢLỜI REVIEW (ADMIN/STAFF)
   * 
   * Phương thức: POST /api/reviews/:id/reply
   * Quyền: Chỉ admin hoặc staff
   * 
   * Params:
   * - id: ID của review
   * 
   * Body:
   * {
   *   reply: "Cảm ơn bạn đã đánh giá! Chúng tôi sẽ cải thiện..."
   * }
   * 
   * Response: Review đã cập nhật với trả lời
   */
  replyReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      const staffId = req.user._id;

      // 📋 Validate reply
      if (!reply || reply.trim().length === 0) {
        return res.status(400).json({
          status: false,
          message: 'Vui lòng nhập nội dung trả lời',
        });
      }

      if (reply.length > 500) {
        return res.status(400).json({
          status: false,
          message: 'Trả lời không được vượt quá 500 ký tự',
        });
      }

      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({
          status: false,
          message: 'Review không tồn tại',
        });
      }

      await review.addReply(reply, staffId);

      res.status(200).json({
        status: true,
        message: 'Thêm trả lời thành công',
        data: review,
      });
    } catch (error) {
      console.error('💥 Lỗi thêm trả lời:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi thêm trả lời',
      });
    }
  },

  /**
   * LẤY REVIEW CHƯA PHÊDUYỆT (ADMIN DASHBOARD)
   * 
   * Phương thức: GET /api/reviews/pending/all
   * Quyền: Chỉ admin
   * 
   * Response: Danh sách review chưa phê duyệt
   */
  getPendingReviews: async (req, res) => {
    try {
      const pendingReviews = await Review.find({ status: 'pending' })
        .populate('userId', 'name email')
        .populate('itemId', 'name')
        .sort({ createdAt: -1 });

      const totalPending = await Review.countPending();

      res.status(200).json({
        status: true,
        message: 'Lấy danh sách review chưa phê duyệt thành công',
        data: {
          reviews: pendingReviews,
          totalPending,
        },
      });
    } catch (error) {
      console.error('💥 Lỗi lấy review pending:', error.message);
      res.status(500).json({
        status: false,
        message: error.message || 'Lỗi server khi lấy review pending',
      });
    }
  },
};
