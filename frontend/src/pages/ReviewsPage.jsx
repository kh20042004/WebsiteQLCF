/**
 * Page: ReviewsPage.jsx
 * 
 * Trang quản lý đánh giá
 * 
 * Chức năng:
 * 1. Khách hàng: Xem review, tạo/cập nhật review của mình
 * 2. Admin: Phê duyệt/từ chối review, trả lời review
 * 3. Công khai: Hiển thị đánh giá trung bình và review được phê duyệt
 * 
 * State:
 * - reviews: Danh sách review
 * - loading: Đang tải dữ liệu
 * - error: Lỗi nếu có
 * - filters: Bộ lọc
 * - showForm: Hiển thị form tạo/sửa review
 * - editingReview: Review đang chỉnh sửa
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as reviewService from '../services/reviewService';
import { ReviewForm } from '../components/reviews';
import { isAdmin } from '../utils/auth';

const ReviewsPage = () => {
  // ---- STATE QUẢN LÝ ----
  const [reviews, setReviews] = useState([]); // Danh sách review
  const [loading, setLoading] = useState(false); // Đang tải
  const [error, setError] = useState(''); // Lỗi
  const [searchQuery, setSearchQuery] = useState(''); // Tìm kiếm

  // ---- FORM STATE ----
  const [showForm, setShowForm] = useState(false); // Hiển thị form
  const [editingReview, setEditingReview] = useState(null); // Review đang chỉnh sửa

  // ---- FILTER STATE ----
  const [filterStatus, setFilterStatus] = useState('approved'); // Lọc trạng thái

  // ---- PAGINATION ----
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // ============================================================
  // LOAD DỮ LIỆU
  // ============================================================

  /**
   * Lấy danh sách review
   */
  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        status: filterStatus,
        page,
        limit,
        sort: '-createdAt',
      };

      const response = await reviewService.getAllReviews(filters);
      
      // Extract data từ response
      const data = response.data || response;
      
      setReviews(data.reviews || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Lỗi tải review:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Load review khi page hoặc filter thay đổi
   */
  useEffect(() => {
    loadReviews();
  }, [filterStatus, page]);

  // ============================================================
  // ACTIONS
  // ============================================================

  /**
   * Xóa review
   */
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa review này?')) return;

    try {
      await reviewService.deleteReview(reviewId);
      alert('✅ Xóa review thành công');
      loadReviews();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    }
  };

  /**
   * Phê duyệt review (ADMIN)
   */
  const handleApprove = async (reviewId) => {
    try {
      await reviewService.approveReview(reviewId);
      alert('✅ Phê duyệt review thành công');
      loadReviews();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    }
  };

  /**
   * Từ chối review (ADMIN)
   */
  const handleReject = async (reviewId) => {
    try {
      await reviewService.rejectReview(reviewId);
      alert('✅ Từ chối review thành công');
      loadReviews();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    }
  };

  /**
   * Trả lời review (ADMIN/STAFF)
   */
  const handleReply = async (reviewId) => {
    const reply = prompt('Nhập trả lời từ shop:');
    if (!reply) return;

    try {
      await reviewService.replyReview(reviewId, reply);
      alert('✅ Thêm trả lời thành công');
      loadReviews();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-24">
      {/* ---- TIÊU ĐỀ ---- */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⭐ Quản lý Đánh giá</h1>
        {!isAdmin() && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingReview(null);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Viết Đánh giá
          </button>
        )}
      </div>

      {/* ---- FILTER ---- */}
      {isAdmin() && (
        <div className="bg-white p-4 rounded mb-4 shadow">
          <div className="flex gap-4">
            {/* Filter status */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded"
            >
              <option value="approved">✅ Đã phê duyệt</option>
              <option value="pending">⏳ Chờ phê duyệt</option>
              <option value="rejected">❌ Bị từ chối</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
          </div>
        </div>
      )}

      {/* ---- LOADING ---- */}
      {loading && <p className="text-center text-gray-500">⏳ Đang tải...</p>}

      {/* ---- ERROR ---- */}
      {error && <p className="text-center text-red-500">❌ {error}</p>}

      {/* ---- DANH SÁCH REVIEW ---- */}
      {!loading && reviews.length > 0 && (
        <div className="bg-white rounded shadow">
          {reviews.map((review) => (
            <div key={review._id} className="p-4 border-b hover:bg-gray-50">
              {/* Header: User + Rating */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{review.userId?.name}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        icon={i < review.rating ? 'solar:star-bold' : 'solar:star-linear'}
                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    review.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : review.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {review.status === 'approved'
                    ? '✅ Đã phê duyệt'
                    : review.status === 'pending'
                    ? '⏳ Chờ phê duyệt'
                    : '❌ Bị từ chối'}
                </span>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-3">{review.comment}</p>

              {/* Item được review */}
              <p className="text-sm text-gray-500 mb-3">
                📝 Về: {review.itemId?.name || 'Không xác định'}
              </p>

              {/* Reply (nếu có) */}
              {review.reply && (
                <div className="bg-blue-50 p-3 mb-3 rounded border-l-4 border-blue-400">
                  <p className="text-sm font-semibold text-blue-900">💬 Trả lời từ shop:</p>
                  <p className="text-sm text-blue-800">{review.reply}</p>
                  <p className="text-xs text-gray-500">- {review.replyBy?.name}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 text-sm">
                {/* Buttons cho user (chủ sở hữu review) */}
                {!isAdmin() && (
                  <>
                    <button
                      onClick={() => {
                        setEditingReview(review);
                        setShowForm(true);
                      }}
                      className="text-blue-500 hover:underline"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="text-red-500 hover:underline"
                    >
                      🗑️ Xóa
                    </button>
                  </>
                )}

                {/* Buttons cho admin */}
                {isAdmin() && filterStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(review._id)}
                      className="text-green-500 hover:underline"
                    >
                      ✅ Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(review._id)}
                      className="text-red-500 hover:underline"
                    >
                      ❌ Từ chối
                    </button>
                  </>
                )}

                {isAdmin() && (
                  <button
                    onClick={() => handleReply(review._id)}
                    className="text-blue-500 hover:underline"
                  >
                    💬 Trả lời
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- TRỐNG ---- */}
      {!loading && reviews.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          {filterStatus === 'approved' ? '📭 Chưa có review nào' : '📭 Không có review nào'}
        </p>
      )}

      {/* ---- PAGINATION ---- */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            ← Trước
          </button>
          <span className="px-3 py-1">
            Trang {page}/{totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Tiếp →
          </button>
        </div>
      )}

      {/* ---- MODAL FORM ---- */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <ReviewForm 
              existingReview={editingReview}
              onSubmit={() => {
                setShowForm(false);
                setEditingReview(null);
                loadReviews();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
