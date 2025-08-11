const mongoose = require('mongoose');

// 合同管理模式
const HeTongSchema = new mongoose.Schema({
  // 合同编号
  he_bian: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // 合同属性
  shuxing: {
    type: String,
    required: true,
    enum: ['新签', '续签'],
    default: '新签'
  },

  // 签订时间
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // 结束时间
  endDate: {
    type: Date,
    required: true
  },
  
  // 签订人
  qianPeople: {
    type: String,
    required: true,
    trim: true
  },
  
  // 联系方式
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // 合同备注
  beizhu: {
    type: String,
    trim: true
  },
  
  // 创建时间
  created_at: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// 实例方法：检查合同是否即将到期
HeTongSchema.methods.isExpiringSoon = function(days = 30) {
  const now = new Date();
  const warningDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  // 合同还未到期，但在指定天数内会到期
  return this.end_date > now && this.end_date <= warningDate;
};

// 实例方法：获取合同状态
HeTongSchema.methods.getStatus = function() {
  const now = new Date();
  return this.end_date > now ? '生效中' : '已到期';
};

// 检查模型是否已存在，避免重复定义
let HeTong;
try {
  HeTong = mongoose.model('HeTong');
} catch (error) {
  HeTong = mongoose.model('HeTong', HeTongSchema, 'HeTong');
}

module.exports = { HeTong };
