/**
 * 配置文件测试脚本
 * 用于验证配置文件是否能正确加载
 */

console.log('🚀 开始测试配置文件加载...\n');

try {
  // 测试数据库模式配置
  console.log('1️⃣ 测试数据库模式配置...');
  const { databaseSchema, queryTypes, permissionLevels } = require('./config/databaseSchema');
  console.log('✅ 数据库模式配置加载成功');
  console.log('   - 表数量:', Object.keys(databaseSchema).length);
  console.log('   - 查询类型:', Object.keys(queryTypes));
  console.log('   - 权限级别:', Object.keys(permissionLevels));
} catch (error) {
  console.log('❌ 数据库模式配置加载失败:', error.message);
}

try {
  // 测试AI提示词配置
  console.log('\n2️⃣ 测试AI提示词配置...');
  const { aiPrompts, queryTemplates } = require('./config/aiPrompts');
  console.log('✅ AI提示词配置加载成功');
  console.log('   - 提示词数量:', Object.keys(aiPrompts).length);
  console.log('   - 模板数量:', Object.keys(queryTemplates).length);
} catch (error) {
  console.log('❌ AI提示词配置加载失败:', error.message);
}

console.log('\n🎉 配置文件测试完成！'); 