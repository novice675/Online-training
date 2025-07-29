const mongoose = require('../db/index');

// 角色表
const roleSchema = new mongoose.Schema({
    roleName: String,
});

const roleModel = mongoose.model('role', roleSchema, 'role');


module.exports = roleModel