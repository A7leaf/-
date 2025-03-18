const User = require('../models/User');
const Log = require('../models/Log');
const Admin = require('../models/Admin'); // 添加Admin模型引用
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 生成JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    注册新用户
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      // 记录日志
      await Log.create({
        type: '用户',
        email: user.email,
        action: '用户注册',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      res.status(400).json({ success: false, message: '无效的用户数据' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // 记录日志
      await Log.create({
        type: '用户',
        email: user.email,
        action: '用户登录',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ success: false, message: '邮箱或密码错误' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    管理员登录
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 从数据库中查找管理员
    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      // 更新最后登录时间
      admin.lastLogin = Date.now();
      await admin.save();
      
      // 记录日志
      await Log.create({
        type: '管理员',
        username: admin.username,
        action: '管理员登录',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      // 创建一个特殊的管理员token
      const token = jwt.sign(
        { id: admin._id, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        success: true,
        token,
        admin: {
          username: admin.username
        }
      });
    } else {
      // 记录失败尝试
      await Log.create({
        type: '未知',
        username: username || '未提供',
        action: '管理员登录失败',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    修改管理员密码
// @route   POST /api/auth/change-password
// @access  Private/Admin
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 从数据库中获取管理员
    const admin = await Admin.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ success: false, message: '管理员不存在' });
    }

    // 验证当前密码
    if (!(await admin.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }

    // 更新密码
    admin.password = newPassword;
    await admin.save();

    // 记录日志
    await Log.create({
      type: '管理员',
      username: admin.username,
      action: '修改管理员密码',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminLogin,
  changeAdminPassword
};