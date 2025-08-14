const mongoose = require('../db/index');
const Schema = mongoose.Schema;

// 评论数据模型
const commentSchema = new Schema({
  // 关联的新闻ID（必选）
  newsId: {
    type: Schema.Types.ObjectId,
    ref: 'news',
    required: true,
    index: true
  },
  
  // 评论内容（必选）
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // 用户ID（关联AppUser）
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
    index: true
  },
  
  // 父评论ID（可选，用于回复功能）
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
    default: null,
    index: true
  },
  
  // 根评论ID（可选，用于标识同一楼层的评论）
  rootId: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
    default: null,
    index: true
  },
  
  // 回复的用户ID（可选，用于@功能）
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'comment',
    default: null
  },
  
  // 回复的用户名（可选）
  replyToAuthor: {
    type: String,
    trim: true
  },
  
  // 点赞数（可选，默认0）
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 回复数（可选，默认0）
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 楼层号（可选，用于显示楼层）
  floor: {
    type: Number,
    default: 1
  }
  
}, {
  // 自动添加创建时间和更新时间字段
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  // 集合名称
  collection: 'comments'
});

// 创建索引以优化查询性能
commentSchema.index({ newsId: 1, createdAt: -1 }); // 按新闻ID和时间排序
commentSchema.index({ parentId: 1, createdAt: 1 }); // 按父评论ID和时间排序
commentSchema.index({ rootId: 1, createdAt: 1 }); // 按根评论ID和时间排序

// 虚拟字段：是否为根评论
commentSchema.virtual('isRoot').get(function() {
  return !this.parentId;
});

// 虚拟字段：是否为回复
commentSchema.virtual('isReply').get(function() {
  return !!this.parentId;
});

let Comments = mongoose.model('comments', commentSchema, 'comments');

module.exports = { Comments }; 