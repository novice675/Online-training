// 使用项目的数据库连接配置
require('../db/index.js');
const KeHu = require('../models/KeHu');
const mongoose = require('mongoose');

async function initKeHuData() {
  try {
    // 等待数据库连接就绪
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }
    console.log('数据库连接就绪');
    
    // 清空现有数据
    await KeHu.deleteMany({});
    console.log('已清空现有客户数据');
    
    // 测试客户数据
    const testCustomers = [
      {
        name: '腾讯科技有限公司',
        phone: '13800138001',
        level: '一级',
        industry: '互联网科技',
        intentLevel: '高',
        followPerson: '张经理',
        contactPhone: '13900139001',
        requiredAreaMin: 500,
        requiredAreaMax: 1000,
        budgetMin: 50000,
        budgetMax: 80000,
        purpose: '总部办公',
        interestedProperty: 'A栋整层',
        remarks: '知名互联网公司，有强烈入驻意向'
      },
      {
        name: '阿里巴巴集团',
        phone: '13800138002',
        level: '一级',
        industry: '电子商务',
        intentLevel: '中',
        followPerson: '李经理',
        contactPhone: '13900139002',
        requiredAreaMin: 800,
        requiredAreaMax: 1500,
        budgetMin: 80000,
        budgetMax: 120000,
        purpose: '区域总部',
        interestedProperty: 'B栋高层',
        remarks: '正在考察多个园区，需要进一步沟通'
      },
      {
        name: '字节跳动科技',
        phone: '13800138003',
        level: '一级',
        industry: '移动互联网',
        intentLevel: '高',
        followPerson: '王经理',
        contactPhone: '13900139003',
        requiredAreaMin: 1000,
        requiredAreaMax: 2000,
        budgetMin: 100000,
        budgetMax: 150000,
        purpose: '研发中心',
        interestedProperty: 'C栋全层',
        remarks: '已签约，准备入驻'
      },
      {
        name: '小米科技公司',
        phone: '13800138004',
        level: '二级',
        industry: '智能硬件',
        intentLevel: '低',
        followPerson: '赵经理',
        contactPhone: '13900139004',
        requiredAreaMin: 300,
        requiredAreaMax: 600,
        budgetMin: 30000,
        budgetMax: 50000,
        purpose: '销售办公',
        interestedProperty: 'D栋中层',
        remarks: '预算有限，还在比较价格'
      },
      {
        name: '华为技术公司',
        phone: '13800138005',
        level: '一级',
        industry: '通信技术',
        intentLevel: '中',
        followPerson: '陈经理',
        contactPhone: '13900139005',
        requiredAreaMin: 600,
        requiredAreaMax: 1200,
        budgetMin: 60000,
        budgetMax: 100000,
        purpose: '分公司办公',
        interestedProperty: 'E栋整层',
        remarks: '正在内部审批流程中'
      },
      {
        name: '美团科技公司',
        phone: '13800138006',
        level: '二级',
        industry: '本地生活服务',
        intentLevel: '高',
        followPerson: '孙经理',
        contactPhone: '13900139006',
        requiredAreaMin: 400,
        requiredAreaMax: 800,
        budgetMin: 40000,
        budgetMax: 70000,
        purpose: '运营中心',
        interestedProperty: 'F栋部分楼层',
        remarks: '急需办公场地，希望尽快入驻'
      },
      {
        name: '百度科技公司',
        phone: '13800138007',
        level: '一级',
        industry: '人工智能',
        intentLevel: '中',
        followPerson: '刘经理',
        contactPhone: '13900139007',
        requiredAreaMin: 700,
        requiredAreaMax: 1300,
        budgetMin: 70000,
        budgetMax: 110000,
        purpose: 'AI研发中心',
        interestedProperty: 'G栋高层',
        remarks: '专注AI技术，需要高端办公环境'
      },
      {
        name: '京东集团',
        phone: '13800138008',
        level: '二级',
        industry: '电商物流',
        intentLevel: '低',
        followPerson: '周经理',
        contactPhone: '13900139008',
        requiredAreaMin: 200,
        requiredAreaMax: 500,
        budgetMin: 20000,
        budgetMax: 40000,
        purpose: '仓储办公',
        interestedProperty: 'H栋底层',
        remarks: '主要用于仓储，对装修要求不高'
      }
    ];

    // 插入数据
    const result = await KeHu.insertMany(testCustomers);
    console.log(`成功创建了 ${result.length} 个客户记录`);
    
    // 验证数据
    console.log('\n创建的客户数据:');
    result.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - 意向等级: ${customer.intentLevel} - 等级: ${customer.level}`);
    });
    
    // 按意向等级统计
    console.log('\n按意向等级统计:');
    const intentLevels = ['高', '中', '低'];
    for (let level of intentLevels) {
      const count = await KeHu.countDocuments({ intentLevel: level });
      console.log(`意向等级 "${level}": ${count} 个客户`);
    }
    
    console.log('\n✅ 客户测试数据初始化完成！');
    console.log('现在您可以在前端测试意向等级筛选功能了。');
    
  } catch (error) {
    console.error('❌ 初始化客户数据失败:', error);
  } finally {
    // 不关闭连接，让进程自然结束
    console.log('脚本执行完成');
    process.exit(0);
  }
}

initKeHuData(); 