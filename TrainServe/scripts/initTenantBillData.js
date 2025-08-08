const mongoose = require('../db/index');
const TenantBill = require('../models/TenantBill');
const { Company } = require('../models/database');

// 生成随机日期
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 生成随机金额
function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// 生成随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 账单类型和对应的单价范围
const billTypes = [
  { type: '水电费', unitPriceRange: [0.5, 2.0], usageRange: [50, 500] }, // 单价：0.5-2.0元/度，用量：50-500度
  { type: '物业费', unitPriceRange: [2.0, 8.0], usageRange: [20, 200] }  // 单价：2.0-8.0元/㎡，用量：20-200㎡
];

// 缴费状态
const paymentStatuses = ['未缴费', '已缴费', '部分缴费', '逾期'];

async function initTenantBillData() {
  try {
    console.log('开始生成租户账单测试数据...');

    // 清空现有账单数据
    await TenantBill.deleteMany({});
    console.log('已清空现有账单数据');

    // 获取所有企业
    const companies = await Company.find().limit(15); // 限制15个企业，这样会有重复账单
    if (companies.length === 0) {
      console.log('没有找到企业数据，请先创建企业数据');
      return;
    }
    console.log(`找到 ${companies.length} 个企业`);

    const bills = [];
    
    // 生成25条账单数据
    for (let i = 0; i < 25; i++) {
      // 随机选择企业
      const company = companies[Math.floor(Math.random() * companies.length)];
      
      // 随机选择账单类型
      const billTypeInfo = billTypes[Math.floor(Math.random() * billTypes.length)];
      
      // 生成随机日期
      const startDate = randomDate(new Date('2023-01-01'), new Date('2024-01-01'));
      const dueDate = new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000); // 45天后到期
      
      // 生成单价和用量
      const unitPrice = randomAmount(billTypeInfo.unitPriceRange[0], billTypeInfo.unitPriceRange[1]);
      const usage = randomInt(billTypeInfo.usageRange[0], billTypeInfo.usageRange[1]);
      const amount = Math.round(unitPrice * usage * 100) / 100;
      
      // 随机缴费状态
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      // 根据缴费状态生成已缴费金额
      let paidAmount = 0;
      let paymentDate = null;
      
      if (paymentStatus === '已缴费') {
        paidAmount = amount;
        paymentDate = randomDate(startDate, new Date());
      } else if (paymentStatus === '部分缴费') {
        paidAmount = Math.round(amount * randomAmount(0.3, 0.8) * 100) / 100;
        paymentDate = randomDate(startDate, new Date());
      } else if (paymentStatus === '逾期') {
        paidAmount = 0;
        paymentDate = null;
      }
      
      // 生成唯一的账单编号（使用索引确保唯一性）
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const sequence = String(i + 1).padStart(4, '0');
      const billNumber = `TB${year}${month}${day}${sequence}`;
      
      // 生成备注
      const remarks = [
        '',
        '正常缴费',
        '需要催缴',
        '已联系租户',
        '缴费方式：转账',
        '缴费方式：现金'
      ];
      const remark = remarks[Math.floor(Math.random() * remarks.length)];

      const billData = {
        billNumber,
        companyId: company._id,
        billType: billTypeInfo.type,
        startDate,
        unitPrice,
        usage,
        amount,
        paymentStatus,
        paidAmount,
        paymentDate,
        dueDate,
        remarks: remark
      };

      bills.push(billData);
      console.log(`生成第 ${i + 1} 条账单: ${billNumber}`);
    }

    // 批量插入数据
    await TenantBill.insertMany(bills);
    
    console.log(`✅ 成功生成 ${bills.length} 条租户账单测试数据`);
    
    // 统计信息
    const stats = await TenantBill.aggregate([
      {
        $group: {
          _id: '$billType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);
    
    console.log('\n📊 数据统计：');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}条, 总金额: ${stat.totalAmount.toFixed(2)}元, 已缴费: ${stat.totalPaid.toFixed(2)}元`);
    });
    
    const statusStats = await TenantBill.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n💳 缴费状态统计：');
    statusStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}条`);
    });

  } catch (error) {
    console.error('❌ 生成租户账单数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

// 执行数据初始化
initTenantBillData(); 