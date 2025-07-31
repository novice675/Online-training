// 引入 mongoose
const mongoose = require('mongoose')

/**
 * 企业表 Company
 */
let CompanySchema = new mongoose.Schema({
  name: {
    type: String,      // 企业名称，唯一
    unique: true
  },
  inaddress: String,   // 入驻地址
  type: String,        // 企业类型
  logo: String,        // 企业 logo
  house: String,       // 房间号或楼号
  outaddress: String   // 企业所再地址
})

/**
 * 人员表 Person
 */
let EmployeeSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,  // 所属企业 _id
    ref: 'Company'                         // 关联 Company 表
  },
  name: String,     // 姓名
  sex: String,      // 性别
  phone: String,    // 手机号
  sfz: String,      // 身份证号
  email: String,    // 邮箱
  weixin: String,   // 微信号
  picture: String   // 人脸照片
})

//  * 访客表 Visitor
let VisitorSchema = new mongoose.Schema({
  name: String,     // 访客姓名
  phone: String,    // 手机号
  sfz: String,      // 身份证号
  picture: String,  // 人脸照片地址
  company_id: {
    type: mongoose.Schema.Types.ObjectId,  // 要访问的企业 _id
    ref: 'Company'                         // 关联 Company 表
  },
  time: Date,       // 到访时间
  carcode: String,  // 车牌号
  cartype: String   // 车辆类型
})

/**
 * 圈子表 moment（动态）
 */
let MomentSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,  // 发布人 _id（可能来自 employee 或 visitor）
      required: true
    },
    title: String,     // 标题
    content: [String],     // 图片数组，存储图片 URL 列表
    zan: Number,       // 点赞数
    eye: Number,       // 浏览数
    star: Number,      // 收藏数
    time: Date,        // 发布时间
    type: String       // 身份类型，'employee' 或 'visitor'
  })
  

// 导出三个模型
module.exports = {
    Company: mongoose.model('Company', CompanySchema, 'company'),         // 集合名固定为 company
    Employee: mongoose.model('Employee', EmployeeSchema, 'employee'),          // 集合名固定为 employee
    Visitor: mongoose.model('Visitor', VisitorSchema, 'visitor')  ,       // 集合名固定为 visitor
    Moment:mongoose.model('Moment', MomentSchema, 'moment')
  }
