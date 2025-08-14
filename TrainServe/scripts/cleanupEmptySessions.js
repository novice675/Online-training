const mongoose = require('mongoose');
const { ChatSession } = require('../models/chat');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/train_serve', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupEmptySessions() {
  try {
    console.log('开始清理空会话...');
    
    // 查找所有空会话（messages数组为空）
    const emptySessions = await ChatSession.find({ 
      $or: [
        { messages: { $exists: false } },
        { messages: { $size: 0 } }
      ]
    });
    
    console.log(`找到 ${emptySessions.length} 个空会话`);
    
    if (emptySessions.length > 0) {
      // 删除空会话
      const result = await ChatSession.deleteMany({
        $or: [
          { messages: { $exists: false } },
          { messages: { $size: 0 } }
        ]
      });
      
      console.log(`✅ 成功删除 ${result.deletedCount} 个空会话`);
    } else {
      console.log('没有找到空会话，无需清理');
    }
    
    // 显示剩余的会话统计
    const totalSessions = await ChatSession.countDocuments();
    const sessionsWithMessages = await ChatSession.countDocuments({
      messages: { $exists: true, $ne: [] }
    });
    
    console.log(`\n清理完成！`);
    console.log(`总会话数: ${totalSessions}`);
    console.log(`有消息的会话数: ${sessionsWithMessages}`);
    
  } catch (error) {
    console.error('清理失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 执行清理
cleanupEmptySessions(); 