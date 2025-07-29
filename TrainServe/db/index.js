const mongoose = require('mongoose');

// 建立数据库连接
mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/test').then(res => {
    console.log("连接成功");
}).catch(err => {
    console.log(err);
});

module.exports = mongoose;