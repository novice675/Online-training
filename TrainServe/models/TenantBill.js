const mongoose = require('../db/index');

// 租户账单模型
const TenantBillSchema = new mongoose.Schema({
  // 账单编号（自动生成，格式：TB + 年月日 + 4位序号，如TB202401010001）
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // 关联企业（租户基本信息）
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // 账单类型
  billType: {
    type: String,
    enum: ['水电费', '物业费'],
    required: true,
    default: '水电费'
  },
  
  // 账单开始时间
  startDate: {
    type: Date,
    required: true
  },
  
  // 账单结束时间（可选，某些账单类型可能不需要）
  endDate: {
    type: Date,
    required: false
  },
  
  // 单价（根据账单类型不同，可能是月租单价、水电单价等）
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 使用量（用量，如：面积、度数等）
  usage: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  
  // 账单金额（单价 * 使用量）
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 缴费状态
  paymentStatus: {
    type: String,
    enum: ['未缴费', '已缴费', '逾期'],
    default: '未缴费'
  },
  
  // 已缴费金额
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // 缴费时间
  paymentDate: {
    type: Date
  },
  
  // 到期时间
  dueDate: {
    type: Date,
    required: true
  },
  
  // 备注
  remarks: {
    type: String,
    trim: true
  },
  
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
TenantBillSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

TenantBillSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// 自动生成账单编号的静态方法
TenantBillSchema.statics.generateBillNumber = async function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `TB${year}${month}${day}`;
  
  // 查找今天已有的账单数量
  const count = await this.countDocuments({
    billNumber: { $regex: `^${datePrefix}` }
  });
  
  // 生成4位序号
  const sequence = String(count + 1).padStart(4, '0');
  return `${datePrefix}${sequence}`;
};

// 计算金额的虚拟属性
TenantBillSchema.virtual('calculatedAmount').get(function() {
  return this.unitPrice * this.usage;
});

// 计算剩余未缴费金额的虚拟属性
TenantBillSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - this.paidAmount);
});

// 创建索引优化查询
TenantBillSchema.index({ companyId: 1 });
TenantBillSchema.index({ billNumber: 1 });
TenantBillSchema.index({ paymentStatus: 1 });
TenantBillSchema.index({ dueDate: 1 });
TenantBillSchema.index({ createdAt: -1 });

const TenantBill = mongoose.model('TenantBill', TenantBillSchema,'TenantBill');

module.exports = TenantBill; 