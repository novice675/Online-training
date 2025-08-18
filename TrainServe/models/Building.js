const mongoose = require('../db/index');

// 楼宇
const BuildingSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // 楼宇名称
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    // 物业费
    propertyFee: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 建筑面积
    buildingArea: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 楼宇描述
    description: {
        type: String,
        trim: true
    },
    
    // 在管面积
    managedArea: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 楼宇照片
    photo: {
        type: String,
        trim: true
    },
    
    // 楼宇地址
    address: {
        type: String,
        required: true,
        trim: true
    },

    
    // 总层数
    floors: {
        type: Number,
        required: true,
        min: 1
    },
    
    // 地上楼层
    aboveGroundFloors: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 地上楼层面积
    aboveGroundArea: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 地下楼层
    undergroundFloors: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 地下楼层面积
    undergroundArea: {
        type: Number,
        required: true,
        min: 0
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
});

// 更新时间中间件
BuildingSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

BuildingSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updated_at: new Date() });
    next();
});

// 检查模型是否已存在，避免重复定义
let BuildingModel;
try {
  BuildingModel = mongoose.model('Building');
} catch (error) {
  BuildingModel = mongoose.model('Building', BuildingSchema, 'Building');
}

module.exports = BuildingModel;