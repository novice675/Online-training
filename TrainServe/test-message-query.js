/**
 * 测试消息查询功能的脚本
 */

const HybridQuerySystem = require('./services/ai/HybridQuerySystem');

async function testMessageQuery() {
  console.log('🚀 开始测试消息查询功能...\n');

  try {
    const hybridSystem = new HybridQuerySystem();
    
    // 测试查询用户消息
    console.log('1️⃣ 测试查询用户消息...');
    const messageQuery = await hybridSystem.processQuery(
      '查询用户ID为689341ab4f2cd04e5f5a2692的消息',
      'test_user_001',
      'user',
      []
    );
    
    console.log('查询结果:', {
      type: messageQuery.type,
      needsData: messageQuery.needsData,
      hasData: !!messageQuery.data,
      hasQueryPlan: !!messageQuery.queryPlan,
      content: messageQuery.content?.substring(0, 200) + '...'
    });
    
    if (messageQuery.queryPlan) {
      console.log('\n查询计划详情:');
      console.log('- 目标表:', messageQuery.queryPlan.targetTable);
      console.log('- 查询类型:', messageQuery.queryPlan.queryType);
      console.log('- 查询条件:', messageQuery.queryPlan.conditions);
    }
    
    console.log('\n🎉 消息查询测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  testMessageQuery().then(() => {
    console.log('\n测试脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testMessageQuery }; 