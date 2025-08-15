const mongoose = require('./db/index');

// 测试数据库连接
async function testConnection() {
  try {
    // 等待连接
    await mongoose.connection.asPromise();
    console.log('数据库连接成功');
    
    // 测试查询
    const Vehicle = require('./models/Vehicle');
    const count = await Vehicle.countDocuments();
    console.log('车辆表记录数:', count);
    
    process.exit(0);
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

testConnection(); 