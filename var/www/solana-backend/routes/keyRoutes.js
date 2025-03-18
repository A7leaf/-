const express = require('express');
const router = express.Router();
const { 
    submitKey, 
    getAllKeys, 
    getKeyById, 
    exportKeys 
} = require('../controllers/keyController');
const { protect, admin } = require('../middleware/authMiddleware');

// 用户提交私钥
router.post('/submit', protect, submitKey);

// 管理员路由
router.get('/', protect, admin, getAllKeys);
router.get('/export', protect, admin, exportKeys);
router.get('/:id', protect, admin, getKeyById);

module.exports = router;