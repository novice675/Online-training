const mongoose = require('mongoose');
const KeHu = require('../models/KeHu');

// 连接数据库
mongoose.connect('mongodb://127.0.0.1:27017/training', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// 测试客户数据
const kehuData = [
  {
    name: '阿里巴巴集团',
    phone: '13800138001',
    level: '一级',
    industry: '互联网科技',
    status: '成交',
    followPerson: '张经理',
    contactPhone: '13900139001',
    requiredAreaMin: 500,
    requiredAreaMax: 800,
    budgetMin: 50000,
    budgetMax: 80000,
    purpose: '总部办公',
    interestedProperty: 'A1楼1001-1005',
    remarks: '大型互联网企业，需要开放式办公环境'
  },
  {
    name: '腾讯科技有限公司',
    phone: '13800138002',
    level: '一级',
    industry: '互联网科技',
    status: '意向',
    followPerson: '李经理',
    contactPhone: '13900139002',
    requiredAreaMin: 600,
    requiredAreaMax: 1000,
    budgetMin: 60000,
    budgetMax: 100000,
    purpose: '研发中心',
    interestedProperty: 'B1楼整层',
    remarks: '腾讯分公司，对办公环境要求较高'
  },
  {
    name: '华为技术有限公司',
    phone: '13800138003',
    level: '一级',
    industry: '通信设备',
    status: '成交',
    followPerson: '王经理',
    contactPhone: '13900139003',
    requiredAreaMin: 400,
    requiredAreaMax: 600,
    budgetMin: 40000,
    budgetMax: 60000,
    purpose: '销售办公',
    interestedProperty: 'C1楼801-810',
    remarks: '通信设备领域知名企业'
  },
  {
    name: '美团网络科技',
    phone: '13800138004',
    level: '二级',
    industry: '电子商务',
    status: '意向',
    followPerson: '陈经理',
    contactPhone: '13900139004',
    requiredAreaMin: 200,
    requiredAreaMax: 400,
    budgetMin: 20000,
    budgetMax: 40000,
    purpose: '客服中心',
    interestedProperty: 'D1楼501-506',
    remarks: '外卖平台，需要大量客服工位'
  },
  {
    name: '字节跳动科技',
    phone: '13800138005',
    level: '一级',
    industry: '互联网科技',
    status: '意向',
    followPerson: '刘经理',
    contactPhone: '13900139005',
    requiredAreaMin: 800,
    requiredAreaMax: 1200,
    budgetMin: 80000,
    budgetMax: 120000,
    purpose: '创意办公',
    interestedProperty: 'A2楼全层',
    remarks: '短视频领域独角兽企业，需要创意办公空间'
  },
  {
    name: '小米科技有限公司',
    phone: '13800138006',
    level: '一级',
    industry: '智能硬件',
    status: '成交',
    followPerson: '赵经理',
    contactPhone: '13900139006',
    requiredAreaMin: 300,
    requiredAreaMax: 500,
    budgetMin: 30000,
    budgetMax: 50000,
    purpose: '产品展示',
    interestedProperty: 'B2楼601-608',
    remarks: '智能手机和生态链产品展示中心'
  },
  {
    name: '滴滴出行科技',
    phone: '13800138007',
    level: '二级',
    industry: '互联网出行',
    status: '意向',
    followPerson: '孙经理',
    contactPhone: '13900139007',
    requiredAreaMin: 250,
    requiredAreaMax: 400,
    budgetMin: 25000,
    budgetMax: 40000,
    purpose: '运营中心',
    interestedProperty: 'C2楼701-706',
    remarks: '网约车平台，需要24小时运营空间'
  },
  {
    name: '京东物流集团',
    phone: '13800138008',
    level: '二级',
    industry: '物流仓储',
    status: '成交',
    followPerson: '周经理',
    contactPhone: '13900139008',
    requiredAreaMin: 150,
    requiredAreaMax: 300,
    budgetMin: 15000,
    budgetMax: 30000,
    purpose: '配送中心',
    interestedProperty: 'D2楼401-404',
    remarks: '电商物流，需要货物暂存区域'
  },
  {
    name: '百度在线网络',
    phone: '13800138009',
    level: '一级',
    industry: '人工智能',
    status: '意向',
    followPerson: '吴经理',
    contactPhone: '13900139009',
    requiredAreaMin: 400,
    requiredAreaMax: 700,
    budgetMin: 45000,
    budgetMax: 70000,
    purpose: 'AI研发',
    interestedProperty: 'A1楼1201-1210',
    remarks: '人工智能领域领军企业，需要高端研发环境'
  },
  {
    name: '网易游戏娱乐',
    phone: '13800138010',
    level: '二级',
    industry: '游戏娱乐',
    status: '成交',
    followPerson: '郑经理',
    contactPhone: '13900139010',
    requiredAreaMin: 200,
    requiredAreaMax: 350,
    budgetMin: 22000,
    budgetMax: 35000,
    purpose: '游戏开发',
    interestedProperty: 'B1楼901-905',
    remarks: '游戏开发工作室，需要安静的开发环境'
  }
];

// 初始化客户数据
async function initKeHuData() {
  try {
    // 清空现有数据
    await KeHu.deleteMany({});
    console.log('已清空现有客户数据');

    // 插入测试数据
    const result = await KeHu.insertMany(kehuData);
    console.log(`成功插入 ${result.length} 条客户数据`);

    // 输出插入的数据
    console.log('插入的客户数据:');
    result.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} - ${customer.level} - ${customer.status}`);
    });

  } catch (error) {
    console.error('初始化客户数据失败:', error);
  } finally {
    // 关闭数据库连接
    mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 执行初始化
initKeHuData(); 