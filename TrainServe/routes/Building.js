var express = require('express');
var router = express.Router();
const BuildingModel = require('../models/Building')

// 获取楼宇列表
router.get('/', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, name } = req.query;
        
        // 构建查询条件
        let query = {};
        if (name && name.trim()) {
            query.name = { $regex: name.trim(), $options: 'i' }; // 不区分大小写的模糊搜索
        }
        
        // 分页参数
        const limit = parseInt(pageSize);
        const skip = (parseInt(page) - 1) * limit;
        
        // 查询数据
        const buildings = await BuildingModel.find(query)
            .sort({ created_at: -1 })
            .limit(limit)
            .skip(skip);
            
        // 获取总数
        const total = await BuildingModel.countDocuments(query);
        
        res.send({
            code: 200,
            data: buildings,
            total: total,
            page: parseInt(page),
            pageSize: limit
        });
    } catch (error) {
        console.error('获取楼宇列表失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});

// 获取楼宇详情
router.get('/detail/:id', async (req, res) => {
    try {
        let building = await BuildingModel.findById(req.params.id);
        if (!building) {
            return res.send({
                code: 404,
                msg: '楼宇不存在'
            });
        }
        res.send({
            code: 200,
            data: building,
        });
    } catch (error) {
        console.error('获取楼宇详情失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});

// 添加楼宇
router.post('/add', async (req, res) => {
    try {
        // 验证必填字段
        const { name, address, aboveGroundFloors, undergroundFloors } = req.body;
        
        if (!name || !address) {
            return res.send({
                code: 400,
                msg: '楼宇名称和地址不能为空'
            });
        }
        
        if (!aboveGroundFloors || aboveGroundFloors < 1) {
            return res.send({
                code: 400,
                msg: '地上楼层数必须大于0'
            });
        }
        
        if (undergroundFloors && undergroundFloors < 0) {
            return res.send({
                code: 400,
                msg: '地下楼层数不能为负数'
            });
        }
        
        // 检查楼宇名称是否已存在
        const existingBuilding = await BuildingModel.findOne({ name: name });
        if (existingBuilding) {
            return res.send({
                code: 400,
                msg: '楼宇名称已存在'
            });
        }
        
        // 自动计算总层数
        const floors = (aboveGroundFloors || 0) + (undergroundFloors || 0);
        const buildingData = {
            ...req.body,
            floors
        };
        
        let building = await BuildingModel.create(buildingData);
        res.send({
            code: 200,
            msg: '添加成功',
            data: building
        });
    } catch (error) {
        console.error('添加楼宇失败:', error);
        
        // 处理Mongoose验证错误
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.send({
                code: 400,
                msg: messages.join(', ')
            });
        }
        
        // 处理唯一索引错误
        if (error.code === 11000) {
            return res.send({
                code: 400,
                msg: '楼宇名称已存在'
            });
        }
        
        res.send({
            code: 500,
            msg: '添加失败'
        });
    }
});

// 更新楼宇
router.put('/update/:id', async (req, res) => {
    try {
        // 验证楼层数据
        if (req.body.aboveGroundFloors && req.body.aboveGroundFloors < 1) {
            return res.send({
                code: 400,
                msg: '地上楼层数必须大于0'
            });
        }
        
        if (req.body.undergroundFloors && req.body.undergroundFloors < 0) {
            return res.send({
                code: 400,
                msg: '地下楼层数不能为负数'
            });
        }
        
        // 检查楼宇名称是否与其他楼宇重复
        if (req.body.name) {
            const existingBuilding = await BuildingModel.findOne({ 
                name: req.body.name, 
                _id: { $ne: req.params.id } 
            });
            if (existingBuilding) {
                return res.send({
                    code: 400,
                    msg: '楼宇名称已存在'
                });
            }
        }
        
        // 获取当前楼宇数据以计算总层数
        const currentBuilding = await BuildingModel.findById(req.params.id);
        if (!currentBuilding) {
            return res.send({
                code: 404,
                msg: '楼宇不存在'
            });
        }
        
        // 自动计算总层数
        const aboveGroundFloors = req.body.aboveGroundFloors !== undefined ? req.body.aboveGroundFloors : currentBuilding.aboveGroundFloors;
        const undergroundFloors = req.body.undergroundFloors !== undefined ? req.body.undergroundFloors : currentBuilding.undergroundFloors;
        const floors = (aboveGroundFloors || 0) + (undergroundFloors || 0);
        
        const updateData = {
            ...req.body,
            floors
        };
        
        let building = await BuildingModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!building) {
            return res.send({
                code: 404,
                msg: '楼宇不存在'
            });
        }
        res.send({
            code: 200,
            msg: '更新成功',
            data: building
        });
    } catch (error) {
        console.error('更新楼宇失败:', error);
        
        // 处理Mongoose验证错误
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.send({
                code: 400,
                msg: messages.join(', ')
            });
        }
        
        // 处理唯一索引错误
        if (error.code === 11000) {
            return res.send({
                code: 400,
                msg: '楼宇名称已存在'
            });
        }
        
        res.send({
            code: 500,
            msg: '更新失败'
        });
    }
});

// 删除楼宇
router.delete('/delete/:id', async (req, res) => {
    try {
        // 检查楼宇下是否还有房间
        const HouseModel = require('../models/House');
        const housesCount = await HouseModel.countDocuments({ buildingId: req.params.id });
        
        if (housesCount > 0) {
            return res.send({
                code: 400,
                msg: `该楼宇下还有${housesCount}个房间，请先删除房间后再删除楼宇`
            });
        }
        
        let building = await BuildingModel.findByIdAndDelete(req.params.id);
        if (!building) {
            return res.send({
                code: 404,
                msg: '楼宇不存在'
            });
        }
        res.send({
            code: 200,
            msg: '删除成功'
        });
    } catch (error) {
        console.error('删除楼宇失败:', error);
        res.send({
            code: 500,
            msg: '删除失败'
        });
    }
});

// 获取楼宇统计信息
router.get('/stats', async (req, res) => {
    try {
        const HouseModel = require('../models/House');
        
        // 获取所有楼宇及其房间统计
        const buildings = await BuildingModel.find().sort({ created_at: -1 });
        const stats = [];
        
        for (let building of buildings) {
            const totalRooms = await HouseModel.countDocuments({ buildingId: building._id });
            const availableRooms = await HouseModel.countDocuments({ 
                buildingId: building._id, 
                status: '空闲' 
            });
            const rentedRooms = await HouseModel.countDocuments({ 
                buildingId: building._id, 
                status: '已租' 
            });
            const maintenanceRooms = await HouseModel.countDocuments({ 
                buildingId: building._id, 
                status: '维修' 
            });
            
            stats.push({
                buildingId: building._id,
                buildingName: building.name,
                totalRooms,
                availableRooms,
                rentedRooms,
                maintenanceRooms,
                occupancyRate: totalRooms > 0 ? ((rentedRooms / totalRooms) * 100).toFixed(1) : 0
            });
        }
        
        res.send({
            code: 200,
            data: stats
        });
    } catch (error) {
        console.error('获取楼宇统计失败:', error);
        res.send({
            code: 500,
            msg: '获取统计信息失败'
        });
    }
});

// 获取楼宇入住率信息（用于运营总览）
router.get('/occupancy', async (req, res) => {
    try {
        const HouseModel = require('../models/House');
        
        // 获取所有楼宇及其房间信息
        const buildingsWithOccupancy = await BuildingModel.aggregate([
            {
                $lookup: {
                    from: 'houses',
                    localField: '_id',
                    foreignField: 'buildingId',
                    as: 'houses'
                }
            },
            {
                $addFields: {
                    totalRooms: { $size: '$houses' },
                    occupiedRooms: {
                        $size: {
                            $filter: {
                                input: '$houses',
                                cond: { $eq: ['$$this.status', '已租赁'] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    occupancyRate: {
                        $cond: {
                            if: { $gt: ['$totalRooms', 0] },
                            then: { 
                                $round: [
                                    { $multiply: [{ $divide: ['$occupiedRooms', '$totalRooms'] }, 100] },
                                    1
                                ]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    address: 1,
                    totalRooms: 1,
                    occupiedRooms: 1,
                    occupancyRate: 1
                }
            },
            { $sort: { name: 1 } }
        ]);

        res.send({
            code: 200,
            data: buildingsWithOccupancy
        });
    } catch (error) {
        console.error('获取楼宇入住率失败:', error);
        res.send({
            code: 500,
            msg: '获取楼宇入住率失败'
        });
    }
});

module.exports = router;
