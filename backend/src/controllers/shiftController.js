/**
 * Controller: shiftController.js
 *
 * Xử lý logic nghiệp vụ cho quản lý ca làm việc
 *
 * CHỨC NĂNG:
 * - Lấy danh sách ca (có lọc theo ngày, nhân viên, trạng thái)
 * - Lấy chi tiết 1 ca
 * - Tạo ca mới / xếp lịch (CHỈ ADMIN)
 * - Cập nhật ca (CHỈ ADMIN)
 * - Xóa ca (CHỈ ADMIN)
 * - Check-in (Staff tự bấm khi bắt đầu ca)
 * - Check-out (Staff tự bấm khi kết thúc ca)
 * - Lấy ca của nhân viên đang đăng nhập (Staff xem lịch của mình)
 *
 * PHÂN QUYỀN:
 * - Staff: Xem lịch của mình + check-in/check-out
 * - Admin: Toàn quyền (CRUD + xem tất cả + thống kê)
 */

const Shift = require('../models/Shift');

const shiftController = {

    // ============================================================
    // LẤY DANH SÁCH CA LÀM VIỆC (có lọc)
    // ============================================================
    /**
     * GET /api/shifts
     *
     * Query params:
     * - date: Lọc theo ngày (YYYY-MM-DD)
     * - userId: Lọc theo nhân viên
     * - shiftType: Lọc theo loại ca (morning/afternoon/evening)
     * - status: Lọc theo trạng thái
     */
    getAllShifts: async (req, res) => {
        try {
            const { date, userId, shiftType, status } = req.query;

            // Xây dựng query
            const query = {};

            // Lọc theo ngày
            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }

            // Lọc theo nhân viên
            if (userId) {
                query.user = userId;
            }

            // Lọc theo loại ca
            if (shiftType && ['morning', 'afternoon', 'evening'].includes(shiftType)) {
                query.shiftType = shiftType;
            }

            // Lọc theo trạng thái
            if (status && ['scheduled', 'checked_in', 'checked_out', 'absent'].includes(status)) {
                query.status = status;
            }

            const shifts = await Shift.find(query)
                .populate('user', 'name email role')        // Populate nhân viên
                .populate('createdBy', 'name email role')   // Populate admin tạo
                .sort({ date: -1, shiftType: 1 })           // Mới nhất lên đầu
                .lean();

            res.status(200).json({
                status: true,
                message: 'Lấy danh sách ca làm việc thành công',
                results: shifts.length,
                data: shifts
            });

        } catch (error) {
            console.error('💥 Lỗi lấy danh sách ca:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy danh sách ca',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // LẤY CHI TIẾT 1 CA
    // ============================================================
    /**
     * GET /api/shifts/:id
     */
    getShiftById: async (req, res) => {
        try {
            const shift = await Shift.findById(req.params.id)
                .populate('user', 'name email role')
                .populate('createdBy', 'name email role');

            if (!shift) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy ca làm việc'
                });
            }

            res.status(200).json({
                status: true,
                message: 'Lấy thông tin ca thành công',
                data: shift
            });

        } catch (error) {
            console.error('💥 Lỗi lấy chi tiết ca:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy chi tiết ca',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // TẠO CA MỚI / XẾP LỊCH (CHỈ ADMIN)
    // ============================================================
    /**
     * POST /api/shifts
     *
     * Body:
     * {
     *   "user": "65abc123...",
     *   "date": "2026-04-10",
     *   "shiftType": "morning",
     *   "startTime": "06:00",
     *   "endTime": "14:00",
     *   "notes": "Trực quầy"
     * }
     */
    createShift: async (req, res) => {
        try {
            const { user, date, shiftType, startTime, endTime, notes } = req.body;

            console.log(`📅 Xếp ca: Nhân viên ${user} - ${shiftType} - ${date}`);

            // Kiểm tra dữ liệu bắt buộc
            if (!user || !date || !shiftType) {
                return res.status(400).json({
                    status: false,
                    message: 'Vui lòng chọn nhân viên, ngày và loại ca'
                });
            }

            // Thời gian mặc định theo loại ca
            const defaultTimes = {
                morning: { start: '06:00', end: '14:00' },
                afternoon: { start: '14:00', end: '22:00' },
                evening: { start: '22:00', end: '06:00' }
            };

            const newShift = await Shift.create({
                user,
                date: new Date(date),
                shiftType,
                startTime: startTime || defaultTimes[shiftType]?.start || '06:00',
                endTime: endTime || defaultTimes[shiftType]?.end || '14:00',
                notes: notes || '',
                status: 'scheduled',
                createdBy: req.user._id
            });

            // Populate thông tin
            const populatedShift = await Shift.findById(newShift._id)
                .populate('user', 'name email role')
                .populate('createdBy', 'name email role');

            console.log(`✅ Xếp ca thành công: ${newShift._id}`);

            res.status(201).json({
                status: true,
                message: 'Xếp ca thành công',
                data: populatedShift
            });

        } catch (error) {
            // Xử lý lỗi trùng ca (unique index: user + date + shiftType)
            if (error.code === 11000) {
                return res.status(400).json({
                    status: false,
                    message: 'Nhân viên đã có ca này trong ngày đã chọn. Không thể xếp trùng ca.'
                });
            }
            console.error('💥 Lỗi tạo ca:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi tạo ca',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // CẬP NHẬT CA (CHỈ ADMIN)
    // ============================================================
    /**
     * PUT /api/shifts/:id
     */
    updateShift: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            console.log(`🔄 Cập nhật ca ID: ${id}`);

            const shift = await Shift.findById(id);
            if (!shift) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy ca để cập nhật'
                });
            }

            // Cập nhật các trường được phép
            const allowedFields = ['user', 'date', 'shiftType', 'startTime', 'endTime', 'status', 'notes'];
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    shift[field] = field === 'date' ? new Date(updateData[field]) : updateData[field];
                }
            });

            await shift.save();

            // Populate lại
            const updatedShift = await Shift.findById(id)
                .populate('user', 'name email role')
                .populate('createdBy', 'name email role');

            console.log(`✅ Cập nhật ca thành công`);

            res.status(200).json({
                status: true,
                message: 'Cập nhật ca thành công',
                data: updatedShift
            });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    status: false,
                    message: 'Nhân viên đã có ca này trong ngày. Không thể xếp trùng.'
                });
            }
            console.error('💥 Lỗi cập nhật ca:', error.message);
            res.status(500).json({
                status: false,
                message: error.message || 'Lỗi server khi cập nhật ca',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // XÓA CA (CHỈ ADMIN)
    // ============================================================
    /**
     * DELETE /api/shifts/:id
     */
    deleteShift: async (req, res) => {
        try {
            const { id } = req.params;

            const shift = await Shift.findById(id);
            if (!shift) {
                return res.status(404).json({
                    status: false,
                    message: 'Không tìm thấy ca để xóa'
                });
            }

            // Không cho xóa ca đang diễn ra
            if (shift.status === 'checked_in') {
                return res.status(400).json({
                    status: false,
                    message: 'Không thể xóa ca đang diễn ra (nhân viên đã check-in)'
                });
            }

            await Shift.findByIdAndDelete(id);

            console.log(`✅ Xóa ca thành công`);

            res.status(200).json({
                status: true,
                message: 'Đã xóa ca thành công'
            });

        } catch (error) {
            console.error('💥 Lỗi xóa ca:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi xóa ca',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // CHECK-IN (Staff tự bấm)
    // ============================================================
    /**
     * POST /api/shifts/:id/check-in
     * Staff bấm check-in khi bắt đầu ca
     */
    checkIn: async (req, res) => {
        try {
            const { id } = req.params;

            const shift = await Shift.findById(id);
            if (!shift) {
                return res.status(404).json({ status: false, message: 'Không tìm thấy ca' });
            }

            // Kiểm tra ca thuộc về user đang đăng nhập
            if (shift.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    status: false,
                    message: 'Bạn chỉ có thể check-in ca của mình'
                });
            }

            // Kiểm tra trạng thái
            if (shift.status !== 'scheduled') {
                return res.status(400).json({
                    status: false,
                    message: `Không thể check-in ca đang ở trạng thái "${shift.status}"`
                });
            }

            // Cập nhật check-in
            shift.status = 'checked_in';
            shift.checkInTime = new Date();
            await shift.save();

            const updatedShift = await Shift.findById(id)
                .populate('user', 'name email role');

            console.log(`✅ Check-in thành công: ${req.user.name} lúc ${shift.checkInTime}`);

            res.status(200).json({
                status: true,
                message: `Check-in thành công lúc ${shift.checkInTime.toLocaleTimeString('vi-VN')}`,
                data: updatedShift
            });

        } catch (error) {
            console.error('💥 Lỗi check-in:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi check-in',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // CHECK-OUT (Staff tự bấm)
    // ============================================================
    /**
     * POST /api/shifts/:id/check-out
     * Staff bấm check-out khi kết thúc ca
     */
    checkOut: async (req, res) => {
        try {
            const { id } = req.params;

            const shift = await Shift.findById(id);
            if (!shift) {
                return res.status(404).json({ status: false, message: 'Không tìm thấy ca' });
            }

            // Kiểm tra ca thuộc về user đang đăng nhập
            if (shift.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    status: false,
                    message: 'Bạn chỉ có thể check-out ca của mình'
                });
            }

            // Kiểm tra trạng thái phải là checked_in
            if (shift.status !== 'checked_in') {
                return res.status(400).json({
                    status: false,
                    message: 'Bạn cần check-in trước khi check-out'
                });
            }

            // Cập nhật check-out
            shift.status = 'checked_out';
            shift.checkOutTime = new Date();
            await shift.save();

            const updatedShift = await Shift.findById(id)
                .populate('user', 'name email role');

            // Tính số giờ làm
            const workedMs = shift.checkOutTime - shift.checkInTime;
            const workedHours = Math.round((workedMs / (1000 * 60 * 60)) * 10) / 10;

            console.log(`✅ Check-out thành công: ${req.user.name} - ${workedHours} giờ`);

            res.status(200).json({
                status: true,
                message: `Check-out thành công! Bạn đã làm ${workedHours} giờ`,
                data: updatedShift
            });

        } catch (error) {
            console.error('💥 Lỗi check-out:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi check-out',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // ============================================================
    // LẤY CA CỦA NHÂN VIÊN ĐANG ĐĂNG NHẬP (Staff xem lịch mình)
    // ============================================================
    /**
     * GET /api/shifts/my-shifts
     * Staff xem lịch ca của bản thân
     */
    getMyShifts: async (req, res) => {
        try {
            const { date, status } = req.query;
            const query = { user: req.user._id };

            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                query.date = { $gte: startOfDay, $lte: endOfDay };
            }

            if (status) query.status = status;

            const shifts = await Shift.find(query)
                .populate('user', 'name email role')
                .populate('createdBy', 'name email role')
                .sort({ date: -1, shiftType: 1 })
                .lean();

            res.status(200).json({
                status: true,
                message: 'Lấy lịch ca cá nhân thành công',
                results: shifts.length,
                data: shifts
            });

        } catch (error) {
            console.error('💥 Lỗi lấy lịch cá nhân:', error.message);
            res.status(500).json({
                status: false,
                message: 'Lỗi server khi lấy lịch cá nhân',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = shiftController;
