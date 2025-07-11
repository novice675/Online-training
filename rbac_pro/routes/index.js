var express = require('express');
var router = express.Router();
const { userModel, roleModel, PermissionModel } = require('../db/index')

router.post('/login', async (req, res) => {
    let user = await userModel.findOne(req.body);
    if (!user) {
        res.send({
            code: 500,
            msg: '用户名或密码错误'
        })
        return
    }
    try {
        // 获取用户所有角色名称
        const roles = await roleModel.find({ _id: { $in: user.roles } });
        const roleName = roles.map(t => t.roleName);

        // 根据角色名称获取相关权限
        const auths = await PermissionModel.find({
            roleId: { $in: roles.map(t => t._id) }
        });
        res.send({
            code: 200,
            msg: "登录成功",
            data: {
                username: user.username,
                roleName,
                menuPermissions: [...new Set(auths.flatMap(t => t.menuPermissions))],
                buttonPermissions: [...new Set(auths.flatMap(t => t.buttonPermissions))],
            }
        });
    } catch (error) {
        console.error('获取角色信息失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});
module.exports = router;