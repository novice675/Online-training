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
  inaddress: String,   // 所属楼宇
  type: String,        // 企业类型
  logo: String,        // 企业 logo
  house: String,       // 房间号或楼号
  outaddress: String,  // 企业所再地址
  // 新增外键字段，用于规范化数据结构
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
  },
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
  }
})

// 中间件：当企业保存时，自动更新房间状态
CompanySchema.pre('save', async function(next) {
  try {
    const HouseModel = mongoose.model('House');
    
    // 如果是新企业或者房间ID发生了变化
    if (this.isNew || this.isModified('houseId')) {
      // 如果原来有房间，先将原房间设为空闲
      if (!this.isNew && this.isModified('houseId')) {
        const originalCompany = await mongoose.model('Company').findById(this._id);
        if (originalCompany && originalCompany.houseId) {
          await HouseModel.findByIdAndUpdate(originalCompany.houseId, { status: '空闲' });
        }
      }
      
      // 如果有新的房间ID，将新房间设为已租
      if (this.houseId) {
        await HouseModel.findByIdAndUpdate(this.houseId, { status: '已租' });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// 中间件：当企业被删除时，自动将房间状态设为空闲
CompanySchema.pre('remove', async function(next) {
  try {
    if (this.houseId) {
      const HouseModel = mongoose.model('House');
      await HouseModel.findByIdAndUpdate(this.houseId, { status: '空闲' });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// 中间件：当企业被findOneAndDelete删除时，也要更新房间状态
CompanySchema.pre('findOneAndDelete', async function(next) {
  try {
    const company = await this.model.findOne(this.getFilter());
    if (company && company.houseId) {
      const HouseModel = mongoose.model('House');
      await HouseModel.findByIdAndUpdate(company.houseId, { status: '空闲' });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// 中间件：当企业被updateOne/findOneAndUpdate更新时，处理房间状态
CompanySchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    
    // 如果更新中包含houseId字段
    if (update.houseId !== undefined || update.$set?.houseId !== undefined) {
      const HouseModel = mongoose.model('House');
      const newHouseId = update.houseId || update.$set?.houseId;
      
      // 获取原企业数据
      const originalCompany = await this.model.findOne(this.getFilter());
      
      if (originalCompany) {
        // 如果原来有房间，设为空闲
        if (originalCompany.houseId) {
          await HouseModel.findByIdAndUpdate(originalCompany.houseId, { status: '空闲' });
        }
        
        // 如果有新房间，设为已租
        if (newHouseId) {
          await HouseModel.findByIdAndUpdate(newHouseId, { status: '已租' });
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * 人员表 Person·
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
  picture: String,   // 人脸照片
  role:{
    type:"String",
    default:"员工"
  }
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
  cartype: String,   // 车辆类型
  role:{
    type:"String",
    default:"访客"
  }
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
    zan: {
      type:Number,
      default:123
    },       // 点赞数
    eye: {
      type:Number,
      default:123
    },       // 浏览数
    star: {
      type:Number,
      default:123
    },      // 收藏数
    time: {
      type:Date,
      default:()=>new Date()
    },        // 发布时间
    type: String       // 身份类型，'员工' 或 '访客'
  })

let CommentSchema=new mongoose.Schema({
  moment_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Moment'  //动态的id
  },
  time:{
    type:Date,
    default:()=>new Date()
  },
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    required:true
  },
  content:String,
  pid:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Comment',
    default:null
  },    //评论上级的id
  type:String //发布评论的人的role
})
  

// 导出三个模型
module.exports = {
  Company: mongoose.model("Company", CompanySchema, "company"), // 集合名固定为 company
  Employee: mongoose.model("Employee", EmployeeSchema, "employee"), // 集合名固定为 employee
  Visitor: mongoose.model("Visitor", VisitorSchema, "visitor"), // 集合名固定为 visitor
  Moment: mongoose.model("Moment", MomentSchema, "moment"),
  Comment: mongoose.model("Comment", CommentSchema, "comment"),
};
