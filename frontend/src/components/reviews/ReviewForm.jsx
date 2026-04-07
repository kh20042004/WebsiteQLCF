/**
 * Component: ReviewForm.jsx
 * 
 * Form tạo/cập nhật đánh giá sản phẩm
 * 
 * Chức năng:
 * 1. Cho phép người dùng nhập đánh giá (1-5 sao)
 * 2. Cho phép nhập nhận xét chi tiết
 * 3. Kiểm tra trùng lặp (không được review cùng sản phẩm 2 lần)
 * 4. Gửi review đến backend
 * 
 * Props:
 * - itemId: ID sản phẩm
 * - itemName: Tên sản phẩm
 * - existingReview: Review hiện tại (nếu sửa)
 * - onSubmit: Callback khi submit thành công
 * - onCancel: Callback khi hủy
 */

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import * as reviewService from '../../services/reviewService';
import itemService from '../../services/itemService';

const ReviewForm = ({ itemId: propItemId, itemName: propItemName, existingReview, onSubmit, onCancel }) => {
  // ---- STATE ----
  const [items, setItems] = useState([]); // Danh sách sản phẩm
  const [selectedItemId, setSelectedItemId] = useState(propItemId || ''); // Item được chọn
  const [selectedItemName, setSelectedItemName] = useState(propItemName || ''); // Tên item được chọn
  const [rating, setRating] = useState(existingReview?.rating || 5); // Điểm đánh giá
  const [comment, setComment] = useState(existingReview?.comment || ''); // Nhận xét
  const [loading, setLoading] = useState(false); // Đang gửi
  const [loadingItems, setLoadingItems] = useState(false); // Đang load items
  const [error, setError] = useState(''); // Lỗi
  const [hoverRating, setHoverRating] = useState(0); // Rating khi hover

  // ============================================================
  // LOAD ITEMS
  // ============================================================

  /**
   * Load danh sách sản phẩm
   */
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoadingItems(true);
        const response = await itemService.getAllItems({ limit: 100 });
        // API trả về items array trực tiếp
        const itemsList = Array.isArray(response) ? response : response.items || [];
        setItems(itemsList);
        console.log('✅ Tải sản phẩm thành công:', itemsList.length);
      } catch (err) {
        console.error('❌ Lỗi tải sản phẩm:', err);
        setError('Lỗi tải danh sách sản phẩm');
      } finally {
        setLoadingItems(false);
      }
    };

    loadItems();
  }, []);

  // ---- VALIDATION RULES ----
  const MIN_COMMENT_LENGTH = 10;
  const MAX_COMMENT_LENGTH = 1000;
  const isCommentValid = comment.length >= MIN_COMMENT_LENGTH;

  // ============================================================
  // SUBMIT HANDLER
  // ============================================================

  /**
   * Gửi form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!selectedItemId) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }

    if (!isCommentValid) {
      setError(
        `Nhận xét phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự (hiện: ${comment.length})`
      );
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        rating,
        comment,
        ...(existingReview && { itemId: selectedItemId }),
      };

      if (existingReview) {
        // Cập nhật
        await reviewService.updateReview(existingReview._id, reviewData);
      } else {
        // Tạo mới
        await reviewService.createReview({
          itemId: selectedItemId,
          rating,
          comment,
        });
      }

      // Reset form
      setComment('');
      setRating(5);
      setSelectedItemId('');
      setSelectedItemName('');

      // Callback
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-white rounded shadow-sm p-6">
      {/* ---- TIÊU ĐỀ ---- */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {existingReview ? '✏️ Chỉnh sửa Đánh giá' : '⭐ Viết Đánh giá'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* ---- CHỌN SẢN PHẨM ---- */}
        {!propItemId && (
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
              Sản phẩm: <span className="text-red-500">*</span>
            </label>

            <select
              value={selectedItemId}
              onChange={(e) => {
                const itemId = e.target.value;
                setSelectedItemId(itemId);
                
                // Lấy tên item từ danh sách
                const selected = items.find(item => item._id === itemId);
                setSelectedItemName(selected?.name || '');
              }}
              disabled={loadingItems}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">
                {loadingItems ? '⏳ Đang tải...' : '-- Chọn sản phẩm --'}
              </option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hiển thị sản phẩm nếu đã chọn hoặc truyền vào props */}
        {(selectedItemName || propItemName) && (
          <p className="text-sm text-gray-600 mb-4">
            📝 Sản phẩm: <span className="font-semibold">{selectedItemName || propItemName}</span>
          </p>
        )}

        {/* ---- RATING ---- */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3">
            Điểm đánh giá: <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Icon
                  icon="solar:star-bold"
                  className={`text-4xl transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-2">
            {rating === 1 && '😞 Rất không hài lòng'}
            {rating === 2 && '😕 Không hài lòng'}
            {rating === 3 && '😐 Bình thường'}
            {rating === 4 && '😊 Hài lòng'}
            {rating === 5 && '😍 Rất hài lòng'}
          </p>
        </div>

        {/* ---- COMMENT ---- */}
        <div className="mb-6">
          <label className="block font-semibold text-gray-700 mb-3">
            Nhận xét: <span className="text-red-500">*</span>
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ kinh nghiệm của bạn về sản phẩm này..."
            className={`w-full border rounded p-3 h-32 resize-none focus:outline-none ${
              isCommentValid
                ? 'border-green-400 focus:border-green-600'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />

          {/* Ký tự counter */}
          <div className="flex justify-between text-sm mt-2">
            <p
              className={`font-semibold ${
                isCommentValid ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {comment.length}/{MAX_COMMENT_LENGTH} ký tự
              {isCommentValid && ' ✓'}
            </p>

            {!isCommentValid && (
              <p className="text-red-500">
                Cần tối thiểu {MIN_COMMENT_LENGTH - comment.length} ký tự nữa
              </p>
            )}
          </div>
        </div>

        {/* ---- ERROR ---- */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            ❌ {error}
          </div>
        )}

        {/* ---- Thông báo cho tạo mới ---- */}
        {!existingReview && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
            ℹ️ Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị
          </div>
        )}

        {/* ---- BUTTONS ---- */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !isCommentValid || !selectedItemId}
            className={`flex-1 px-4 py-2 rounded font-semibold text-white transition-colors ${
              isCommentValid && !loading && selectedItemId
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                ⏳ Đang gửi...
              </>
            ) : (
              <>
                💾 {existingReview ? 'Cập nhật' : 'Gửi'} Đánh giá
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ✖️ Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
