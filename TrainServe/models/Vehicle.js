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
        enum: ['包月车', '临时车']
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
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
vehicleSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const VehicleModel = mongoose.model('Vehicle', vehicleSchema, 'Vehicle');

module.exports = VehicleModel; 