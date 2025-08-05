const mongoose = require('mongoose');

const keHuSchema = new mongoose.Schema({
  // 客户基本信息
  name: {
    type: String,
    required: true,
    trim: true,
    comment: '客户名称'
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    comment: '联系方式'
  },
  level: {
    type: String,
    required: true,
    enum: ['一级', '二级'],
    comment: '客户等级'
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    comment: '所属行业'
  },
  status: {
    type: String,
    required: true,
    enum: ['成交', '意向'],
    comment: '跟进状态'
  },
  followPerson: {
    type: String,
    required: true,
    trim: true,
    comment: '跟进人'
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true,
    comment: '跟进人联系方式'
  },
  
  // 客户需求信息
  requiredAreaMin: {
    type: Number,
    comment: '需求面积最小值(平方米)'
  },
  requiredAreaMax: {
    type: Number,
    comment: '需求面积最大值(平方米)'
  },
  budgetMin: {
    type: Number,
    comment: '预算价格最小值(元/月)'
  },
  budgetMax: {
    type: Number,
    comment: '预算价格最大值(元/月)'
  },
  purpose: {
    type: String,
    trim: true,
    comment: '租户用途'
  },
  interestedProperty: {
    type: String,
    trim: true,
    comment: '意向房源名称'
  },
  
  // 备注信息
  remarks: {
    type: String,
    trim: true,
    comment: '备注'
  },
  
  // 时间戳
  createTime: {
    type: Date,
    default: Date.now,
    comment: '创建时间'
  },
  updateTime: {
    type: Date,
    default: Date.now,
    comment: '更新时间'
  }
}, {
  timestamps: true,
  versionKey: false
});

// 更新时间中间件
keHuSchema.pre('save', function(next) {
  this.updateTime = new Date();
  next();
});

keHuSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updateTime: new Date() });
  next();
});

const KeHu = mongoose.model('KeHu', keHuSchema,'kehu');

module.exports = KeHu;
