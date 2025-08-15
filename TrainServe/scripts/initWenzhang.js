const { Wenzhang } = require('../models/Wenzhang');
require('../db/index'); // 连接数据库

/**
 * 初始化文章表
 * 插入测试数据
 */
async function initWenzhang() {
  try {
    console.log('开始初始化文章表...');
    
    // 检查是否已有数据
    const count = await Wenzhang.countDocuments();
    if (count > 0) {
      console.log(`✓ 文章表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 生成50+条测试数据
    const testArticles = [];
    
    const titles = [
      '智慧校园管理系统上线通知', '校园数字化转型成果展示', '教务管理系统操作指南', '校园安全防护知识讲座',
      '新学期开学工作安排', '学生宿舍管理新规定', '图书馆数字化改造完成', '校园网络升级公告',
      '疫情防控工作要求', '学生社团活动通知', '教师培训工作安排', '校园食堂菜品更新',
      '体育设施维护公告', '学术讲座系列活动', '毕业生就业指导', '新生入学须知',
      '考试安排及注意事项', '校园文化节活动预告', '科研项目申报通知', '学生奖学金评选',
      '教室设备使用指南', '停车场管理规定', '校园绿化美化工程', '实验室安全培训',
      '国际交流项目介绍', '创新创业大赛通知', '心理健康教育讲座', '校园招聘会安排',
      '图书借阅服务升级', '学生评教工作启动', '校园志愿服务活动', '节能减排倡议书',
      '校园一卡通使用说明', '医务室服务时间调整', '校园巴士运行时刻表', '学生请假制度说明',
      '教学楼开放时间通知', '校园垃圾分类指南', '学生活动中心介绍', '校园咖啡厅新品推荐',
      '学生宿舍网络维护', '校园超市营业时间', '体育馆活动安排', '音乐厅演出预告',
      '美术展览活动通知', '校园摄影大赛', '学生干部选举公告', '社会实践活动安排',
      '校园快递服务指南', '学生保险办理须知', '校园APP功能介绍', '在线学习平台使用教程'
    ];
    
    const channels = ['今日热点', '推荐'];
    const types = ['图文', '视频', '音频'];
    const statuses = ['已发布', '草稿', '已下线'];
    const keywords = [
      '校园,管理,通知', '数字化,教学,科技', '学生,服务,指南', '安全,防护,教育',
      '活动,文化,社团', '教务,系统,操作', '图书馆,学习,资源', '网络,技术,升级',
      '健康,医疗,服务', '体育,运动,健身', '艺术,文化,展览', '创新,创业,竞赛',
      '就业,职业,指导', '学术,研究,讲座', '生活,服务,便民', '环保,节能,倡议'
    ];
    
    const summaries = [
      '为提升校园管理效率，优化师生体验', '推进数字化校园建设，提供便民服务',
      '加强校园安全管理，保障师生安全', '丰富校园文化生活，促进全面发展',
      '完善教学服务体系，提高教学质量', '优化后勤保障服务，改善生活条件',
      '推广绿色环保理念，建设美丽校园', '加强学术交流合作，提升科研水平'
    ];
    
    // 生成50条测试数据
    for (let i = 0; i < 52; i++) {
      const randomTitle = titles[i % titles.length] + (i > titles.length - 1 ? ` ${Math.floor(i / titles.length) + 1}` : '');
      const randomChannel = channels[Math.floor(Math.random() * channels.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomKeywords = keywords[Math.floor(Math.random() * keywords.length)];
      const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
      
      // 随机日期（最近30天内）
      const randomDays = Math.floor(Math.random() * 30);
      const publishDate = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
      
      testArticles.push({
        title: randomTitle,
        channel: randomChannel,
        type: randomType,
        keywords: randomKeywords,
        summary: randomSummary,
        content: `<h2>${randomTitle}</h2><p>${randomSummary}。</p><p>详细内容正在完善中，敬请关注后续更新。</p>`,
        author_id: '507f1f77bcf86cd799439011',
        status: randomStatus,
        published_at: randomStatus === '已发布' ? publishDate : null,
        created_at: publishDate,
        view_count: Math.floor(Math.random() * 500) + 10,
        like_count: Math.floor(Math.random() * 50) + 1,
        comment_count: Math.floor(Math.random() * 20)
      });
    }

    await Wenzhang.insertMany(testArticles);
    console.log(`✓ 成功插入 ${testArticles.length} 条测试数据`);

    // 显示统计信息
    const channelStats = await Wenzhang.aggregate([
      { $group: { _id: '$channel', count: { $sum: 1 } } }
    ]);

    const typeStats = await Wenzhang.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 数据统计:');
    console.log('按频道统计:');
    channelStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 篇`);
    });

    console.log('按类型统计:');
    typeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} 篇`);
    });

    console.log('\n✅ 文章表初始化完成！');
    
  } catch (error) {
    console.error('❌ 文章表初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initWenzhang()
    .then(() => {
      console.log('初始化完成，即将退出...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
}

module.exports = initWenzhang; 