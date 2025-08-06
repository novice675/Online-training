const mongoose = require('../db/index');

// 租户信息模式
const zuHuXinXiSchema = new mongoose.Schema({
  // 关联企业表
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // 关联人员表 - 负责人信息
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: false
  },
  
  // 合同信息 - 关联到合同表
  hetongId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeTong',
    default: null
  },
  
  // 状态信息
  status: {
    type: String,
    required: true,
    enum: ['正常', '暂停', '终止'],
    default: '正常'
  },
  
  // 创建和更新时间
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件  
zuHuXinXiSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

zuHuXinXiSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// 虚拟字段 - 从关联表获取数据
zuHuXinXiSchema.virtual('company', {
  ref: 'Company',
  localField: 'companyId',
  foreignField: '_id',
  justOne: true
});

zuHuXinXiSchema.virtual('employee', {
  ref: 'Employee',
  localField: 'employeeId',
  foreignField: '_id',
  justOne: true
});

// 确保虚拟字段在JSON序列化时包含
zuHuXinXiSchema.set('toJSON', { virtuals: true });
zuHuXinXiSchema.set('toObject', { virtuals: true });

const ZuHuXinXi = mongoose.model('ZuHuXinXi', zuHuXinXiSchema);

module.exports = ZuHuXinXi;
