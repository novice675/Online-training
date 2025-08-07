const mongoose = require('../db/index');

// App用户表
const appUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    comment: '用户名'
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    comment: '手机号码'
  },
  password: {
    type: String,
    required: true,
    comment: '密码'
  },
  nickname: {
    type: String,
    trim: true,
    comment: '昵称'
  },
  avatar: {
    type: String,
    trim: true,
    comment: '头像URL'
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
appUserSchema.pre('save', function(next) {
  this.updateTime = new Date();
  next();
});

appUserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updateTime: new Date() });
  next();
});


const AppUser = mongoose.model('AppUser', appUserSchema, 'appUser');

module.exports = AppUser;
