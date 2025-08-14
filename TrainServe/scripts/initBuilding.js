const BuildingModel = require('../models/Building');
require('../db/index'); // 连接数据库

/**
 * 初始化楼宇表
 * 插入测试数据
 */
async function initBuilding() {
  try {
    console.log('开始初始化楼宇表...');
    
    // 检查是否已有数据
    const count = await BuildingModel.countDocuments();
    if (count > 0) {
      console.log(`✓ 楼宇表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 生成楼宇测试数据
    const buildings = [
      {
        name: 'A1',
        description: 'A区1号楼',
        floors: 20
      },
      {
        name: 'A2',
        description: 'A区2号楼',
        floors: 18
      },
      {
        name: 'B1',
        description: 'B区1号楼',
        floors: 15
      },
      {
        name: 'B2',
        description: 'B区2号楼',
        floors: 22
      },
      {
        name: 'C1',
        description: 'C区1号楼',
        floors: 16
      },
      {
        name: 'C2',
        description: 'C区2号楼',
        floors: 19
      }
    ];

    // 批量插入数据
    const result = await BuildingModel.insertMany(buildings);
    console.log(`✓ 成功插入 ${result.length} 条楼宇数据`);
    
    // 显示插入的数据概览
    console.log('\n插入的楼宇概览:');
    result.forEach((building, index) => {
      console.log(`${index + 1}. ${building.name} - ${building.description} (${building.floors}层)`);
    });
    
  } catch (error) {
    console.error('❌ 初始化楼宇表失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initBuilding()
    .then(() => {
      console.log('\n🎉 楼宇表初始化完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = initBuilding; 