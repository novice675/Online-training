const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining')
  .then(() => {
    console.log('数据库连接成功');
    initAppUserData();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });

// AppUser模型定义
const appUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

const AppUser = mongoose.model('AppUser', appUserSchema, 'appUser');

// 生成测试数据
async function initAppUserData() {
  try {
    // 先清空现有数据（可选，如果不想清空可以注释掉）
    console.log('清空现有AppUser数据...');
    await AppUser.deleteMany({});
    
    console.log('开始生成AppUser测试数据...');
    
    // 测试用户数据
    const testUsers = [
      {
        username: 'zhangsan',
        phone: '13800138001',
        password: '123456',
        nickname: '张三',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220977.jpg'
      },
      {
        username: 'lisi',
        phone: '13800138002',
        password: '123456',
        nickname: '李四',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220978.jpg'
      },
      {
        username: 'wangwu',
        phone: '13800138003',
        password: '123456',
        nickname: '王五',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220979.jpg'
      },
      {
        username: 'zhaoliu',
        phone: '13800138004',
        password: '123456',
        nickname: '赵六',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220980.jpg'
      },
      {
        username: 'sunqi',
        phone: '13800138005',
        password: '123456',
        nickname: '孙七',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220981.jpg'
      },
      {
        username: 'zhouba',
        phone: '13800138006',
        password: '123456',
        nickname: '周八',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220982.jpg'
      },
      {
        username: 'wujiu',
        phone: '13800138007',
        password: '123456',
        nickname: '吴九',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220983.jpg'
      },
      {
        username: 'zhengshi',
        phone: '13800138008',
        password: '123456',
        nickname: '郑十',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220984.jpg'
      },
      {
        username: 'admin001',
        phone: '13900139001',
        password: '123456',
        nickname: '管理员001',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220985.jpg'
      },
      {
        username: 'testuser',
        phone: '13900139002',
        password: '123456',
        nickname: '测试用户',
        avatar: 'https://www.kaitupian.cn/cjpic/frombd/1/253/366377871/1545220986.jpg'
      }
    ];

    // 准备插入数据（不加密密码）
    const usersWithTimestamp = testUsers.map(user => ({
      ...user,
      createTime: new Date(),
      updateTime: new Date()
    }));

    // 批量插入数据
    const result = await AppUser.insertMany(usersWithTimestamp);
    
    console.log(`成功插入 ${result.length} 条AppUser数据:`);
    result.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nickname} (${user.username}) - ${user.phone}`);
    });

    console.log('\nAppUser测试数据初始化完成！');
    
  } catch (error) {
    console.error('初始化AppUser数据失败:', error);
  } finally {
    // 关闭数据库连接
    mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 处理进程退出
process.on('SIGINT', () => {
  mongoose.connection.close();
  console.log('\n数据库连接已关闭');
  process.exit(0);
}); 