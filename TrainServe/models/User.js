const mongoose = require('mongoose');

// 用户表
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    roles: [{
        type: mongoose.Types.ObjectId,
        ref: 'role',
    }]
});

const userModel = mongoose.model('user', userSchema, 'user')

module.exports = userModel