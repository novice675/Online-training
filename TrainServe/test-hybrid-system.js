/**
 * 混合查询系统测试脚本
 * 用于验证系统各个模块是否正常工作
 */

const HybridQuerySystem = require('./services/ai/HybridQuerySystem');
const { callQwenAPI } = require('./utils/aiService');

async function testHybridSystem() {
  console.log('🚀 开始测试混合查询系统...\n');

  try {
    // 1. 测试AI服务工具
    console.log('1️⃣ 测试AI服务工具...');
    try {
      const aiStatus = await callQwenAPI('请回答"测试成功"');
      console.log('✅ AI服务工具测试成功:', aiStatus);
    } catch (error) {
      console.log('❌ AI服务工具测试失败:', error.message);
    }

    // 2. 测试混合查询系统
    console.log('\n2️⃣ 测试混合查询系统...');
    const hybridSystem = new HybridQuerySystem();
    
    // 测试系统状态
    const systemStatus = hybridSystem.getSystemStatus();
    console.log('✅ 系统状态:', systemStatus);

    // 3. 测试简单对话
    console.log('\n3️⃣ 测试简单对话...');
    try {
      const simpleResult = await hybridSystem.processQuery(
        '你好，请介绍一下你自己',
        'test_user_001',
        'user',
        []
      );
      console.log('✅ 简单对话测试成功:', {
        type: simpleResult.type,
        needsData: simpleResult.needsData,
        content: simpleResult.content?.substring(0, 100) + '...'
      });
    } catch (error) {
      console.log('❌ 简单对话测试失败:', error.message);
    }

    // 4. 测试数据库查询
    console.log('\n4️⃣ 测试数据库查询...');
    try {
      const queryResult = await hybridSystem.processQuery(
        '查询用户数量',
        'test_user_001',
        'user',
        []
      );
      console.log('✅ 数据库查询测试成功:', {
        type: queryResult.type,
        needsData: queryResult.needsData,
        hasData: !!queryResult.data,
        hasQueryPlan: !!queryResult.queryPlan
      });
    } catch (error) {
      console.log('❌ 数据库查询测试失败:', error.message);
    }

    // 5. 测试复杂查询
    console.log('\n5️⃣ 测试复杂查询...');
    try {
      const complexResult = await hybridSystem.processQuery(
        '统计楼宇信息，显示名称、地址和楼层数',
        'test_user_001',
        'user',
        []
      );
      console.log('✅ 复杂查询测试成功:', {
        type: complexResult.type,
        needsData: complexResult.needsData,
        hasData: !!complexResult.data,
        hasQueryPlan: !!complexResult.queryPlan
      });
    } catch (error) {
      console.log('❌ 复杂查询测试失败:', error.message);
    }

    console.log('\n🎉 混合查询系统测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  testHybridSystem().then(() => {
    console.log('\n测试脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testHybridSystem }; 