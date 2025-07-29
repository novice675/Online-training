const mongoose = require('mongoose');

// 建立数据库连接
mongoose.connect('mongodb://localhost:27017/rbac0').then(res => {
    console.log("连接成功");
}).catch(err => {
    console.log(err);
});

module.exports = mongoose;
