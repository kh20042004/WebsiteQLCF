/**
 * Model: Shift (Ca làm việc)
 *
 * MÔ TẢ:
 * Quản lý lịch làm việc (xếp ca) của nhân viên quán cà phê.
 * Hỗ trợ 3 ca: sáng, chiều, tối.
 * Ghi nhận thời gian check-in / check-out thực tế.
 *
 * LIÊN KẾT:
 * - User: Nhân viên được xếp ca (ref → User)
 * - User: Admin tạo ca (ref → User)
 *
 * SỬ DỤNG:
 * - Admin xếp lịch ca cho nhân viên
 * - Staff xem lịch ca của mình
 * - Staff check-in khi bắt đầu ca, check-out khi kết thúc
 * - Admin xem tổng hợp chấm công
 */

const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
    {
        // ============================================================
        // THÔNG TIN NHÂN VIÊN
        // ============================================================

        /**
         * NHÂN VIÊN ĐƯỢC XẾP CA
         * Liên kết với User model
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Nhân viên là bắt buộc']
        },

        // ============================================================
        // THÔNG TIN CA LÀM VIỆC
        // ============================================================

        /**
         * NGÀY LÀM VIỆC
         * Chỉ lưu ngày (không lưu giờ)
         */
        date: {
            type: Date,
            required: [true, 'Ngày làm việc là bắt buộc']
        },

        /**
         * LOẠI CA
         * - morning: Ca sáng (6:00 - 14:00)
         * - afternoon: Ca chiều (14:00 - 22:00)
         * - evening: Ca tối (22:00 - 6:00)
         */
        shiftType: {
            type: String,
            enum: {
                values: ['morning', 'afternoon', 'evening'],
                message: 'Loại ca phải là: morning (sáng), afternoon (chiều), hoặc evening (tối)'
            },
            required: [true, 'Loại ca là bắt buộc'],
            default: 'morning'
        },

        /**
         * GIỜ BẮT ĐẦU CA (theo lịch)
         * Ví dụ: "06:00", "14:00", "22:00"
         */
        startTime: {
            type: String,
            required: [true, 'Giờ bắt đầu là bắt buộc'],
            default: '06:00'
        },

        /**
         * GIỜ KẾT THÚC CA (theo lịch)
         * Ví dụ: "14:00", "22:00", "06:00"
         */
        endTime: {
            type: String,
            required: [true, 'Giờ kết thúc là bắt buộc'],
            default: '14:00'
        },

        // ============================================================
        // TRẠNG THÁI CHẤM CÔNG
        // ============================================================

        /**
         * TRẠNG THÁI CA LÀM VIỆC
         * - scheduled: Đã xếp lịch (chưa đến giờ)
         * - checked_in: Đã check-in (đang làm)
         * - checked_out: Đã check-out (hoàn thành)
         * - absent: Vắng mặt (không đến)
         */
        status: {
            type: String,
            enum: {
                values: ['scheduled', 'checked_in', 'checked_out', 'absent'],
                message: 'Trạng thái phải là: scheduled, checked_in, checked_out, hoặc absent'
            },
            default: 'scheduled'
        },

        /**
         * THỜI GIAN CHECK-IN THỰC TẾ
         * Ghi nhận khi nhân viên bấm check-in
         */
        checkInTime: {
            type: Date,
            default: null
        },

        /**
         * THỜI GIAN CHECK-OUT THỰC TẾ
         * Ghi nhận khi nhân viên bấm check-out
         */
        checkOutTime: {
            type: Date,
            default: null
        },

        // ============================================================
        // GHI CHÚ
        // ============================================================

        /**
         * GHI CHÚ
         * Admin có thể ghi chú thêm (VD: "Trực quầy", "Pha chế", "Thu ngân")
         */
        notes: {
            type: String,
            trim: true,
            maxlength: [200, 'Ghi chú không quá 200 ký tự'],
            default: ''
        },

        // ============================================================
        // THÔNG TIN NGƯỜI TẠO
        // ============================================================

        /**
         * ADMIN TẠO CA
         * Liên kết với User model — ai xếp ca này
         */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        // Tự động thêm createdAt và updatedAt
        timestamps: true
    }
);

// ============================================================
// INDEXES ĐỂ TỐI ƯU QUERY
// ============================================================

// Index tìm ca theo nhân viên + ngày (tránh xếp trùng)
shiftSchema.index({ user: 1, date: 1, shiftType: 1 }, { unique: true });

// Index tìm ca theo ngày
shiftSchema.index({ date: 1, status: 1 });

// ============================================================
// VIRTUAL: TÊN LOẠI CA (tiếng Việt)
// ============================================================

shiftSchema.virtual('shiftTypeName').get(function () {
    const names = {
        morning: 'Ca sáng',
        afternoon: 'Ca chiều',
        evening: 'Ca tối'
    };
    return names[this.shiftType] || this.shiftType;
});

/**
 * VIRTUAL: Tên trạng thái tiếng Việt
 */
shiftSchema.virtual('statusName').get(function () {
    const names = {
        scheduled: 'Đã xếp lịch',
        checked_in: 'Đang làm',
        checked_out: 'Hoàn thành',
        absent: 'Vắng mặt'
    };
    return names[this.status] || this.status;
});

/**
 * VIRTUAL: Tính số giờ làm thực tế
 * Chỉ tính khi đã check-in và check-out
 */
shiftSchema.virtual('workedHours').get(function () {
    if (this.checkInTime && this.checkOutTime) {
        const diff = this.checkOutTime - this.checkInTime;
        return Math.round((diff / (1000 * 60 * 60)) * 10) / 10; // Làm tròn 1 số thập phân
    }
    return 0;
});

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Lấy lịch làm việc theo tuần của 1 nhân viên
 * @param {ObjectId} userId - ID nhân viên
 * @param {Date} startOfWeek - Ngày đầu tuần
 * @param {Date} endOfWeek - Ngày cuối tuần
 */
shiftSchema.statics.getWeeklySchedule = function (userId, startOfWeek, endOfWeek) {
    return this.find({
        user: userId,
        date: { $gte: startOfWeek, $lte: endOfWeek }
    }).sort({ date: 1, shiftType: 1 });
};

/**
 * Thống kê chấm công theo tháng
 * @param {Number} month - Tháng (1-12)
 * @param {Number} year - Năm
 */
shiftSchema.statics.getMonthlyStats = async function (month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: { user: '$user', status: '$status' },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: '$_id.user',
                stats: {
                    $push: {
                        status: '$_id.status',
                        count: '$count'
                    }
                },
                totalShifts: { $sum: '$count' }
            }
        }
    ]);
};

// Kích hoạt virtual khi convert to JSON
shiftSchema.set('toJSON', { virtuals: true });
shiftSchema.set('toObject', { virtuals: true });

// ============================================================
// EXPORT MODEL
// ============================================================

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
