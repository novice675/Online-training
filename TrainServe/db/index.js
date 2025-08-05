const mongoose = require('mongoose');

// 建立数据库连接 - 使用本地MongoDB
mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining').then(res => {
    console.log("连接成功,端口号3008");
}).catch(err => {
    console.log("数据库连接失败:", err);
});

module.exports = mongoose;