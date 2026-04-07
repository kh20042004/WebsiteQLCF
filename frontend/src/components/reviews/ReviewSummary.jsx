/**
 * Component: ReviewSummary.jsx
 * 
 * Tóm tắt đánh giá để hiển thị trên trang chi tiết sản phẩm
 * 
 * Chức năng:
 * 1. Hiển thị đánh giá trung bình dạng nhỏ gọn
 * 2. Hiển thị số lượng review
 * 3. Cho phép link tới trang chi tiết review
 * 
 * Props:
 * - itemId: ID sản phẩm
 * - onViewAll: Callback khi click "Xem tất cả"
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as reviewService from '../../services/reviewService';

const ReviewSummary = ({ itemId, onViewAll }) => {
  // ---- STATE ----
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD DỮ LIỆU
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await reviewService.getReviewsByItem(itemId);
        const data = response.data || response;

        setAvgRating(data.avgRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } catch (err) {
        console.error('❌ Lỗi tải review:', err);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      loadData();
    }
  }, [itemId]);

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded animate-pulse">
        <p className="text-gray-500 text-sm">⏳ Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded">
      <div className="flex items-center justify-between">
        {/* Left: Rating info */}
        <div className="flex items-center gap-4">
          {/* Score */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {avgRating.toFixed(1)}
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-0.5 my-1">
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
                      ? 'text-yellow-400 text-sm'
                      : 'text-gray-300 text-sm'
                  }
                />
              ))}
            </div>

            <p className="text-xs text-gray-500">
              {totalReviews} {totalReviews === 1 ? 'đánh giá' : 'đánh giá'}
            </p>
          </div>
        </div>

        {/* Right: Action button */}
        {totalReviews > 0 && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            Xem tất cả →
          </button>
        )}
      </div>

      {/* Empty state */}
      {totalReviews === 0 && (
        <p className="text-center text-gray-500 text-sm py-2">
          📭 Chưa có đánh giá
        </p>
      )}
    </div>
  );
};

export default ReviewSummary;
