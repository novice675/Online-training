var express = require('express');
var router = express.Router();
const HouseModel = require('../models/House')
const BuildingModel = require('../models/Building')

// 获取房间信息列表（支持分页和搜索）
router.get('/', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, number, buildingId, floor, status } = req.query;
        
        // 构建查询条件
        let query = {};
        if (number && number.trim()) {
            query.number = { $regex: number.trim(), $options: 'i' }; // 房间号模糊搜索
        }
        if (buildingId) {
            query.buildingId = buildingId; // 按楼宇筛选
        }
        if (floor !== undefined && floor !== '') {
            query.floor = parseInt(floor); // 按楼层筛选
        }
        if (status) {
            query.status = status; // 按状态筛选
        }
        
        // 分页参数
        const limit = parseInt(pageSize);
        const skip = (parseInt(page) - 1) * limit;
        
        // 并行查询数据和总数
        const [houses, total] = await Promise.all([
            HouseModel.find(query)
                .populate('buildingId')
                .sort({ floor: 1, number: 1 })
                .limit(limit)
                .skip(skip),
            HouseModel.countDocuments(query)
        ]);
        
        res.send({
            code: 200,
            data: houses,
            total: total,
            page: parseInt(page),
            pageSize: limit,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('获取房间列表失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});

// 根据楼栋ID获取房间列表
router.get('/building/:buildingId', async (req, res) => {
    try {
        let houses = await HouseModel.find({ buildingId: req.params.buildingId })
            .populate('buildingId')
            .sort({ floor: 1, number: 1 });
        res.send({
            code: 200,
            data: houses,
            total: houses.length
        });
    } catch (error) {
        console.error('获取楼栋房间失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});

// 根据楼层获取房间列表
router.get('/building/:buildingId/floor/:floor', async (req, res) => {
    try {
        let houses = await HouseModel.find({ 
            buildingId: req.params.buildingId,
            floor: parseInt(req.params.floor)
        }).populate('buildingId').sort({ number: 1 });
        
        res.send({
            code: 200,
            data: houses,
            total: houses.length
        });
    } catch (error) {
        console.error('获取楼层房间失败:', error);
        res.send({
            code: 500,
            msg: '内部服务器错误'
        });
    }
});

// 添加房间
router.post('/add', async (req, res) => {
    try {
        // 先验证楼宇是否存在
        const building = await BuildingModel.findById(req.body.buildingId);
        if (!building) {
            return res.send({
                code: 400,
                msg: '楼宇不存在'
            });
        }
        
        // 验证楼层范围
        const floor = parseInt(req.body.floor);
        if (floor === 0) {
            return res.send({
                code: 400,
                msg: '楼层不能为0'
            });
        }
        
        if (floor > 0 && floor > building.aboveGroundFloors) {
            return res.send({
                code: 400,
                msg: `地上楼层不能超过${building.aboveGroundFloors}层`
            });
        }
        
        if (floor < 0 && Math.abs(floor) > building.undergroundFloors) {
            return res.send({
                code: 400,
                msg: `地下楼层不能超过${building.undergroundFloors}层`
            });
        }
        
        // 如果没有提供房间号码，自动生成
        if (!req.body.number) {
            // 获取该楼层已有房间数量
            const existingRoomsCount = await HouseModel.countDocuments({
                buildingId: req.body.buildingId,
                floor: floor
            });
            
            // 生成房间序号
            const roomSequence = String(existingRoomsCount + 1).padStart(2, '0');
            
            // 生成房间号码
            if (floor > 0) {
                req.body.number = `${floor}${roomSequence}`;
            } else {
                req.body.number = `B${Math.abs(floor)}${roomSequence}`;
            }
        }
        
        // 验证必填字段
        const { number, area, pricingArea, rent, propertyFee } = req.body;
        if (!number || !area || !pricingArea || rent === undefined || propertyFee === undefined) {
            return res.send({
                code: 400,
                msg: '房间号、面积、计价面积、租金和物业费不能为空'
            });
        }
        
        let house = await HouseModel.create(req.body);
        // 返回包含楼宇信息的房间数据
        house = await HouseModel.findById(house._id).populate('buildingId');
        
        res.send({
            code: 200,
            msg: '添加成功',
            data: house
        });
    } catch (error) {
        console.error('添加房间失败:', error);
        
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
                msg: '该楼宇下已存在相同房间号'
            });
        }
        
        res.send({
            code: 500,
            msg: '添加失败'
        });
    }
});

// 更新房间
router.put('/update/:id', async (req, res) => {
    try {
        // 如果要更新楼层或楼宇，先验证
        if (req.body.floor !== undefined || req.body.buildingId) {
            const buildingId = req.body.buildingId || req.body._buildingId;
            const floor = req.body.floor;
            
            if (buildingId && floor !== undefined) {
                const building = await BuildingModel.findById(buildingId);
                if (!building) {
                    return res.send({
                        code: 400,
                        msg: '楼宇不存在'
                    });
                }
                
                if (floor === 0) {
                    return res.send({
                        code: 400,
                        msg: '楼层不能为0'
                    });
                }
                
                if (floor > 0 && floor > building.aboveGroundFloors) {
                    return res.send({
                        code: 400,
                        msg: `地上楼层不能超过${building.aboveGroundFloors}层`
                    });
                }
                
                if (floor < 0 && Math.abs(floor) > building.undergroundFloors) {
                    return res.send({
                        code: 400,
                        msg: `地下楼层不能超过${building.undergroundFloors}层`
                    });
                }
            }
        }
        
        let house = await HouseModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!house) {
            return res.send({
                code: 404,
                msg: '房间不存在'
            });
        }
        
        // 返回包含楼宇信息的房间数据
        house = await HouseModel.findById(house._id).populate('buildingId');
        
        res.send({
            code: 200,
            msg: '更新成功',
            data: house
        });
    } catch (error) {
        console.error('更新房间失败:', error);
        
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
                msg: '该楼宇下已存在相同房间号'
            });
        }
        
        res.send({
            code: 500,
            msg: '更新失败'
        });
    }
});

