/**
 * Component: AdminReviewPanel.jsx
 * 
 * Panel quản lý đánh giá dành cho Admin/Staff
 * 
 * Chức năng:
 * 1. Hiển thị danh sách đánh giá chờ phê duyệt
 * 2. Cho phép phê duyệt/từ chối đánh giá
 * 3. Cho phép trả lời đánh giá
 * 4. Hiển thị thống kê
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as reviewService from '../../services/reviewService';

const AdminReviewPanel = ({ onRefresh }) => {
  // ---- STATE QUẢN LÝ ----
  const [reviews, setReviews] = useState([]); // Danh sách pending
  const [loading, setLoading] = useState(false); // Đang tải
  const [error, setError] = useState(''); // Lỗi
  const [stats, setStats] = useState(null); // Thống kê

  // ---- FILTER ----
  const [filterStatus, setFilterStatus] = useState('pending'); // Lọc trạng thái
  
  // ---- PAGINATION ----
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // ---- FORM REPLY ----
  const [replyingTo, setReplyingTo] = useState(null); // Review đang trả lời
  const [replyText, setReplyText] = useState(''); // Nội dung trả lời

  // ============================================================
  // LOAD DỮ LIỆU
  // ============================================================

  /**
   * Lấy danh sách đánh giá chờ phê duyệt
   */
  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');

      // Lấy danh sách pending
      const filters = {
        status: filterStatus,
        page,
        limit,
        sort: '-createdAt',
      };

      const response = await reviewService.getAllReviews(filters);
      const data = response.data || response;
      
      setReviews(data.reviews || []);

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }

      // Callback
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Lỗi tải review:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy thống kê
   */
  const loadStats = async () => {
    try {
      const response = await reviewService.getPendingReviews();
      const data = response.data || response;
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('❌ Lỗi tải thống kê:', err);
    }
  };

  /**
   * Effect: Load dữ liệu khi page/filter thay đổi
   */
  useEffect(() => {
    loadReviews();
    loadStats();
  }, [filterStatus, page]);

  // ============================================================
  // ACTIONS
  // ============================================================

  /**
   * Phê duyệt đánh giá
   */
  const handleApprove = async (reviewId, index) => {
    try {
      setLoading(true);
      await reviewService.approveReview(reviewId);
      
      // Remove từ list
      const newReviews = reviews.filter((_, i) => i !== index);
      setReviews(newReviews);
      
      alert('✅ Phê duyệt đánh giá thành công');
      loadStats();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Từ chối đánh giá
   */
  const handleReject = async (reviewId, index) => {
    try {
      setLoading(true);
      await reviewService.rejectReview(reviewId);
      
      // Remove từ list
      const newReviews = reviews.filter((_, i) => i !== index);
      setReviews(newReviews);
      
      alert('✅ Từ chối đánh giá thành công');
      loadStats();
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trả lời đánh giá
   */
  const handleReply = async (reviewId, index) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung trả lời');
      return;
    }

    try {
      setLoading(true);
      await reviewService.replyReview(reviewId, replyText);
      
      // Update review
      const newReviews = [...reviews];
      newReviews[index] = {
        ...newReviews[index],
        reply: replyText,
        replyAt: new Date(),
      };
      setReviews(newReviews);
      
      setReplyingTo(null);
      setReplyText('');
      alert('✅ Thêm trả lời thành công');
    } catch (err) {
      alert(`❌ Lỗi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Format ngày
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded shadow-sm">
      {/* ---- TIÊU ĐỀ VÀ THỐNG KÊ ---- */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📋 Quản lý Đánh giá
        </h2>

        {/* Stats tiles */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pending */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm text-yellow-600">Chờ phê duyệt</p>
              <p className="text-3xl font-bold text-yellow-700">
                {stats.pending || 0}
              </p>
            </div>

            {/* Approved */}
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <p className="text-sm text-green-600">Đã phê duyệt</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.approved || 0}
              </p>
            </div>

            {/* Rejected */}
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <p className="text-sm text-red-600">Bị từ chối</p>
              <p className="text-3xl font-bold text-red-700">
                {stats.rejected || 0}
              </p>
            </div>

            {/* Total */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="text-sm text-blue-600">Tổng cộng</p>
              <p className="text-3xl font-bold text-blue-700">
                {(stats.pending || 0) +
                  (stats.approved || 0) +
                  (stats.rejected || 0)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ---- FILTER ---- */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'pending' && '⏳ Chờ'}
              {status === 'approved' && '✅ Phê duyệt'}
              {status === 'rejected' && '❌ Từ chối'}
            </button>
          ))}
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* ---- LOADING ---- */}
      {loading && (
        <p className="text-center text-gray-500 py-6">⏳ Đang xử lý...</p>
      )}

      {/* ---- ERROR ---- */}
      {error && (
        <p className="text-center text-red-500 py-6">❌ {error}</p>
      )}

      {/* ---- DANH SÁCH ---- */}
      {!loading && reviews.length > 0 && (
        <div>
          {reviews.map((review, index) => (
            <div
              key={review._id}
              className={`p-4 ${index !== reviews.length - 1 ? 'border-b' : ''} hover:bg-gray-50`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.userId?.name || 'Ẩn danh'}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        icon={
                          i < review.rating
                            ? 'solar:star-bold'
                            : 'solar:star-linear'
                        }
                        className={
                          i < review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
              </div>

              {/* Product info */}
              <p className="text-sm text-gray-600 mb-2">
                📝 Về: {review.itemId?.name || 'Không xác định'}
              </p>

              {/* Comment */}
              <p className="text-gray-700 mb-3 whitespace-pre-wrap line-clamp-3">
                {review.comment}
              </p>

              {/* Reply if exists */}
              {review.reply && (
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    💬 Trả lời từ shop:
                  </p>
                  <p className="text-sm text-blue-800">{review.reply}</p>
                </div>
              )}

              {/* Reply form (if replying) */}
              {replyingTo === review._id && (
                <div className="bg-gray-50 p-3 rounded border mb-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập trả lời từ shop..."
                    className="w-full border rounded p-2 h-20 resize-none mb-2 focus:outline-none focus:border-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(review._id, index)}
                      disabled={loading || !replyText.trim()}
                      className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      📤 Gửi
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      ✖️ Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 text-sm">
                {filterStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(review._id, index)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      ✅ Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(review._id, index)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      ❌ Từ chối
                    </button>
                  </>
                )}

                <button
                  onClick={() => setReplyingTo(review._id)}
                  disabled={loading || replyingTo === review._id}
                  className={`px-3 py-1 rounded text-white ${
                    replyingTo === review._id
                      ? 'bg-gray-400'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {review.reply ? '✏️ Sửa' : '💬 Trả lời'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- TRỐNG ---- */}
      {!loading && reviews.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          {filterStatus === 'pending'
            ? '🎉 Không có đánh giá chờ phê duyệt'
            : '📭 Không có đánh giá nào'}
        </p>
      )}

      {/* ---- PAGINATION ---- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            ← Trước
          </button>

          <span className="text-sm text-gray-600">
            Trang <span className="font-semibold">{page}</span>/{totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReviewPanel;
