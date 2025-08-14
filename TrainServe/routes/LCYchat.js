var express = require('express');
var router = express.Router();
const { ChatSession, Message } = require('../models/chat');
const AppUser = require('../models/AppUser');

// 引入新的混合查询系统
const HybridQuerySystem = require('../services/ai/HybridQuerySystem');
const { callQwenAPI, checkContentSafety } = require('../utils/aiService');

// 初始化混合查询系统
const hybridQuerySystem = new HybridQuerySystem();

// 生成会话ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 使用新的混合查询系统处理用户消息
async function processUserMessage(userMessage, userId, userRole, conversationHistory = []) {
  try {
    console.log('使用混合查询系统处理消息:', { userMessage, userId, userRole });
    
    // 调用混合查询系统
    const result = await hybridQuerySystem.processQuery(
      userMessage, 
      userId, 
      userRole, 
      conversationHistory
    );
    
    console.log('混合查询系统处理结果:', result);
    return result;
    
  } catch (error) {
    console.error('混合查询系统处理失败:', error);
    // 降级到简单的AI回复
    return {
      type: 'fallback',
      content: '抱歉，系统暂时无法处理您的请求，请稍后重试。',
      needsData: false
    };
  }
}

// 获取用户角色（简化实现，实际应该从数据库或JWT中获取）
async function getUserRole(userId) {
  try {
    // 这里应该根据实际业务逻辑获取用户角色
    // 暂时返回默认角色
    return 'user';
  } catch (error) {
    console.error('获取用户角色失败:', error);
    return 'user'; // 默认角色
  }
}

// 获取聊天历史记录
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, page = 1, limit = 10 } = req.query;
    
    console.log('获取历史记录请求:', { sessionId, userId, page, limit });

    const session = await ChatSession.findOne({ 
      sessionId: sessionId,
      userId: userId 
    }).populate('userId', 'username avatar');
    
    console.log('查询到的会话:', session);

    if (!session) {
      console.log('未找到会话，返回空消息数组');
      return res.json({
        success: true,
        data: {
          sessionId: sessionId,
          messages: [],
          hasMore: false,
          total: 0
        }
      });
    }

    // 计算分页
    const totalMessages = session.messages.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = totalMessages - (pageNum * limitNum); // 从最新消息开始，倒序分页
    
    let messages = [];
    let hasMore = false;
    
    if (skip <= 0) {
      // 获取所有消息（第一页或消息数量少于limit）
      messages = session.messages.slice(0, limitNum);
      hasMore = totalMessages > limitNum;
    } else {
      // 获取指定页的消息
      const startIndex = Math.max(0, skip);
      const endIndex = Math.max(0, skip + limitNum);
      messages = session.messages.slice(startIndex, endIndex);
      hasMore = startIndex > 0;
    }

    console.log('分页结果:', { 
      total: totalMessages, 
      currentPage: pageNum, 
      messagesCount: messages.length, 
      hasMore 
    });

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        messages: messages,
        hasMore: hasMore,
        total: totalMessages,
        currentPage: pageNum
      }
    });
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取聊天历史失败'
    });
  }
});

// 创建新的聊天会话
router.post('/session', async (req, res) => {
  try {
    const { userId } = req.body;
    const sessionId = generateSessionId();

    const session = new ChatSession({
      sessionId: sessionId,
      userId: userId,
      messages: []
    });

    await session.save();

    res.json({
      success: true,
      data: {
        sessionId: sessionId
      }
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    res.status(500).json({
      success: false,
      message: '创建会话失败'
    });
  }
});

// 发送消息
router.post('/send', async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;

    if (!sessionId || !userId || !message) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 内容审核
    console.log('开始内容审核:', message);
    const isContentSafe = await checkContentSafety(message);
    
    if (!isContentSafe) {
      console.log('内容审核未通过:', message);
      return res.json({
        success: false,
        message: '消息包含不当内容，请文明发言'
      });
    }

    console.log('内容审核通过，继续处理消息');

    // 查找会话
    let session = await ChatSession.findOne({ sessionId, userId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: '会话不存在，请先创建会话'
      });
    }

    // 添加用户消息
    const userMessage = {
      content: message,
      isUser: true,
      timestamp: new Date(),
      sessionId: sessionId
    };

    session.messages.push(userMessage);

    // 获取对话历史用于AI回复
    const conversationHistory = session.messages.slice(-10); // 最近10条消息

    // 获取用户角色
    const userRole = await getUserRole(userId);

    // 使用新的混合查询系统处理消息
    console.log('开始处理用户消息:', { message, userId, userRole });
    const aiResult = await processUserMessage(message, userId, userRole, conversationHistory);

    // 根据处理结果生成AI回复
    let aiResponse;
    if (aiResult.type === 'query' && aiResult.needsData) {
      // 数据库查询结果
      aiResponse = `基于数据库查询结果：\n\n${aiResult.content}\n\n查询类型：${aiResult.queryPlan?.queryType || 'unknown'}\n目标表：${aiResult.queryPlan?.targetTable || 'unknown'}`;
    } else if (aiResult.type === 'conversation') {
      // 简单对话回复
      aiResponse = aiResult.content;
    } else if (aiResult.type === 'fallback') {
      // 降级回复
      aiResponse = aiResult.content;
    } else {
      // 默认回复
      aiResponse = aiResult.content || '抱歉，我暂时无法理解您的问题，请稍后重试。';
    }

    // 添加AI回复
    const aiMessage = {
      content: aiResponse,
      isUser: false,
      timestamp: new Date(),
      sessionId: sessionId
    };

    session.messages.push(aiMessage);
    await session.save();

    res.json({
      success: true,
      data: {
        userMessage: userMessage,
        aiMessage: aiMessage
      }
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败'
    });
  }
});

// 获取用户的所有会话
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sessions = await ChatSession.find({ userId })
      .populate('userId', 'username avatar')
      .sort({ updatedAt: -1 })
      .select('sessionId createdAt updatedAt messages userId')
      .limit(20);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取会话列表失败'
    });
  }
});

// 删除会话
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;

    await ChatSession.findOneAndDelete({ 
      sessionId: sessionId,
      userId: userId 
    });

    res.json({
      success: true,
      message: '会话删除成功'
    });
  } catch (error) {
    console.error('删除会话失败:', error);
    res.status(500).json({
      success: false,
      message: '删除会话失败'
    });
  }
});

// 系统状态查询
router.get('/status', async (req, res) => {
  try {
    const systemStatus = hybridQuerySystem.getSystemStatus();
    
    res.json({
      success: true,
      data: {
        system: 'Hybrid Query System',
        status: systemStatus.status,
        modules: systemStatus.modules,
        timestamp: systemStatus.timestamp
      }
    });
  } catch (error) {
    console.error('获取系统状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统状态失败'
    });
  }
});

// 测试混合查询系统
router.post('/test', async (req, res) => {
  try {
    const { message, userId, userRole } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    console.log('测试混合查询系统:', { message, userId, userRole: userRole || 'user' });
    
    const result = await hybridQuerySystem.processQuery(
      message, 
      userId, 
      userRole || 'user', 
      []
    );

    res.json({
      success: true,
      data: {
        testMessage: message,
        result: result,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('测试混合查询系统失败:', error);
    res.status(500).json({
      success: false,
      message: '测试失败',
      error: error.message
    });
  }
});

module.exports = router;