const mongoose = require('../db/index');
const BuildingModel = require('../models/Building');
const HouseModel = require('../models/House');

// 更新楼宇数据 - 修改现有字段内容，不修改_id和现有关联
async function updateBuildingData() {
    console.log('开始更新楼宇数据...');
    
    try {
        // 获取所有现有楼宇
        const buildings = await BuildingModel.find();
        console.log(`找到 ${buildings.length} 个楼宇需要更新`);
        
        // 文雅的楼宇名称池
        const elegantNames = [
            '梧桐雅苑', '兰亭序院', '竹韵轩', '松风阁', '梅园居',
            '荷香苑', '桂花轩', '紫薇园', '海棠院', '芙蓉阁',
            '翠竹园', '丁香苑', '玉兰轩', '牡丹阁', '茉莉园',
            '樱花苑', '银杏轩', '枫叶阁', '柳絮园', '桃花苑'
        ];
        
        // 文雅的描述模板
        const descriptionTemplates = [
            '坐落于园区核心位置，建筑风格典雅，环境清幽宜人，是理想的商务办公场所。',
            '采用现代简约设计理念，融合传统文化元素，营造出宁静致远的办公氛围。',
            '位于园区景观带旁，绿树环绕，空气清新，为入驻企业提供舒适的办公环境。',
            '建筑设计独具匠心，内部空间布局合理，配套设施完善，彰显品质生活理念。',
            '毗邻园区中央绿地，视野开阔，采光充足，是企业发展的理想选择。',
            '传承东方美学精髓，现代化办公设施一应俱全，为企业腾飞助力。',
            '园林式办公环境，四季花香鸟语，在繁忙工作中享受自然之美。',
            '智能化楼宇管理系统，绿色环保理念贯穿始终，打造可持续发展的办公空间。'
        ];
        
        let updatedCount = 0;
        
        for (let i = 0; i < buildings.length; i++) {
            const building = buildings[i];
            const updateData = {};
            
            // 更新楼宇名称 - 使用文雅的名称
            if (i < elegantNames.length) {
                updateData.name = elegantNames[i];
            } else {
                // 如果楼宇数量超过预设名称，生成组合名称
                const baseNames = ['雅', '韵', '轩', '苑', '阁', '园', '居', '院'];
                const suffixes = ['A座', 'B座', 'C座', 'D座', 'E座'];
                const baseName = baseNames[i % baseNames.length];
                const suffix = suffixes[i % suffixes.length];
                updateData.name = `${baseName}${suffix}`;
            }
            
            // 更新楼宇描述
            updateData.description = descriptionTemplates[i % descriptionTemplates.length];
            
            // 强制更新所有楼宇的其他字段内容
            updateData.propertyFee = Math.floor(Math.random() * 5000) + 1000; // 1000-6000元
            updateData.buildingArea = Math.floor(Math.random() * 50000) + 10000; // 10000-60000平米
            updateData.managedArea = Math.floor(Math.random() * 30000) + 5000; // 5000-35000平米
            updateData.photo = '/uploads/building-default.jpg';
            updateData.address = `北京市朝阳区${updateData.name}${Math.floor(Math.random() * 100) + 1}号`;
            // 更新楼层信息
            updateData.aboveGroundFloors = Math.floor(Math.random() * 15) + 5; // 5-19层
            updateData.undergroundFloors = Math.floor(Math.random() * 3) + 1; // 1-3层
            updateData.floors = updateData.aboveGroundFloors + updateData.undergroundFloors;
            updateData.aboveGroundArea = Math.floor(Math.random() * 40000) + 8000; // 8000-48000平米
            updateData.undergroundArea = Math.floor(Math.random() * 20000) + 3000; // 3000-23000平米
            
            // 执行更新
                await BuildingModel.findByIdAndUpdate(
                    building._id, 
                    { $set: updateData },
                { new: false }
                );
                updatedCount++;
            console.log(`更新楼宇: ${building.name} → ${updateData.name}`);
            console.log(`  描述: ${updateData.description}`);
            console.log(`  地址: ${updateData.address}`);
        }
        
        console.log(`楼宇数据更新完成，共更新 ${updatedCount} 个楼宇`);
        
    } catch (error) {
        console.error('更新楼宇数据失败:', error);
        throw error;
    }
}

// 更新房间数据 - 修改现有字段内容，不修改_id和buildingId关联
async function updateHouseData() {
    console.log('开始更新房间数据...');
    
    try {
        // 获取所有现有房间，按楼宇分组
        const houses = await HouseModel.find().populate('buildingId');
        console.log(`找到 ${houses.length} 个房间需要更新`);
        
        // 按楼宇分组房间
        const housesByBuilding = {};
        for (let house of houses) {
            const buildingId = house.buildingId ? house.buildingId._id.toString() : 'unknown';
            if (!housesByBuilding[buildingId]) {
                housesByBuilding[buildingId] = [];
            }
            housesByBuilding[buildingId].push(house);
        }
        
        let updatedCount = 0;
        
        // 为每个楼宇的房间重新分配楼层和房间号
        for (let buildingId of Object.keys(housesByBuilding)) {
            const buildingHouses = housesByBuilding[buildingId];
            const building = buildingHouses[0].buildingId;
            
            if (!building) continue;
            
            const maxFloors = building.aboveGroundFloors || 15;
            const maxBasement = building.undergroundFloors || 3;
                
            console.log(`\n处理楼宇: ${building.name} (地上${maxFloors}层, 地下${maxBasement}层)`);
            
            // 为每个房间分配随机楼层和对应房间号
            for (let i = 0; i < buildingHouses.length; i++) {
                const house = buildingHouses[i];
                const updateData = {};
                
                // 随机分配楼层
                let randomFloor;
                // 20%概率分配到地下室，80%概率分配到地上
                if (Math.random() < 0.2 && maxBasement > 0) {
                    // 分配到地下室 (-1 到 -maxBasement)
                    randomFloor = -(Math.floor(Math.random() * maxBasement) + 1);
                } else {
                    // 分配到地上 (1 到 maxFloors)
                    randomFloor = Math.floor(Math.random() * maxFloors) + 1;
                }
                
                // 生成房间序号（01, 02, 03...）
                const roomSequence = String(i + 1).padStart(2, '0');
                
                // 生成房间号码：楼层 + 房间序号
                let newRoomNumber;
                if (randomFloor > 0) {
                    // 地上楼层：楼层数 + 房间序号
                    newRoomNumber = `${randomFloor}${roomSequence}`;
                    } else {
                    // 地下楼层：B + 地下层数 + 房间序号
                    newRoomNumber = `B${Math.abs(randomFloor)}${roomSequence}`;
                }
                
                updateData.floor = randomFloor;
                updateData.number = newRoomNumber;
                
                // 更新描述
                const floorDesc = randomFloor > 0 ? `${randomFloor}楼` : `地下${Math.abs(randomFloor)}层`;
                updateData.description = `位于${floorDesc}的${newRoomNumber}房间`;
            
                // 执行更新
                await HouseModel.findByIdAndUpdate(
                    house._id, 
                    { $set: updateData },
                    { new: false }
                );
                updatedCount++;
                
                console.log(`更新房间: ${house.number} → ${newRoomNumber} (${floorDesc})`);
            }
        }
        
        console.log(`\n房间数据更新完成，共更新 ${updatedCount} 个房间`);
        
    } catch (error) {
        console.error('更新房间数据失败:', error);
        throw error;
    }
}

// 主执行函数
async function main() {
    try {
        console.log('=== 开始数据库更新操作 ===');
        
        // 更新楼宇数据
        await updateBuildingData();
        console.log('');
        
        // 更新房间数据
        await updateHouseData();
        
        console.log('');
        console.log('=== 数据库更新完成 ===');
        
    } catch (error) {
        console.error('❌ 数据库更新失败:', error);
        process.exit(1);
    } finally {
        // 关闭数据库连接
        mongoose.connection.close();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = {
    updateBuildingData,
    updateHouseData,
    main
}; 