import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import useModal from '../../hooks/useModal';
import useTables from '../../hooks/useTables';

/**
 * EditTableModal Component - Modal để chỉnh sửa thông tin bàn
 * Similar to AddTableModal but pre-filled with existing table data
 */
const EditTableModal = ({ table, isOpen, onClose }) => {
  const { showSuccessNotification, showErrorNotification } = useModal();
  const { updateTable } = useTables();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    location: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Location options
  const locationOptions = [
    { value: '', label: 'Chọn khu vực' },
    { value: 'Tầng Chính', label: 'Tầng Chính' },
    { value: 'Chỗ Cửa Sổ', label: 'Chỗ Cửa Sổ' },
    { value: 'Sân Vườn Ngoài Trời', label: 'Sân Vườn Ngoài Trời' },
    { value: 'Quầy Bar', label: 'Quầy Bar' }
  ];

  // Pre-fill form when table prop changes
  useEffect(() => {
    if (table && isOpen) {
      // Parse the notes field which might contain "location - notes"
      let location = '';
      let notes = '';

      if (table.notes) {
        const locationMatch = locationOptions.find(opt =>
          opt.value && table.notes.startsWith(opt.value)
        );

        if (locationMatch) {
          location = locationMatch.value;
          notes = table.notes.replace(`${locationMatch.value} - `, '').trim();
        } else {
          notes = table.notes;
        }
      }

      setFormData({
        name: table.name || '',
        capacity: table.capacity || '',
        location: location,
        notes: notes
      });
      setErrors({});
    }
  }, [table, isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên bàn là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên bàn phải có ít nhất 2 ký tự';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Tên bàn không được quá 50 ký tự';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Sức chứa là bắt buộc';
    } else if (formData.capacity < 1) {
      newErrors.capacity = 'Sức chứa phải ít nhất 1 người';
    } else if (formData.capacity > 20) {
      newErrors.capacity = 'Sức chứa không được quá 20 người';
    }

    if (formData.notes && formData.notes.length > 200) {
      newErrors.notes = 'Ghi chú không được quá 200 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const tableData = {
        name: formData.name.trim(),
        capacity: parseInt(formData.capacity),
        notes: formData.location && formData.notes
          ? `${formData.location} - ${formData.notes.trim()}`
          : formData.location || formData.notes.trim() || ''
      };

      const result = await updateTable(table._id, tableData);

      if (result.success) {
        showSuccessNotification(`Bàn "${formData.name}" đã được cập nhật thành công!`);
        handleClose();
      } else {
        showErrorNotification(result.error || 'Có lỗi xảy ra khi cập nhật bàn');
      }
    } catch (error) {
      console.error('Error updating table:', error);
      showErrorNotification('Có lỗi xảy ra khi cập nhật bàn');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close modal
  const handleClose = () => {
    setFormData({
      name: '',
      capacity: '',
      location: '',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !table) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] overflow-hidden scale-100 transition-transform">

          {/* Decorative Header Gradient */}
          <div className="h-2 w-full bg-gradient-to-r from-[#8B5A3C] via-[#D4AF37] to-[#A0644E]"></div>

          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                Chỉnh Sửa Bàn
              </h2>
              <button
                onClick={handleClose}
                className="text-stone-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
              >
                <Icon icon="solar:close-circle-outline" className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Table Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 ml-1">
                  Tên/Số bàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ví dụ: Bàn 12"
                  className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-stone-900 outline-none transition-colors shadow-sm ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-stone-200 focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)]'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 ml-1">{errors.name}</p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 ml-1">
                  Sức chứa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    max="20"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Số chỗ ngồi"
                    className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 outline-none transition-colors shadow-sm ${
                      errors.capacity
                        ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                        : 'border-stone-200 focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)]'
                    }`}
                  />
                  <Icon
                    icon="solar:users-group-rounded-outline"
                    className="absolute left-3.5 top-3 text-stone-400"
                  />
                </div>
                {errors.capacity && (
                  <p className="text-xs text-red-500 ml-1">{errors.capacity}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 ml-1">
                  Vị trí
                </label>
                <div className="relative">
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full appearance-none bg-white border border-stone-200 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-900 outline-none transition-colors shadow-sm focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)]"
                  >
                    {locationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="solar:alt-arrow-down-outline"
                    className="absolute right-4 top-3.5 text-stone-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 ml-1">
                  Ghi chú
                  <span className="text-stone-400 ml-1">({200 - formData.notes.length} ký tự còn lại)</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về bàn (tùy chọn)"
                  maxLength="200"
                  rows="3"
                  className={`w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-stone-900 outline-none transition-colors shadow-sm resize-none ${
                    errors.notes
                      ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                      : 'border-stone-200 focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(139,90,60,0.1)]'
                  }`}
                />
                {errors.notes && (
                  <p className="text-xs text-red-500 ml-1">{errors.notes}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#8B5A3C] hover:bg-[#A0644E] text-white shadow-[0_4px_14px_0_rgba(139,90,60,0.39)] px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập Nhật Bàn'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTableModal;