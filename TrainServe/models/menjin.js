const mongoose = require('mongoose');

// 智能门禁表
const menjinSchema = new mongoose.Schema({
    deviceName: {
        type: String,
        required: true
    },                    // 设备名称
    deviceNumber: {
        type: String,
        required: true,
        unique: true
    },                    // 设备编号
    deviceModel: String,  // 设备型号
    runningStatus: {
        type: String,
        enum: ['正常', '故障', '维护中', '离线'],
        default: '正常'
    },                    // 运行状态
    followUpPerson: String, // 跟进人
    contactInfo: String,    // 联系方式
    installLocation: String, // 安装位置
    sceneImage: String,     // 现场图片
    deviceImage: String,    // 设备图片
    createTime: {
        type: Date,
        default: Date.now
    },                      // 创建时间
    updateTime: {
        type: Date,
        default: Date.now
    }                       // 更新时间
});

// 更新时间中间件
menjinSchema.pre('save', function(next) {
    this.updateTime = new Date();
    next();
});

const menjinModel = mongoose.model('Menjin', menjinSchema, 'menjin');

module.exports = menjinModel; 