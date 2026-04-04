/**
 * Validator: Payment (Thanh toán)
 * 
 * CHỨC NĂNG:
 * Validate dữ liệu đầu vào cho các API thanh toán
 * 
 * VALIDATORS:
 * 1. PaymentValidator - Tạo giao dịch thanh toán mới
 * 2. PaymentStatusValidator - Cập nhật trạng thái
 */

const { body } = require('express-validator');

/**
 * ============================================================
 * VALIDATOR: TẠO GIAO DỊCH THANH TOÁN MỚI
 * ============================================================
 * 
 * Validate các trường:
 * - orderId: Bắt buộc, phải là ObjectId hợp lệ
 * - method: Bắt buộc, phải là cash/transfer/card/ewallet
 * - amount: Bắt buộc, phải > 0
 * - receivedAmount: Optional, nếu có phải >= amount
 * - transactionId: Optional, tối đa 100 ký tự
 * - note: Optional, tối đa 500 ký tự
 */
const PaymentValidator = [
    /**
     * VALIDATE: orderId
     * 
     * - Bắt buộc phải có
     * - Phải là MongoDB ObjectId hợp lệ (24 ký tự hex)
     */
    body('orderId')
        .notEmpty()
        .withMessage('Mã đơn hàng là bắt buộc')
        .isMongoId()
        .withMessage('Mã đơn hàng không hợp lệ'),

    /**
     * VALIDATE: method (Phương thức thanh toán)
     * 
     * Các giá trị hợp lệ:
     * - cash: Tiền mặt
     * - transfer: Chuyển khoản ngân hàng
     * - card: Quẹt thẻ (ATM/Credit)
     * - ewallet: Ví điện tử (Momo, ZaloPay...)
     */
    body('method')
        .notEmpty()
        .withMessage('Phương thức thanh toán là bắt buộc')
        .isIn(['cash', 'transfer', 'card', 'ewallet'])
        .withMessage('Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: cash, transfer, card, ewallet'),

    /**
     * VALIDATE: amount (Số tiền thanh toán)
     * 
     * - Bắt buộc phải có
     * - Phải là số
     * - Phải > 0
     * - Tối đa 1 tỷ VND (1,000,000,000)
     */
    body('amount')
        .notEmpty()
        .withMessage('Số tiền thanh toán là bắt buộc')
        .isFloat({ min: 1, max: 1000000000 })
        .withMessage('Số tiền phải từ 1đ đến 1,000,000,000đ')
        .toFloat(),

    /**
     * VALIDATE: receivedAmount (Số tiền nhận được)
     * 
     * - Optional (mặc định = amount)
     * - Nếu có, phải là số >= 0
     * - Với tiền mặt: receivedAmount >= amount (không được thiếu)
     * - Với chuyển khoản/thẻ: receivedAmount = amount (tự động)
     */
    body('receivedAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Số tiền nhận phải >= 0')
        .toFloat()
        .custom((value, { req }) => {
            // Nếu là tiền mặt và receivedAmount < amount → Lỗi
            if (req.body.method === 'cash' && value < req.body.amount) {
                throw new Error('Số tiền nhận không đủ để thanh toán');
            }
            return true;
        }),

    /**
     * VALIDATE: transactionId (Mã giao dịch)
     * 
     * - Optional (chỉ bắt buộc với chuyển khoản/thẻ)
     * - Nếu có, phải là chuỗi không rỗng
     * - Tối đa 100 ký tự
     * - Trim khoảng trắng
     */
    body('transactionId')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Mã giao dịch không được rỗng')
        .isLength({ max: 100 })
        .withMessage('Mã giao dịch không quá 100 ký tự')
        .custom((value, { req }) => {
            // Với chuyển khoản/thẻ → Nên có mã giao dịch
            if (['transfer', 'card'].includes(req.body.method) && !value) {
                // Warning nhưng vẫn cho qua (không throw Error)
                console.log('⚠️ Cảnh báo: Thanh toán chuyển khoản/thẻ nên có mã giao dịch');
            }
            return true;
        }),

    /**
     * VALIDATE: note (Ghi chú)
     * 
     * - Optional
     * - Nếu có, tối đa 500 ký tự
     * - Trim khoảng trắng
     */
    body('note')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Ghi chú không quá 500 ký tự')
];

/**
 * ============================================================
 * VALIDATOR: CẬP NHẬT TRẠNG THÁI THANH TOÁN
 * ============================================================
 * 
 * Validate khi admin cập nhật trạng thái:
 * - Xác nhận chuyển khoản: pending → completed
 * - Đánh dấu thất bại: pending → failed
 * - Hoàn tiền: completed → refunded
 */
const PaymentStatusValidator = [
    /**
     * VALIDATE: status (Trạng thái mới)
     * 
     * Các giá trị hợp lệ:
     * - pending: Đang chờ xác nhận
     * - completed: Đã hoàn thành
     * - failed: Thất bại
     * - refunded: Đã hoàn tiền
     */
    body('status')
        .notEmpty()
        .withMessage('Trạng thái thanh toán là bắt buộc')
        .isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage('Trạng thái không hợp lệ. Chỉ chấp nhận: pending, completed, failed, refunded'),

    /**
     * VALIDATE: note (Ghi chú cập nhật)
     * 
     * - Optional
     * - Nên có ghi chú khi cập nhật trạng thái
     * - Tối đa 500 ký tự
     */
    body('note')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Ghi chú không quá 500 ký tự')
];

module.exports = {
    PaymentValidator,
    PaymentStatusValidator
};
