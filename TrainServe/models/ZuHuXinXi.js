const mongoose = require('../db/index');

// 租户信息模式
const zuHuXinXiSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true
  },
  louyu: {
    type: String,
    required: true,
    trim: true
  },
  fangjian: {
    type: String,
    required: true,
    trim: true
  },
  fuzerenName: {
    type: String,
    required: true,
    trim: true
  },
  lianxiFangshi: {
    type: String,
    required: true,
    trim: true
  },
  
  // 企业信息
  suoshuHangye: {
    type: String,
    required: true,
    trim: true
  },
  qiyeGuimo: {
    type: String,
    required: true,
    enum: ['小型', '中型', '大型', '特大型']
  },
  zhucezijin: {
    type: Number,
    required: false,
    min: 0
  },
  shifoGaoxin: {
    type: String,
    required: false,
    enum: ['是', '否'],
    default: '否'
  },
  shifouShangshi: {
    type: String,
    required: false,
    enum: ['是', '否'],
    default: '否'
  },
  qiyeGuzhi: {
    type: Number,
    required: false,
    min: 0
  },
  
  // 图片信息
  qiyeLogo: {
    type: String,
    required: false,
    trim: true
  },
  jiaFangTouXiang: {
    type: String,
    required: false,
    trim: true
  },
  
  // 负责人信息
  fuzeren: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    xingbie: {
      type: String,
      required: true,
      enum: ['男', '女']
    },
    lianxiFangshi: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // 合同信息 - 关联到合同表
  hetongId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeTong',
    default: null
  },
  hetongBianhao: {
    type: String,
    required: false,
    trim: true
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

const ZuHuXinXi = mongoose.model('ZuHuXinXi', zuHuXinXiSchema);

module.exports = ZuHuXinXi;
