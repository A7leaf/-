const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// 加载环境变量
dotenv.config();

// 连接数据库
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => {
  console.error('MongoDB 连接失败', err);
  process.exit(1);
});

const createAdmin = async () => {
  try {
    // 检查是否已存在管理员
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      console.log('管理员账号已存在，跳过创建');
      process.exit(0);
    }
    
    // 创建默认管理员
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('默认管理员账号创建成功:');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请登录后立即修改默认密码！');
    
    process.exit(0);
  } catch (error) {
    console.error('创建管理员账号失败:', error);
    process.exit(1);
  }
};

createAdmin();