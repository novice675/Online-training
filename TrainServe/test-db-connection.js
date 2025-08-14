/**
 * 测试数据库连接脚本
 * 用于验证数据库连接是否正常
 */

console.log('🚀 开始测试数据库连接...\n');

// 1. 测试数据库连接
console.log('1️⃣ 测试数据库连接...');
try {
  const mongoose = require('./db');
  console.log('✅ 数据库连接模块加载成功');
  
  // 等待连接建立
  setTimeout(async () => {
    try {
      const status = mongoose.connection.readyState;
      const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      
      console.log('数据库连接状态:', statusMap[status]);
      console.log('数据库名称:', mongoose.connection.name);
      console.log('主机:', mongoose.connection.host);
      console.log('端口:', mongoose.connection.port);
      
      if (status === 1) {
        console.log('✅ 数据库连接成功！');
      } else {
        console.log('⚠️ 数据库连接状态:', statusMap[status]);
      }
    } catch (error) {
      console.log('❌ 检查连接状态失败:', error.message);
    }
  }, 2000);
  
} catch (error) {
  console.log('❌ 数据库连接模块加载失败:', error.message);
}

// 2. 测试模型加载
console.log('\n2️⃣ 测试模型加载...');
setTimeout(async () => {
  try {
    const DatabaseConnector = require('./services/database/DatabaseConnector');
    const dbConnector = new DatabaseConnector();
    
    console.log('✅ 数据库连接器初始化成功');
    
    // 测试健康检查
    const health = await dbConnector.healthCheck();
    console.log('数据库健康状态:', health);
    
  } catch (error) {
    console.log('❌ 数据库连接器初始化失败:', error.message);
  }
}, 3000);

console.log('\n⏳ 等待数据库连接建立...');
console.log('请等待几秒钟让连接完成...'); 