const mongoose = require('mongoose');

// 权限表
const PermissionSchema = new mongoose.Schema({
    menuPermissions: [String],
    buttonPermissions: [String],
    roleId: {
        type: mongoose.Types.ObjectId,
        ref: 'role',
    },
});


const PermissionModel = mongoose.model('Permissions', PermissionSchema, 'Permissions');

module.exports = PermissionModel
