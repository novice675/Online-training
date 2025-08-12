const mongoose = require('../db/index');
const Schema = mongoose.Schema;

// 定义渲染类型的枚举值
const RENDER_TYPES = {
  TEXT_ONLY: 'TEXT_ONLY',       // 纯文字样式
  IMAGE_FULL: 'IMAGE_FULL',     // 大图图文样式
  IMAGE_RIGHT: 'IMAGE_RIGHT'    // 右侧小图/头像样式
};


// 定义频道的枚举值
const CHANNELS = {
  RECOMMEND: '推荐',
  POLICY: '政策'
};

// 定义审核状态的枚举值
const STATUS_TYPES = {
  PENDING: '未审核',
  APPROVED: '审核成功',
  REJECTED: '审核失败'
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
  

  // 频道（必选，只能是推荐或政策）
  channel: {
    type: String,
    required: true,
    enum: Object.values(CHANNELS),
    index: true
  },
  
  // 关键词数组（可选）
  keywords: [{
    type: String,
    trim: true
  }],
  
  // 审核状态（必选，默认未审核）
  status: {
    type: String,
    required: true,
    enum: Object.values(STATUS_TYPES),
    default: STATUS_TYPES.PENDING,
    index: true
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
  

  // 作者ID（关联AppUser）
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true,
    index: true
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
newsSchema.index({ title: 'text', tags: 'text', keywords: 'text' }); // 全文搜索索引

// 添加复合索引优化优先级排序
newsSchema.index({ tags: 1, publishTime: -1, createdAt: -1 }); // 优化置顶/热点排序查询

let News = mongoose.model('news', newsSchema,'news');

// 导出模型和枚举
module.exports = {
  News,
  RENDER_TYPES,
  CHANNELS,
  STATUS_TYPES
};

