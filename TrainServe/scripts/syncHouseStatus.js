const mongoose = require('../db/index');
const { Company } = require('../models/database');
const HouseModel = require('../models/House');

/**
 * 同步房间状态脚本
 * 根据企业表的houseId字段，更新对应房间的状态
 */
async function syncHouseStatus() {
  try {
    console.log('🔄 开始同步房间状态...');
    
    // 1. 先将所有房间设为空闲
    await HouseModel.updateMany({}, { status: '空闲' });
    console.log('✅ 已将所有房间设为空闲状态');
    
    // 2. 查找所有有房间ID的企业
    const companiesWithHouse = await Company.find({ 
      houseId: { $exists: true, $ne: null } 
    }).populate('houseId');
    
    console.log(`📊 找到 ${companiesWithHouse.length} 个企业有关联房间`);
    
    // 3. 将这些企业对应的房间设为已租
    let updatedCount = 0;
    for (const company of companiesWithHouse) {
      if (company.houseId) {
        await HouseModel.findByIdAndUpdate(company.houseId._id, { status: '已租' });
        console.log(`🏢 企业 "${company.name}" 的房间 "${company.houseId.number}" 已设为已租状态`);
        updatedCount++;
      }
    }
    
    // 4. 统计结果
    const totalHouses = await HouseModel.countDocuments();
    const rentedHouses = await HouseModel.countDocuments({ status: '已租' });
    const freeHouses = await HouseModel.countDocuments({ status: '空闲' });
    const maintenanceHouses = await HouseModel.countDocuments({ status: '维修' });
    
    console.log('\n📈 同步完成统计：');
    console.log(`   总房间数: ${totalHouses}`);
    console.log(`   已租房间: ${rentedHouses}`);
    console.log(`   空闲房间: ${freeHouses}`);
    console.log(`   维修房间: ${maintenanceHouses}`);
    console.log(`   入住率: ${totalHouses > 0 ? ((rentedHouses / totalHouses) * 100).toFixed(1) : 0}%`);
    
    console.log('\n✅ 房间状态同步完成！');
    
  } catch (error) {
    console.error('❌ 同步房间状态时出错:', error);
    throw error;
  }
}

/**
 * 验证房间状态的一致性
 */
async function validateHouseStatus() {
  try {
    console.log('\n🔍 验证房间状态一致性...');
    
    // 查找所有企业关联的房间
    const companiesWithHouse = await Company.find({ 
      houseId: { $exists: true, $ne: null } 
    }).populate('houseId');
    
    let inconsistentCount = 0;
    
    for (const company of companiesWithHouse) {
      if (company.houseId && company.houseId.status !== '已租') {
        console.log(`⚠️  不一致: 企业 "${company.name}" 关联的房间 "${company.houseId.number}" 状态为 "${company.houseId.status}"，应该是"已租"`);
        inconsistentCount++;
      }
    }
    
    // 查找状态为已租但没有企业关联的房间
    const rentedHouses = await HouseModel.find({ status: '已租' });
    for (const house of rentedHouses) {
      const company = await Company.findOne({ houseId: house._id });
      if (!company) {
        console.log(`⚠️  孤立房间: 房间 "${house.number}" 状态为已租，但没有企业关联`);
        inconsistentCount++;
      }
    }
    
    if (inconsistentCount === 0) {
      console.log('✅ 房间状态完全一致！');
    } else {
      console.log(`❌ 发现 ${inconsistentCount} 个不一致的房间状态`);
    }
    
    return inconsistentCount === 0;
  } catch (error) {
    console.error('❌ 验证房间状态时出错:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  syncHouseStatus()
    .then(() => validateHouseStatus())
    .then(() => {
      console.log('\n🎉 脚本执行完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  syncHouseStatus,
  validateHouseStatus
}; 