let { body, validationResult } = require('express-validator')

module.exports = {
    ItemValidator: [
        body('name').notEmpty().withMessage("Tên món không được để trống"),
        body('price').notEmpty().withMessage("Giá không được để trống").isNumeric().withMessage("Giá phải là số"),
        body('category').notEmpty().withMessage("Danh mục không được để trống").isMongoId().withMessage("Danh mục phải là ID hợp lệ")
    ],
    CategoryValidator: [
        body('name').notEmpty().withMessage("Tên danh mục không được để trống")
    ],
    validationResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(404).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ));
        } else {
            next()
        }
    }
}
