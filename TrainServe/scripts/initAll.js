const initBuilding = require('./initBuilding');
const initHouse = require('./initHouse');
const initHeTong = require('./initHeTong');

/**
 * 主初始化脚本
 * 按顺序初始化楼宇、房间、合同数据
 */
async function initAll() {
  console.log('🚀 开始完整初始化流程...\n');
  
  try {
    // 1. 初始化楼宇
    console.log('='.repeat(50));
    console.log('第一步：初始化楼宇数据');
    console.log('='.repeat(50));
    await initBuilding();
    
    // 2. 初始化房间
    console.log('\n' + '='.repeat(50));
    console.log('第二步：初始化房间数据');
    console.log('='.repeat(50));
    await initHouse();
    
    // 3. 初始化合同
    console.log('\n' + '='.repeat(50));
    console.log('第三步：初始化合同数据');
    console.log('='.repeat(50));
    await initHeTong();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 所有数据初始化完成！');
    console.log('='.repeat(50));
    console.log('✓ 楼宇数据已创建');
    console.log('✓ 房间数据已创建');
    console.log('✓ 合同数据已创建');
    console.log('✓ 房间状态已更新');
    console.log('\n💡 提示：现在您可以运行租户信息初始化脚本了');
    
  } catch (error) {
    console.error('\n❌ 初始化过程中出现错误:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initAll()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化失败:', error);
      process.exit(1);
    });
}

module.exports = initAll; 