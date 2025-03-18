const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    adminLogin, 
    changeAdminPassword 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// 用户认证路由
router.post('/register', registerUser);
router.post('/login', loginUser);

// 管理员认证路由
router.post('/admin-login', adminLogin);
router.post('/change-password', protect, admin, changeAdminPassword);

module.exports = router;