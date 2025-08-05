const mongoose = require('mongoose');

// 建立数据库连接 - 使用本地MongoDB
mongoose.connect('mongodb://localhost:27017/OnlineTraining', {
    // 移除已弃用的选项
}).then(res => {
    console.log("连接成功,端口号3008");
}).catch(err => {
    console.log("数据库连接失败:", err);
    // 如果本地连接失败，尝试Atlas连接
    console.log("尝试连接Atlas数据库...");
    return mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining');
});

module.exports = mongoose;