// 删除房间
router.delete('/delete/:id', async (req, res) => {
    try {
        let house = await HouseModel.findByIdAndDelete(req.params.id);
        if (!house) {
            return res.send({
                code: 404,
                msg: '房间不存在'
            });
        }
        res.send({
            code: 200,
            msg: '删除成功'
        });
    } catch (error) {
        console.error('删除房间失败:', error);
        res.send({
            code: 500,
            msg: '删除失败'
        });
    }
});

// 获取楼宇的楼层信息（用于前端验证）
router.get('/building/:buildingId/floors', async (req, res) => {
    try {
        const building = await BuildingModel.findById(req.params.buildingId);
        if (!building) {
            return res.send({
                code: 404,
                msg: '楼宇不存在'
            });
        }
        
        // 生成可用楼层列表
        const floors = [];
        
        // 地下楼层
        for (let i = building.undergroundFloors; i >= 1; i--) {
            floors.push({
                value: -i,
                label: `地下${i}层`,
                type: 'underground'
            });
        }
        
        // 地上楼层
        for (let i = 1; i <= building.aboveGroundFloors; i++) {
            floors.push({
                value: i,
                label: `${i}层`,
                type: 'aboveground'
            });
        }
        
        res.send({
            code: 200,
            data: {
                aboveGroundFloors: building.aboveGroundFloors,
                undergroundFloors: building.undergroundFloors,
                floors: floors
            }
        });
    } catch (error) {
        console.error('获取楼层信息失败:', error);
        res.send({
            code: 500,
            msg: '获取楼层信息失败'
        });
    }
});

