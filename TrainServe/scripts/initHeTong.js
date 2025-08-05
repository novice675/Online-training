const { HeTong } = require('../models/HeTong');
require('../db/index'); // 连接数据库

/**
 * 初始化合同表
 * 插入测试数据
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

    // 生成测试数据
    const testContracts = [];
    
    const tenantNames = [
      '北京科技有限公司', '上海商贸集团', '深圳创新科技', '广州文化传媒',
      '杭州互联网科技', '成都电子商务', '武汉软件开发', '西安网络科技',
      '南京信息技术', '重庆大数据', '苏州智能制造', '天津物联网',
      '青岛海洋科技', '大连软件园', '厦门文创公司', '福州新能源',
      '济南生物科技', '郑州智慧城市', '长沙移动互联', '昆明云计算',
      '太原人工智能', '石家庄区块链', '哈尔滨机器人', '沈阳自动化',
      '长春汽车电子', '南昌虚拟现实', '合肥量子科技', '银川新材料',
      '王小明个体户', '李小红美容店', '张三服装店', '刘四餐饮店',
      '赵五文具店', '陈六五金店', '周七理发店', '吴八书店',
      '孙九药店', '胡十超市', '朱小美花店', '林小强维修店'
    ];
    
    const louyu = ['A1楼', 'A2楼', 'B1楼', 'B2楼', 'C1楼', 'C2楼', 'D1楼', 'D2楼'];
    const tenantTypes = ['企业', '个体经营户'];
    const contractTypes = ['新签', '续签'];
    
    const contactPeople = [
      '张经理', '李总监', '王主任', '刘负责人', '陈总经理', '周主管',
      '吴经理', '孙总', '胡主任', '朱负责人', '林经理', '徐总监',
      '孟主管', '何经理', '韩总', '冯主任', '邓负责人', '曹经理'
    ];
    
    // 生成40条测试数据
    for (let i = 0; i < 40; i++) {
      const randomTenantName = tenantNames[i % tenantNames.length];
      const randomLouyu = louyu[Math.floor(Math.random() * louyu.length)];
      const randomType = tenantTypes[Math.floor(Math.random() * tenantTypes.length)];
      const randomShuxing = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const randomContactPerson = contactPeople[Math.floor(Math.random() * contactPeople.length)];
      
      // 随机生成房间号
      const roomNumber = `${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`;
      const fangjian = `${roomNumber}室`;
      
      // 随机生成合同日期（开始时间在过去一年内，结束时间在开始时间后1-3年）
      const startDaysAgo = Math.floor(Math.random() * 365);
      const startDate = new Date(Date.now() - startDaysAgo * 24 * 60 * 60 * 1000);
      const contractDuration = Math.floor(Math.random() * 3) + 1; // 1-3年
      const endDate = new Date(startDate.getTime() + contractDuration * 365 * 24 * 60 * 60 * 1000);
      
      // 随机生成面积和费用
      const mian = Math.floor(Math.random() * 150) + 50; // 50-200平米
      const jiajian = mian * (0.9 + Math.random() * 0.2); // 计价面积略有差异
      const wuye = Math.floor(Math.random() * 10) + 5; // 5-15元/平米
      const zujin = Math.floor(Math.random() * 50) + 30; // 30-80元/平米
      const yajin = Math.floor(zujin * jiajian * (1 + Math.random() * 2)); // 1-3个月租金
      
      // 生成手机号
      const phonePrefix = ['138', '139', '150', '151', '152', '188', '189'];
      const randomPrefix = phonePrefix[Math.floor(Math.random() * phonePrefix.length)];
      const phoneSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      const phone = randomPrefix + phoneSuffix;
      
      testContracts.push({
        he_bian: `HT${new Date().getFullYear()}${(i + 1).toString().padStart(4, '0')}`,
        name: randomTenantName,
        type: randomType,
        shuxing: randomShuxing,
        startDate: startDate,
        endDate: endDate,
        qianPeople: randomContactPerson,
        phone: phone,
        louyu: randomLouyu,
        fangjian: fangjian,
        mian: parseFloat(mian.toFixed(2)),
        jiajian: parseFloat(jiajian.toFixed(2)),
        wuye: parseFloat(wuye.toFixed(2)),
        zujin: parseFloat(zujin.toFixed(2)),
        yajin: parseFloat(yajin.toFixed(2)),
        beizhu: `这是第${i + 1}号合同的备注信息`,
        created_at: startDate,
        updated_at: startDate
      });
    }

    await HeTong.insertMany(testContracts);
    console.log(`✓ 成功插入 ${testContracts.length} 条测试数据`);

    // 显示统计信息
    const typeStats = await HeTong.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const louyuStats = await HeTong.aggregate([
      { $group: { _id: '$louyu', count: { $sum: 1 } } }
    ]);

    const shuxingStats = await HeTong.aggregate([
      { $group: { _id: '$shuxing', count: { $sum: 1 } } }
    ]);

    // 统计合同状态
    const now = new Date();
    const activeCount = await HeTong.countDocuments({ endDate: { $gt: now } });
    const expiredCount = await HeTong.countDocuments({ endDate: { $lte: now } });

    console.log('\n📊 数据统计:');
    console.log('按租户类型统计:');
    typeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 个`);
    });

    console.log('按楼宇统计:');
    louyuStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 个`);
    });

    console.log('按合同属性统计:');
    shuxingStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 个`);
    });

    console.log('按合同状态统计:');
    console.log(`  生效中: ${activeCount} 个`);
    console.log(`  已到期: ${expiredCount} 个`);

    console.log('\n✅ 合同表初始化完成！');
    
  } catch (error) {
    console.error('❌ 合同表初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initHeTong()
    .then(() => {
      console.log('初始化完成，即将退出...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
}

module.exports = initHeTong; 