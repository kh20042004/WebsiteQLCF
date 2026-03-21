/**
 * Routes: authRoutes (STUB - tạm thời để server chạy được)
 * Phần Auth thực sự do Khánh implement
 * File này chỉ để tránh lỗi MODULE_NOT_FOUND khi test Order API
 */

const express = require('express');
const router = express.Router();

// Stub route - placeholder
router.get('/', (req, res) => {
  res.json({
    status: true,
    message: 'Auth API - do Khánh implement',
  });
});

module.exports = router;
