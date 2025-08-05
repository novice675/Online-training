const mongoose = require('../db/index');

// 聊天消息模式
const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  isUser: {
    type: Boolean,
    required: true,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: true
  }
});

// 聊天会话模式
const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新updatedAt字段
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 创建索引
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ createdAt: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = {
  ChatSession,
  Message
}; 