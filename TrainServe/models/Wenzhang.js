const mongoose = require('mongoose')


let WenzhangSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 20
  },
  cover: String,        
  channel: {
    type: String,
    enum: ['今日热点', '推荐']
  },
  type: {
    type: String,
    enum: ['图文', '视频', '音频']
  },
  keywords: String,     // 关键词，多个关键词用逗号分隔
  summary: {
    type: String,
    maxlength: 20
  },      // 文章简介
  content: String,                    // 文章正文内容
  status: {
    type: String,
    enum: ['草稿', '已发布', '已下线']
  },
  view_count: {
    type: Number,
    default: 0
  },                    // 阅读量
  like_count: {
    type: Number,
    default: 0
  },                    // 点赞数
  comment_count: {
    type: Number,
    default: 0
  },                    // 评论数
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },                    // 作者ID
  published_at: Date,   // 发布时间
  created_at: {
    type: Date,
    default: () => new Date()
  },                    // 创建时间
  updated_at: {
    type: Date,
    default: () => new Date()
  }                     // 更新时间
})

// 导出文章模型
module.exports = {
  Wenzhang: mongoose.model("Wenzhang", WenzhangSchema, "wenzhang") 
};
