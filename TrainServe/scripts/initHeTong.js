const { HeTong } = require('../models/HeTong');
require('../db/index'); // 连接数据库

/**
 * 初始化合同表
 * 生成测试合同数据
 */
async function initHeTong() {
  try {
    console.log('开始初始化合同表...');
    
    // 检查是否已有数据
    const count = await HeTong.countDocuments();
    if (count > 0) {
      console.log(`✓ 合同表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 合同数据配置
    const contractCount = 20; // 生成20份合同
    const contractTypes = ['新签', '续签'];
    const signers = [
      '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
      '郑一', '王二', '李三', '张四', '陈五', '刘六', '杨七', '黄八',
      '朱九', '林十', '何一', '罗二'
    ];
    
    let allContracts = [];

    console.log(`准备生成 ${contractCount} 份合同...`);

    // 生成合同数据
    for (let i = 0; i < contractCount; i++) {
      const contractNumber = `HT${new Date().getFullYear()}${(i + 1).toString().padStart(4, '0')}`;
      const signerIndex = i % signers.length;
      const signer = signers[signerIndex];
      
      // 随机生成合同日期
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365)); // 过去一年内的随机日期
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1 + Math.floor(Math.random() * 2)); // 1-3年合同期
      
      const contract = {
        he_bian: contractNumber,
        shuxing: contractTypes[Math.floor(Math.random() * contractTypes.length)],
        startDate: startDate,
        endDate: endDate,
        qianPeople: signer,
        phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        beizhu: Math.random() > 0.7 ? `${signer}的租赁合同` : undefined
      };
      
      allContracts.push(contract);
    }

    // 批量插入数据
    console.log(`准备插入 ${allContracts.length} 份合同...`);
    const result = await HeTong.insertMany(allContracts);
    console.log(`✓ 成功插入 ${result.length} 条合同数据`);
    
    // 显示统计信息
    const newContracts = result.filter(contract => contract.shuxing === '新签').length;
    const renewalContracts = result.filter(contract => contract.shuxing === '续签').length;
    
    console.log(`\n合同类型统计:`);
    console.log(`  新签合同: ${newContracts} 份`);
    console.log(`  续签合同: ${renewalContracts} 份`);
    
    // 显示合同期限统计
    const now = new Date();
    const activeContracts = result.filter(contract => contract.endDate > now).length;
    const expiredContracts = result.filter(contract => contract.endDate <= now).length;
    
    console.log(`\n合同状态统计:`);
    console.log(`  生效中: ${activeContracts} 份`);
    console.log(`  已到期: ${expiredContracts} 份`);
    
  } catch (error) {
    console.error('❌ 初始化合同表失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initHeTong()
    .then(() => {
      console.log('\n🎉 合同表初始化完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = initHeTong; 