const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);

router.post('/:id/checkout', orderController.checkoutOrder);

router.get('/', orderController.getAllOrders);

module.exports = router;