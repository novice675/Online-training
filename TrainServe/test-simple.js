/**
 * 简单测试脚本
 * 用于逐步排查模块加载问题
 */

console.log('🚀 开始简单测试...\n');

// 测试1：检查配置文件
console.log('1️⃣ 测试配置文件...');
try {
  const config1 = require('./config/databaseSchema');
  console.log('✅ databaseSchema 加载成功');
} catch (error) {
  console.log('❌ databaseSchema 加载失败:', error.message);
}

try {
  const config2 = require('./config/aiPrompts');
  console.log('✅ aiPrompts 加载成功');
} catch (error) {
  console.log('❌ aiPrompts 加载失败:', error.message);
}

// 测试2：检查工具模块
console.log('\n2️⃣ 测试工具模块...');
try {
  const utils = require('./utils/aiService');
  console.log('✅ aiService 加载成功');
} catch (error) {
  console.log('❌ aiService 加载失败:', error.message);
}

try {
  const queryBuilder = require('./utils/queryBuilder');
  console.log('✅ queryBuilder 加载成功');
} catch (error) {
  console.log('❌ queryBuilder 加载失败:', error.message);
}

// 测试3：检查AI服务模块
console.log('\n3️⃣ 测试AI服务模块...');
try {
  const intentRecognizer = require('./services/ai/IntentRecognizer');
  console.log('✅ IntentRecognizer 加载成功');
} catch (error) {
  console.log('❌ IntentRecognizer 加载失败:', error.message);
}

try {
  const queryPlanner = require('./services/ai/QueryPlanner');
  console.log('✅ QueryPlanner 加载成功');
} catch (error) {
  console.log('❌ QueryPlanner 加载失败:', error.message);
}

console.log('\n🎉 简单测试完成！'); 