// 批量生成房间
router.post('/batch-generate', async (req, res) => {
    try {
        const { buildingId, floors, roomsPerFloor } = req.body;
        
        if (!buildingId || !floors || !Array.isArray(floors) || !roomsPerFloor) {
            return res.send({
                code: 400,
                msg: '参数不完整'
            });
        }
        
        // 验证楼宇是否存在
        const building = await BuildingModel.findById(buildingId);
        if (!building) {
            return res.send({
                code: 400,
                msg: '楼宇不存在'
            });
        }
        
        const generatedRooms = [];
        
        for (let floor of floors) {
            // 验证楼层范围
            if (floor === 0) continue;
            if (floor > 0 && floor > building.aboveGroundFloors) continue;
            if (floor < 0 && Math.abs(floor) > building.undergroundFloors) continue;
            
            // 获取该楼层已有房间数量
            const existingRoomsCount = await HouseModel.countDocuments({
                buildingId: buildingId,
                floor: floor
            });
            
            // 生成房间
            for (let i = 1; i <= roomsPerFloor; i++) {
                const roomSequence = String(existingRoomsCount + i).padStart(2, '0');
                
                let roomNumber;
                if (floor > 0) {
                    roomNumber = `${floor}${roomSequence}`;
                } else {
                    roomNumber = `B${Math.abs(floor)}${roomSequence}`;
                }
                
                // 检查房间号是否已存在
                const existingRoom = await HouseModel.findOne({
                    buildingId: buildingId,
                    number: roomNumber
                });
                
                if (!existingRoom) {
                    const roomData = {
                        number: roomNumber,
                        floor: floor,
                        buildingId: buildingId,
                        area: Math.floor(Math.random() * 100) + 50, // 50-150平米
                        pricingArea: Math.floor(Math.random() * 100) + 50,
                        rent: Math.floor(Math.random() * 5000) + 2000, // 2000-7000元
                        propertyFee: Math.floor(Math.random() * 1000) + 500, // 500-1500元
                        deposit: 0,
                        status: '空闲',
                        description: `位于${floor > 0 ? floor + '楼' : '地下' + Math.abs(floor) + '层'}的${roomNumber}房间`
                    };
                    
                    const newRoom = await HouseModel.create(roomData);
                    generatedRooms.push(newRoom);
                }
            }
        }
        
        res.send({
            code: 200,
            msg: `成功生成${generatedRooms.length}个房间`,
            data: generatedRooms
        });
    } catch (error) {
        console.error('批量生成房间失败:', error);
        res.send({
            code: 500,
            msg: '批量生成失败'
        });
    }
});

// 获取房间统计信息
router.get('/stats', async (req, res) => {
    try {
        const totalRooms = await HouseModel.countDocuments();
        const availableRooms = await HouseModel.countDocuments({ status: '空闲' });
        const rentedRooms = await HouseModel.countDocuments({ status: '已租' });
        const maintenanceRooms = await HouseModel.countDocuments({ status: '维修' });
        
        // 按楼宇统计
        const buildings = await BuildingModel.find().sort({ created_at: -1 });
        const buildingStats = [];
        
        for (let building of buildings) {
            const buildingRooms = await HouseModel.countDocuments({ buildingId: building._id });
            const buildingAvailable = await HouseModel.countDocuments({ 
                buildingId: building._id, 
                status: '空闲' 
            });
            const buildingRented = await HouseModel.countDocuments({ 
                buildingId: building._id, 
                status: '已租' 
            });
            
            buildingStats.push({
                buildingId: building._id,
                buildingName: building.name,
                totalRooms: buildingRooms,
                availableRooms: buildingAvailable,
                rentedRooms: buildingRented,
                occupancyRate: buildingRooms > 0 ? ((buildingRented / buildingRooms) * 100).toFixed(1) : 0
            });
        }
        
        res.send({
            code: 200,
            data: {
                overview: {
                    totalRooms,
                    availableRooms,
                    rentedRooms,
                    maintenanceRooms,
                    occupancyRate: totalRooms > 0 ? ((rentedRooms / totalRooms) * 100).toFixed(1) : 0
                },
                buildingStats
            }
        });
    } catch (error) {
        console.error('获取房间统计失败:', error);
        res.send({
            code: 500,
            msg: '获取统计信息失败'
        });
    }
});

module.exports = router;
