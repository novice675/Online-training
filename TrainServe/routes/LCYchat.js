var express = require('express');
var router = express.Router();
const { ChatSession, Message } = require('../db/chat');
const axios = require('axios');

// 通义千问API配置
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
const QWEN_API_KEY = 'sk-4f71e382f5ed4c32a80041e645862980';

// 生成会话ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 调用通义千问API
async function callQwenAPI(userMessage, conversationHistory = []) {
  try {
    const messages = [
      {
        role: 'system',
        content: '你是一个智能客服助手，专门为用户提供帮助和解答问题。请用友好、专业的语气回答用户的问题。'
      },
      ...conversationHistory.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await axios.post(QWEN_API_URL, {
      model: 'qwen-turbo',
      input: {
        messages: messages
      },
      parameters: {
        temperature: 0.7,
        max_tokens: 1000
      }
    }, {
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.output.text;
  } catch (error) {
    console.error('通义千问API调用失败:', error);
    return '抱歉，我现在无法回答您的问题，请稍后再试。';
  }
}

// AI内容审核函数
async function checkContentSafety(message) {
  try {
    const auditPrompt = `请判断以下内容是否包含不当、违法、政治敏感或色情信息。请严格按照以下格式回答：
    
    内容：${message}
    
    请只回答"安全"或"不安全"，不要添加任何其他内容。`;
    
    const response = await axios.post(QWEN_API_URL, {
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个内容审核助手，专门判断内容是否安全。请严格按照要求回答。'
          },
          {
            role: 'user',
            content: auditPrompt
          }
        ]
      },
      parameters: {
        temperature: 0.1,
        max_tokens: 10
      }
    }, {
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.output.text.trim();
    console.log('内容审核结果:', result);
    
    return result === '安全';
  } catch (error) {
    console.error('内容审核API调用失败:', error);
    // 如果审核失败，默认允许发送（避免误杀）
    return true;
  }
}

// 获取聊天历史记录
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.query;
    
    console.log('获取历史记录请求:', { sessionId, userId });

    const session = await ChatSession.findOne({ 
      sessionId: sessionId,
      userId: userId 
    });
    
    console.log('查询到的会话:', session);

    if (!session) {
      console.log('未找到会话，返回空消息数组');
      return res.json({
        success: true,
        data: {
          sessionId: sessionId,
          messages: []
        }
      });
    }

    console.log('找到会话，消息数量:', session.messages.length);
    console.log('消息内容:', session.messages);

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        messages: session.messages
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

    // 查找或创建会话
    let session = await ChatSession.findOne({ sessionId, userId });
    
    if (!session) {
      session = new ChatSession({
        sessionId,
        userId,
        messages: []
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

    // 调用通义千问API获取回复
    const aiResponse = await callQwenAPI(message, conversationHistory);

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
      .sort({ updatedAt: -1 })
      .select('sessionId createdAt updatedAt messages')
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

module.exports = router;