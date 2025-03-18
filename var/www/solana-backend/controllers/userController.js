const User = require('../models/User');
const Log = require('../models/Log');

// @desc    获取所有用户
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    根据ID获取用户
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: '用户不存在' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    创建用户
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }

    const user = await User.create({
      name,
      email,
      password,
      verified: true // 管理员创建的用户默认已验证
    });

    if (user) {
      // 记录日志
      await Log.create({
        type: '管理员',
        username: req.user.name,
        action: `创建用户 ${email}`,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified
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

// @desc    更新用户
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.verified = req.body.verified !== undefined ? req.body.verified : user.verified;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // 记录日志
      await Log.create({
        type: '管理员',
        username: req.user.name,
        action: `更新用户 ${updatedUser.email}`,
        ip: req.ip
      });

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          verified: updatedUser.verified
        }
      });
    } else {
      res.status(404).json({ success: false, message: '用户不存在' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    删除用户
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      const userEmail = user.email;
      await user.remove();
      
      // 记录日志
      await Log.create({
        type: '管理员',
        username: req.user.name,
        action: `删除用户 ${userEmail}`,
        ip: req.ip
      });

      res.json({ success: true, message: '用户已删除' });
    } else {
      res.status(404).json({ success: false, message: '用户不存在' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};