/**
 * 调试用户消息查询问题的脚本
 */

const mongoose = require('./db');
const { ChatSession, Message } = require('./models/chat');
const AppUser = require('./models/AppUser');

async function debugUserMessages() {
  console.log('🔍 开始调试用户消息查询问题...\n');
  
  const targetUserId = '689341ab4f2cd04e5f5a2692';
  
  try {
    // 1. 检查用户是否存在
    console.log('1️⃣ 检查用户是否存在...');
    const user = await AppUser.findById(targetUserId);
    if (user) {
      console.log('✅ 用户存在:', {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        phone: user.phone
      });
    } else {
      console.log('❌ 用户不存在');
      return;
    }
    
    // 2. 检查聊天会话
    console.log('\n2️⃣ 检查用户的聊天会话...');
    const sessions = await ChatSession.find({ userId: targetUserId });
    console.log(`找到 ${sessions.length} 个聊天会话`);
    
    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        console.log(`会话 ${index + 1}:`, {
          sessionId: session.sessionId,
          messageCount: session.messages.length,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        });
        
        // 显示前几条消息
        if (session.messages.length > 0) {
          console.log('  前3条消息:');
          session.messages.slice(0, 3).forEach((msg, msgIndex) => {
            console.log(`    ${msgIndex + 1}. ${msg.isUser ? '用户' : 'AI'}: ${msg.content.substring(0, 50)}...`);
          });
        }
      });
    }
    
    // 3. 检查消息总数
    console.log('\n3️⃣ 检查用户的消息总数...');
    let totalMessages = 0;
    sessions.forEach(session => {
      totalMessages += session.messages.length;
    });
    console.log(`用户总共有 ${totalMessages} 条消息`);
    
    // 4. 检查数据库连接状态
    console.log('\n4️⃣ 检查数据库连接状态...');
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.log(`数据库状态: ${statusMap[dbStatus]}`);
    
    // 5. 测试简单查询
    console.log('\n5️⃣ 测试简单查询...');
    try {
      const testQuery = await ChatSession.findOne({ userId: targetUserId }).limit(1);
      if (testQuery) {
        console.log('✅ 查询测试成功');
      } else {
        console.log('⚠️ 查询测试：没有找到会话');
      }
    } catch (queryError) {
      console.log('❌ 查询测试失败:', queryError.message);
    }
    
  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 运行调试
if (require.main === module) {
  debugUserMessages().then(() => {
    console.log('\n🎉 调试完成！');
    process.exit(0);
  }).catch(error => {
    console.error('调试失败:', error);
    process.exit(1);
  });
}

module.exports = { debugUserMessages }; 