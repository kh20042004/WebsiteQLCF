/**
 * Component: ReviewList.jsx
 * 
 * Danh sách review cho một sản phẩm cụ thể
 * 
 * Chức năng:
 * 1. Hiển thị tất cả review được phê duyệt của một sản phẩm
 * 2. Hiển thị đánh giá trung bình và số lượng
 * 3. Cho phép sắp xếp (mới nhất, cũ nhất, cao nhất, thấp nhất)
 * 4. Phân trang
 * 
 * Props:
 * - itemId: ID của sản phẩm
 * - onReviewCountChange: Callback khi số lượng review thay đổi
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as reviewService from '../../services/reviewService';

const ReviewList = ({ itemId, onReviewCountChange }) => {
  // ---- STATE QUẢN LÝ ----
  const [reviews, setReviews] = useState([]); // Danh sách review
  const [loading, setLoading] = useState(false); // Đang tải
  const [error, setError] = useState(''); // Lỗi
  const [avgRating, setAvgRating] = useState(0); // Đánh giá trung bình
  const [totalReviews, setTotalReviews] = useState(0); // Tổng số review
  const [ratingDistribution, setRatingDistribution] = useState({}); // Phân bố điểm

  // ---- FILTER & SORT ----
  const [sortBy, setSortBy] = useState('-createdAt'); // Sắp xếp (mặc định: mới nhất)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // ============================================================
  // LOAD DỮ LIỆU
  // ============================================================

  /**
   * Lấy review của sản phẩm
   */
  const loadReviews = async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      setError('');

      const filters = {
        itemId,
        page,
        limit,
        sort: sortBy,
      };

      const response = await reviewService.getReviewsByItem(itemId, filters);
      
      // Extract data
      const data = response.data || response;
      
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setTotalReviews(data.totalReviews || 0);
      setRatingDistribution(data.ratingDistribution || {});

      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      }

      // Callback
      if (onReviewCountChange) {
        onReviewCountChange(data.totalReviews || 0, data.avgRating || 0);
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Lỗi tải review:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect: Load review khi itemId, page, hoặc sort thay đổi
   */
  useEffect(() => {
    loadReviews();
  }, [itemId, page, sortBy]);

  // ============================================================
  // UTILITIES
  // ============================================================

  /**
   * Format ngày tháng
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Tính % cho thanh đánh giá
   */
  const getPercentage = (count) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded shadow-sm">
      {/* ---- TÓML'ỬC ĐÁNH GIÁ ---- */}
      {totalReviews > 0 && (
        <div className="p-6 border-b">
          {/* Header: Đánh giá trung bình */}
          <div className="mb-6">
            <div className="flex items-start gap-6">
              {/* Score lớn */}
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-800">{avgRating.toFixed(1)}</p>
                <div className="flex justify-center gap-1 my-2">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      icon={
                        i < Math.round(avgRating)
                          ? 'solar:star-bold'
                          : 'solar:star-linear'
                      }
                      className={
                        i < Math.round(avgRating)
                          ? 'text-yellow-400 text-xl'
                          : 'text-gray-300 text-xl'
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Dựa trên {totalReviews} đánh giá
                </p>
              </div>

              {/* Rating distribution */}
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = getPercentage(count);

                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600 w-12">
                        {star} ⭐
                      </span>
                      <div className="flex-1 bg-gray-200 rounded h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- FILTER & SORT ---- */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-gray-700">
            {totalReviews} Đánh giá
          </p>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="-createdAt">🔤 Mới nhất</option>
            <option value="createdAt">🔣 Cũ nhất</option>
            <option value="-rating">📈 Cao nhất</option>
            <option value="rating">📉 Thấp nhất</option>
          </select>
        </div>
      </div>

      {/* ---- LOADING ---- */}
      {loading && (
        <p className="text-center text-gray-500 py-6">⏳ Đang tải đánh giá...</p>
      )}

      {/* ---- ERROR ---- */}
      {error && <p className="text-center text-red-500 py-6">❌ {error}</p>}

      {/* ---- DANH SÁCH ---- */}
      {!loading && reviews.length > 0 && (
        <div>
          {reviews.map((review, index) => (
            <div key={review._id} className={`p-4 ${index !== reviews.length - 1 ? 'border-b' : ''}`}>
              {/* Header: User + Rating + Date */}
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
                <p className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                {review.comment}
              </p>

              {/* Reply nếu có */}
              {review.reply && (
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    💬 Trả lời từ shop:
                  </p>
                  <p className="text-sm text-blue-800 mb-1">{review.reply}</p>
                  <p className="text-xs text-gray-500">
                    - {review.replyBy?.name} ({formatDate(review.replyAt)})
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---- TRỐNG ---- */}
      {!loading && reviews.length === 0 && totalReviews === 0 && (
        <p className="text-center text-gray-500 py-8">
          📭 Chưa có đánh giá nào cho sản phẩm này
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

export default ReviewList;
