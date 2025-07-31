var express = require('express');
var router = express.Router();
const menjinModel = require('../models/menjin');


router.get('/list', async (req, res) => {
    const data = await menjinModel.find()
    res.send({
        code: 200,
        msg: '获取成功',
        data
    });
});

// 获取单个门禁设备详情
router.get('/detail/:id', async (req, res) => {
    const { id } = req.params;
    const data = await menjinModel.findById(id);
    if (!data) {
        return res.send({
            code: 404,
            msg: '设备不存在'
        })
    }
    return res.send({
        code: 200,
        msg: '获取成功',
        data: data
    });
});

// 添加门禁设备
router.post('/add', async (req, res) => {
    const data = req.body;
    const index = await menjinModel.findOne({ deviceNumber: data.deviceNumber });
    if (index) {
        return res.send({
            code: 400,
            msg: '设备编号已存在'
        })
    }
    const newData = await menjinModel.create(data);
    return res.send({
        code: 200,
        msg: '添加成功',
        data: newData
    });
});

// 修改门禁设备
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const upData = req.body;
    // 如果修改设备编号，检查是否与其他设备重复
    if (upData.deviceNumber) {
        const index = await menjinModel.findOne({
            deviceNumber: upData.deviceNumber,
            _id: { $ne: id }
        });
        if (index) {
            return res.send({
                code: 400,
                msg: '设备编号已存在'
            })
        }
    }
    const updatedData = await menjinModel.findByIdAndUpdate(
        id,
        { ...upData, updateTime: new Date() },
        { new: true, runValidators: true }
    );

    if (!updatedData) {
        return res.send({
            code: 404,
            msg: '设备不存在'
        });
    }
    return res.send({
        code: 200,
        msg: '修改成功',
        data: updatedData
    });
});

// 删除单个门禁设备
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    const deletedDevice = await menjinModel.findByIdAndDelete(id);
    if (!deletedDevice) {
        return res.send({
            code: 404,
            msg: '设备不存在'
        });
    }
    return res.send({
        code: 200,
        msg: '删除成功'
    });

});

// 批量删除门禁设备
router.delete('/batchDelete', async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.send({
            code: 400,
            msg: '请提供要删除的设备ID数组'
        });
    }

    const result = await menjinModel.deleteMany({
        _id: { $in: ids }
    });

    return res.send({
        code: 200,
        msg: `成功删除 ${result.deletedCount} 个设备`,
        deletedCount: result.deletedCount
    });
});


module.exports = router;



