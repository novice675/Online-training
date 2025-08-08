const HouseModel = require('../models/House');
const BuildingModel = require('../models/Building');
require('../db/index'); // 连接数据库

/**
 * 初始化房间表
 * 为每个楼宇生成房间数据
 */
async function initHouse() {
  try {
    console.log('开始初始化房间表...');
    
    // 检查是否已有数据
    const count = await HouseModel.countDocuments();
    if (count > 0) {
      console.log(`✓ 房间表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 获取所有楼宇
    const buildings = await BuildingModel.find({}).sort({ name: 1 });
    if (buildings.length === 0) {
      console.log('⚠️ 警告: 没有找到楼宇数据，请先运行楼宇初始化脚本');
      return;
    }
    
    console.log(`✓ 找到 ${buildings.length} 个楼宇`);

    // 房间配置 - 总共生成30个房间
    const totalRooms = 30;
    const roomsPerBuilding = Math.ceil(totalRooms / buildings.length); // 每个楼宇分配的房间数
    
    // 租金范围配置
    const rentRanges = {
      'A1': { min: 3000, max: 5000 },
      'A2': { min: 2800, max: 4800 },
      'B1': { min: 3200, max: 5200 },
      'B2': { min: 3500, max: 5500 },
      'C1': { min: 2500, max: 4200 },
      'C2': { min: 2700, max: 4500 }
    };

    let allHouses = [];
    let roomCounter = 101; // 从101开始编号

    // 为每个楼宇生成房间
    for (let buildingIndex = 0; buildingIndex < buildings.length; buildingIndex++) {
      const building = buildings[buildingIndex];
      const rentRange = rentRanges[building.name] || { min: 3000, max: 5000 };
      
      // 计算当前楼宇应该生成的房间数
      let roomsForThisBuilding = roomsPerBuilding;
      if (buildingIndex === buildings.length - 1) {
        // 最后一个楼宇，分配剩余的房间
        roomsForThisBuilding = totalRooms - allHouses.length;
      }
      
      console.log(`正在为 ${building.name} 生成 ${roomsForThisBuilding} 个房间...`);
      
      for (let i = 0; i < roomsForThisBuilding; i++) {
        const roomNumber = roomCounter.toString();
        roomCounter++;
        
        // 随机生成房间属性
        const area = Math.floor(Math.random() * (120 - 60 + 1)) + 60; // 60-120平米
        const pricingArea = Math.floor(area * (0.85 + Math.random() * 0.1)); // 计价面积85%-95%
        const rent = Math.floor(Math.random() * (rentRange.max - rentRange.min + 1)) + rentRange.min;
        const propertyFee = Math.floor(area * (8 + Math.random() * 4)); // 8-12元/平米
        const deposit = rent * (1 + Math.floor(Math.random() * 3)); // 1-3个月租金
        
        const house = {
          number: roomNumber,
          buildingId: building._id,
          area: area,
          pricingArea: pricingArea,
          rent: rent,
          propertyFee: propertyFee,
          deposit: deposit,
          status: Math.random() > 0.7 ? '已租' : '空闲' // 70%概率空闲，30%概率已租
        };
        
        allHouses.push(house);
      }
    }

    // 批量插入数据
    console.log(`准备插入 ${allHouses.length} 个房间...`);
    const result = await HouseModel.insertMany(allHouses);
    console.log(`✓ 成功插入 ${result.length} 条房间数据`);
    
    // 显示统计信息
    console.log('\n房间分布统计:');
    for (const building of buildings) {
      const buildingRooms = result.filter(house => 
        house.buildingId.toString() === building._id.toString()
      );
      const availableRooms = buildingRooms.filter(house => house.status === '空闲').length;
      const rentedRooms = buildingRooms.filter(house => house.status === '已租').length;
      
      console.log(`  ${building.name}: ${buildingRooms.length} 间房 (空闲: ${availableRooms}, 已租: ${rentedRooms})`);
    }
    
    // 显示价格统计
    const avgRent = Math.floor(result.reduce((sum, house) => sum + house.rent, 0) / result.length);
    const minRent = Math.min(...result.map(house => house.rent));
    const maxRent = Math.max(...result.map(house => house.rent));
    
    console.log(`\n租金统计: 平均 ${avgRent}元/月, 最低 ${minRent}元/月, 最高 ${maxRent}元/月`);
    
  } catch (error) {
    console.error('❌ 初始化房间表失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initHouse()
    .then(() => {
      console.log('\n🎉 房间表初始化完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = initHouse; 