const mongoose = require('mongoose');

// 智能门禁表
const menjinSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },                    // 设备名称
    bianhao: {
        type: String,
        required: true,
        unique: true
    },                    // 设备编号
    menModel: String,  // 设备型号
    status: {
        type: String,
        enum: ['正常', '离线', '报警', '禁用'],
        default: '正常'
    },                    // 运行状态
    Person: String, // 跟进人
    plone: String,    // 联系方式
    location: String, // 安装位置
    operationTime: {
        type: Date,
        default: Date.now
    },                  // 运行时间
    Image: String,     // 现场图片
    imgs: String,    // 设备图片
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