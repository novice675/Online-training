const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/rbac0').then(res => {
    console.log("连接成功");
}).catch(err => {
    console.log(err);
})
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

// 角色表
const roleSchema = new mongoose.Schema({
    roleName: String,
});
// 权限表
const PermissionSchema = new mongoose.Schema({
    menuPermissions:[String],
    buttonPermissions:[String],
    roleId:{
        type:mongoose.Types.ObjectId,
        ref:'role',
    },
});


// 模型导出
const userModel = mongoose.model('user', userSchema, 'user');
const roleModel = mongoose.model('role', roleSchema, 'role');
const PermissionModel = mongoose.model('Permissions', PermissionSchema, 'Permissions');

module.exports = {
    userModel,
    roleModel,
    PermissionModel
}