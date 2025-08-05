const mongoose = require('../db/index');

// 车辆信息表
const vehicleSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true
    },
    contactWay: {
        type: String,
        required: true
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true,
        enum: ['包月车', '临时车', '周区车']
    },
    startTime: {
        type: mongoose.Schema.Types.Mixed,  // 修改为Mixed类型，支持字符串和Date
        required: true
    },
    endTime: {
        type: mongoose.Schema.Types.Mixed,  // 修改为Mixed类型，支持字符串和Date
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间中间件
vehicleSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// 尝试不同的集合名称
const VehicleModel = mongoose.model('Vehicles', vehicleSchema, 'Vehicles');

module.exports = VehicleModel; 