const mongoose = require('../db/index');

// 房间
const HouseSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // 房间号
    number: {
        type: String,
        required: true,
        trim: true
    },
    
    // 楼层
    floor: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value !== 0; // 楼层不能为0
            },
            message: '楼层不能为0'
        }
    },
    
    // 关联楼栋
    buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true
    },
    
    // 房间面积
    area: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 计价面积
    pricingArea: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 租金金额
    rent: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 物业费用
    propertyFee: {
        type: Number,
        required: true,
        min: 0
    },
    
    // 押金金额
    deposit: {
        type: Number,
        required: false,
        min: 0,
        default: 0
    },
    
    // 房间状态
    status: {
        type: String,
        enum: ['空闲', '已租', '维修'],
        default: '空闲'
    },
    
    // 房间描述
    description: {
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
});

// 更新时间中间件
HouseSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

HouseSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updated_at: new Date() });
    next();
});

// 验证楼层不超过楼宇的地上层数
HouseSchema.pre('save', async function(next) {
    try {
        if (this.isModified('floor') || this.isModified('buildingId')) {
            const BuildingModel = mongoose.model('Building');
            const building = await BuildingModel.findById(this.buildingId);
            
            if (!building) {
                return next(new Error('楼宇不存在'));
            }
            
            // 验证地上楼层
            if (this.floor > 0 && this.floor > building.aboveGroundFloors) {
                return next(new Error(`地上楼层不能超过${building.aboveGroundFloors}层`));
            }
            
            // 验证地下楼层
            if (this.floor < 0 && Math.abs(this.floor) > building.undergroundFloors) {
                return next(new Error(`地下楼层不能超过${building.undergroundFloors}层`));
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// 更新时也验证楼层
HouseSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        if (update.floor || update.buildingId) {
            const BuildingModel = mongoose.model('Building');
            const buildingId = update.buildingId || this._conditions.buildingId;
            const floor = update.floor || this._conditions.floor;
            
            if (buildingId && floor) {
                const building = await BuildingModel.findById(buildingId);
                
                if (!building) {
                    return next(new Error('楼宇不存在'));
                }
                
                // 验证地上楼层
                if (floor > 0 && floor > building.aboveGroundFloors) {
                    return next(new Error(`地上楼层不能超过${building.aboveGroundFloors}层`));
                }
                
                // 验证地下楼层
                if (floor < 0 && Math.abs(floor) > building.undergroundFloors) {
                    return next(new Error(`地下楼层不能超过${building.undergroundFloors}层`));
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

// 创建复合索引，确保同一楼宇内房间号唯一
HouseSchema.index({ buildingId: 1, number: 1 }, { unique: true });

// 检查模型是否已存在，避免重复定义
let HouseModel;
try {
  HouseModel = mongoose.model('House');
} catch (error) {
  HouseModel = mongoose.model('House', HouseSchema, 'House');
}

module.exports = HouseModel;
