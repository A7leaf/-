const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由中间件
const protect = async (req, res, next) => {
  let token;

  // 检查请求头中是否有token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 获取token
      token = req.headers.authorization.split(' ')[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 如果是管理员token
      if (decoded.isAdmin) {
        req.user = {
          id: 'admin',
          username: 'admin',
          isAdmin: true
        };
        return next();
      }

      // 查找用户
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: '未授权，token无效' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: '未授权，没有token' });
  }
};

// 管理员中间件
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ success: false, message: '没有管理员权限' });
  }
};

module.exports = { protect, admin };