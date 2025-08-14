const mongoose = require('mongoose');

// 评论模型
const pingSchema = new mongoose.Schema({
  // 评论内容
  content: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  
  // 评论者ID（关联用户表）
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true
  },
  
  // 关联的文章ID
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  
  // 父评论ID（用于构建评论树，支持无限嵌套）
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ping',
    default: null
  },
  
  // 回复的目标用户ID（用于显示"张三回复李四"）
  replyToUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    default: null
  },
  
  // 点赞数
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'Ping'
});

module.exports = mongoose.model('Ping', pingSchema, 'Ping'); 