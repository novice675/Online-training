const ZuHuXinXi = require('../models/ZuHuXinXi');
require('../db/index'); // 连接数据库

/**
 * 初始化租户信息表
 * 插入10条测试数据
 */
async function initZuHuXinXi() {
  try {
    console.log('开始初始化租户信息表...');
    
    // 检查是否已有数据
    const count = await ZuHuXinXi.countDocuments();
    if (count > 0) {
      console.log(`✓ 租户信息表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 生成测试数据
    const testTenants = [
      {
        name: '北京科技创新有限公司',
        louyu: 'A座',
        fangjian: 'A101',
        fuzerenName: '张伟',
        lianxiFangshi: '13800138001',
        suoshuHangye: '软件和信息技术服务业',
        qiyeGuimo: '中型',
        zhucezijin: 5000000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 50000000,
        qiyeLogo: 'uploads/logos/bjkj_logo.png',
        jiaFangTouXiang: 'uploads/avatars/zhangwei_avatar.jpg',
        fuzeren: {
          name: '张伟',
          xingbie: '男',
          lianxiFangshi: '13800138001'
        },
        hetongBianhao: 'HT2024001',
        status: '正常'
      },
      {
        name: '上海智慧商贸集团',
        louyu: 'B座',
        fangjian: 'B205',
        fuzerenName: '李娜',
        lianxiFangshi: '13900139002',
        suoshuHangye: '批发和零售业',
        qiyeGuimo: '大型',
        zhucezijin: 15000000,
        shifoGaoxin: '否',
        shifouShangshi: '是',
        qiyeGuzhi: 200000000,
        qiyeLogo: 'uploads/logos/shzh_logo.png',
        jiaFangTouXiang: 'uploads/avatars/lina_avatar.jpg',
        fuzeren: {
          name: '李娜',
          xingbie: '女',
          lianxiFangshi: '13900139002'
        },
        hetongBianhao: 'HT2024002',
        status: '正常'
      },
      {
        name: '深圳互联网科技',
        louyu: 'C座',
        fangjian: 'C302',
        fuzerenName: '王强',
        lianxiFangshi: '13700137003',
        suoshuHangye: '互联网和相关服务',
        qiyeGuimo: '中型',
        zhucezijin: 8000000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 80000000,
        qiyeLogo: 'uploads/logos/szhl_logo.png',
        jiaFangTouXiang: 'uploads/avatars/wangqiang_avatar.jpg',
        fuzeren: {
          name: '王强',
          xingbie: '男',
          lianxiFangshi: '13700137003'
        },
        hetongBianhao: 'HT2024003',
        status: '正常'
      },
      {
        name: '广州文化传媒工作室',
        louyu: 'A座',
        fangjian: 'A408',
        fuzerenName: '陈美玲',
        lianxiFangshi: '13600136004',
        suoshuHangye: '文化、体育和娱乐业',
        qiyeGuimo: '小型',
        zhucezijin: 1000000,
        shifoGaoxin: '否',
        shifouShangshi: '否',
        qiyeGuzhi: 5000000,
        qiyeLogo: 'uploads/logos/gzwh_logo.png',
        jiaFangTouXiang: 'uploads/avatars/chenmeiling_avatar.jpg',
        fuzeren: {
          name: '陈美玲',
          xingbie: '女',
          lianxiFangshi: '13600136004'
        },
        hetongBianhao: 'HT2024004',
        status: '正常'
      },
      {
        name: '杭州电子商务有限公司',
        louyu: 'B座',
        fangjian: 'B501',
        fuzerenName: '刘建国',
        lianxiFangshi: '13500135005',
        suoshuHangye: '电子商务',
        qiyeGuimo: '中型',
        zhucezijin: 3000000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 25000000,
        qiyeLogo: 'uploads/logos/hzdz_logo.png',
        jiaFangTouXiang: 'uploads/avatars/liujianguo_avatar.jpg',
        fuzeren: {
          name: '刘建国',
          xingbie: '男',
          lianxiFangshi: '13500135005'
        },
        hetongBianhao: 'HT2024005',
        status: '正常'
      },
      {
        name: '成都人工智能研究院',
        louyu: 'C座',
        fangjian: 'C601',
        fuzerenName: '赵敏',
        lianxiFangshi: '13400134006',
        suoshuHangye: '科学研究和技术服务业',
        qiyeGuimo: '大型',
        zhucezijin: 20000000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 150000000,
        qiyeLogo: 'uploads/logos/cdrg_logo.png',
        jiaFangTouXiang: 'uploads/avatars/zhaomin_avatar.jpg',
        fuzeren: {
          name: '赵敏',
          xingbie: '女',
          lianxiFangshi: '13400134006'
        },
        hetongBianhao: 'HT2024006',
        status: '正常'
      },
      {
        name: '武汉生物科技企业',
        louyu: 'A座',
        fangjian: 'A703',
        fuzerenName: '孙涛',
        lianxiFangshi: '13300133007',
        suoshuHangye: '医药制造业',
        qiyeGuimo: '中型',
        zhucezijin: 12000000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 100000000,
        qiyeLogo: 'uploads/logos/whsw_logo.png',
        jiaFangTouXiang: 'uploads/avatars/suntao_avatar.jpg',
        fuzeren: {
          name: '孙涛',
          xingbie: '男',
          lianxiFangshi: '13300133007'
        },
        hetongBianhao: 'HT2024007',
        status: '正常'
      },
      {
        name: '西安新能源技术公司',
        louyu: 'B座',
        fangjian: 'B804',
        fuzerenName: '周丽华',
        lianxiFangshi: '13200132008',
        suoshuHangye: '电力、热力、燃气及水生产和供应业',
        qiyeGuimo: '大型',
        zhucezijin: 25000000,
        shifoGaoxin: '是',
        shifouShangshi: '是',
        qiyeGuzhi: 300000000,
        qiyeLogo: 'uploads/logos/xaxy_logo.png',
        jiaFangTouXiang: 'uploads/avatars/zhoulihua_avatar.jpg',
        fuzeren: {
          name: '周丽华',
          xingbie: '女',
          lianxiFangshi: '13200132008'
        },
        hetongBianhao: 'HT2024008',
        status: '正常'
      },
      {
        name: '南京智能制造工厂',
        louyu: 'C座',
        fangjian: 'C905',
        fuzerenName: '吴刚',
        lianxiFangshi: '13100131009',
        suoshuHangye: '制造业',
        qiyeGuimo: '特大型',
        zhucezijin: 50000000,
        shifoGaoxin: '是',
        shifouShangshi: '是',
        qiyeGuzhi: 500000000,
        qiyeLogo: 'uploads/logos/njzn_logo.png',
        jiaFangTouXiang: 'uploads/avatars/wugang_avatar.jpg',
        fuzeren: {
          name: '吴刚',
          xingbie: '男',
          lianxiFangshi: '13100131009'
        },
        hetongBianhao: 'HT2024009',
        status: '正常'
      },
      {
        name: '重庆区块链技术工作室',
        louyu: 'A座',
        fangjian: 'A1001',
        fuzerenName: '许晓燕',
        lianxiFangshi: '13000130010',
        suoshuHangye: '软件和信息技术服务业',
        qiyeGuimo: '小型',
        zhucezijin: 800000,
        shifoGaoxin: '是',
        shifouShangshi: '否',
        qiyeGuzhi: 8000000,
        qiyeLogo: 'uploads/logos/cqql_logo.png',
        jiaFangTouXiang: 'uploads/avatars/xuxiaoyan_avatar.jpg',
        fuzeren: {
          name: '许晓燕',
          xingbie: '女',
          lianxiFangshi: '13000130010'
        },
        hetongBianhao: 'HT2024010',
        status: '正常'
      }
    ];

    // 批量插入数据
    const result = await ZuHuXinXi.insertMany(testTenants);
    console.log(`✓ 成功插入 ${result.length} 条租户信息数据`);
    
    // 显示插入的数据概览
    console.log('\n插入的租户信息概览:');
    result.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name} - ${tenant.louyu}${tenant.fangjian} - 负责人: ${tenant.fuzerenName}`);
    });
    
  } catch (error) {
    console.error('❌ 初始化租户信息表失败:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initZuHuXinXi()
    .then(() => {
      console.log('\n🎉 租户信息表初始化完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 初始化过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = initZuHuXinXi; 