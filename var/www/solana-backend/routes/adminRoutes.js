const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getLogs, 
  clearLogs 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// 所有路由都需要管理员权限
router.use(protect, admin);

router.get('/stats', getStats);
router.get('/logs', getLogs);
router.delete('/logs/clear', clearLogs);

module.exports = router;