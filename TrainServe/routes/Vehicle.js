const express = require('express');
const router = express.Router();
const VehiclesModel = require('../models/Vehicles');

// 获取车辆列表（带搜索和分页）
router.get('/list', async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            licensePlate = '',
            contactWay = '',
            vehicleType = '',
            exitTime = ''  // 新增exitTime参数
        } = req.query;

        // 构建查询条件
        const query = {};
        if (licensePlate) {
            query.licensePlate = new RegExp(licensePlate, 'i');
        }
        if (contactWay) {
            query.contactWay = new RegExp(contactWay, 'i');
        }
        if (vehicleType) {
            query.vehicleType = new RegExp(vehicleType, 'i');
        }

        // 添加exitTime筛选逻辑
        // 当exitTime存在时，筛选endTime在指定日期的记录
        if (exitTime) {
            const searchDate = new Date(exitTime);
            const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
            const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
            
            query.$or = [
                {
                    endTime: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                },
                {
                    startTime: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            ];
        }

        // 计算跳过的记录数
        const skip = (parseInt(page) - 1) * parseInt(pageSize);

        // 查询数据
        const [list, total] = await Promise.all([
            VehiclesModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(pageSize)),
            VehiclesModel.countDocuments(query)
        ]);

        res.send({
            code: 200,
            msg: '查询成功',
            data: {
                list,
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        res.send({
            code: 500,
            msg: '获取车辆列表失败',
            error: error.message
        });
    }
});

// 新增车辆
router.post('/add', async (req, res) => {
    try {
        const { ownerName, contactWay, licensePlate, vehicleModel, vehicleType, startTime, endTime } = req.body;
        // 验证必填字段
        if (!ownerName || !contactWay || !licensePlate || !VehiclesModel || !vehicleType || !startTime || !endTime) {
            return res.send({
                code: 400,
                msg: '请填写完整的车辆信息'
            });
        }
        // 检查车牌号是否已存在
        const existingVehicle = await VehiclesModel.findOne({ licensePlate });
        if (existingVehicle) {
            return res.send({
                code: 400,
                msg: '该车牌号已存在'
            });
        }

        // 创建新车辆记录
        const newVehicle = await VehiclesModel.create({
            ownerName,
            contactWay,
            licensePlate,
            vehicleModel,
            vehicleType,
            startTime: new Date(startTime),
            endTime: new Date(endTime)
        });
        res.send({
            code: 200,
            msg: '添加成功',
            data: newVehicle
        });
    } catch (error) {
        console.error('添加车辆失败:', error);
        res.send({
            code: 500,
            msg: '添加车辆失败',
            error: error.message
        });
    }
});

// 删除车辆
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedVehicle = await VehiclesModel.findByIdAndDelete(id);
        if (!deletedVehicle) {
            return res.send({
                code: 404,
                msg: '车辆记录不存在'
            });
        }
        res.send({
            code: 200,
            msg: '删除成功'
        });
    } catch (error) {
        console.error('删除车辆失败:', error);
        res.send({
            code: 500,
            msg: '删除车辆失败',
            error: error.message
        });
    }
});

// 批量删除车辆
router.delete('/batchDelete', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.send({
                code: 400,
                msg: '请选择要删除的车辆'
            });
        }

        const result = await VehiclesModel.deleteMany({ _id: { $in: ids } });
        res.send({
            code: 200,
            msg: `成功删除 ${result.deletedCount} 条记录`
        });
    } catch (error) {
        console.error('批量删除车辆失败:', error);
        res.send({
            code: 500,
            msg: '批量删除失败',
            error: error.message
        });
    }
});

// 更新车辆信息
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 如果更新车牌号，检查是否与其他车辆冲突
        if (updateData.licensePlate) {
            const existingVehicle = await VehiclesModel.findOne({
                licensePlate: updateData.licensePlate,
                _id: { $ne: id }
            });
            if (existingVehicle) {
                return res.send({
                    code: 400,
                    msg: '该车牌号已存在'
                });
            }
        }

        // 处理日期字段
        if (updateData.startTime) {
            updateData.startTime = new Date(updateData.startTime);
        }
        if (updateData.endTime) {
            updateData.endTime = new Date(updateData.endTime);
        }

        const updatedVehicle = await VehiclesModel.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedVehicle) {
            return res.send({
                code: 404,
                msg: '车辆记录不存在'
            });
        }

        res.send({
            code: 200,
            msg: '更新成功',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('更新车辆失败:', error);
        res.send({
            code: 500,
            msg: '更新车辆失败',
            error: error.message
        });
    }
});

// 根据ID获取车辆详情
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await VehiclesModel.findById(id);
        if (!vehicle) {
            return res.send({
                code: 404,
                msg: '车辆记录不存在'
            });
        }

        res.send({
            code: 200,
            msg: '查询成功',
            data: vehicle
        });
    } catch (error) {
        console.error('获取车辆详情失败:', error);
        res.send({
            code: 500,
            msg: '获取车辆详情失败',
            error: error.message
        });
    }
});

module.exports = router;
