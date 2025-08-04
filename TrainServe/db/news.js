const mongoose = require('./index');
const Schema = mongoose.Schema;

// 定义渲染类型的枚举值
const RENDER_TYPES = {
  TEXT_ONLY: 'TEXT_ONLY',       // 纯文字样式
  IMAGE_FULL: 'IMAGE_FULL',     // 大图图文样式
  IMAGE_RIGHT: 'IMAGE_RIGHT'    // 右侧小图/头像样式
};

// 新闻数据模型
const newsSchema = new Schema({
  // 标题（必选）
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // 用于标题搜索优化
  },
  
  // 渲染类型（必选，使用枚举约束）
  renderType: {
    type: String,
    required: true,
    enum: Object.values(RENDER_TYPES),
    index: true // 用于按类型筛选优化
  },
  
  // 标签数组（可选）
  tags: [{
    type: String,
    trim: true
  }],
  
  // 作者/来源（可选）
  author: {
    type: String,
    trim: true
  },
  
  // 发布时间（可选，默认使用创建时间）
  publishTime: {
    type: Date,
    default: Date.now,
    index: true // 用于按时间排序优化
  },
  
  // 点赞数（可选，默认0）
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 封面图（可选，根据renderType决定是否需要）
  coverImage: {
    type: String,
    trim: true
  },
  
  // 右侧小图/头像（可选，仅IMAGE_RIGHT类型使用）
  rightImage: {
    type: String,
    trim: true
  },
  
  // 详情页内容（必选）
  detailContent: {
    type: String,
    required: true
  },
  
  // 详情页额外图片（可选）
  detailImages: [{
    type: String,
    trim: true
  }]
  
}, {
  // 自动添加创建时间和更新时间字段
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  },
  // 集合名称
  collection: 'news'
});

// 创建索引以优化查询性能
newsSchema.index({ title: 'text', tags: 'text' }); // 全文搜索索引

let News = mongoose.model('news', newsSchema,'news');

// 导出模型和渲染类型枚举
module.exports = {
  News,
  RENDER_TYPES
};

