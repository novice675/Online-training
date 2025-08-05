const sequelize = require('../db/index');
const Article = require('../models/Wenzhang');

/**
 * 初始化文章表
 * 创建表结构并插入测试数据
 */
async function initArticle() {
  try {
    console.log('开始初始化文章表...');
    
    // 创建表（如果不存在）
    await Article.sync({ force: false });
    console.log('✓ 文章表创建成功');

    // 检查是否已有数据
    const count = await Article.count();
    if (count > 0) {
      console.log(`✓ 文章表已有 ${count} 条数据，跳过测试数据插入`);
      return;
    }

    // 插入测试数据
    const testArticles = [
      {
        title: '智慧校园管理系统上线通知',
        channel: 'hot_today',
        type: 'article',
        keywords: '智慧校园,系统,通知',
        summary: '我校智慧校园管理系统正式上线，为师生提供更便捷的校园服务。',
        content: `
          <h2>智慧校园管理系统正式上线</h2>
          <p>经过数月的精心开发和测试，我校智慧校园管理系统今日正式上线运行。</p>
          <h3>主要功能包括：</h3>
          <ul>
            <li>运营管理：内容发布、招商管理、租户管理</li>
            <li>物业管理：访客管理、车辆管理、设备管理</li>
            <li>数据可视：实时数据展示和分析</li>
            <li>配置中心：系统配置和用户管理</li>
          </ul>
          <p>欢迎全校师生使用！</p>
        `,
        author_id: 1,
        status: 'published',
        published_at: new Date(),
        view_count: 156,
        like_count: 23,
        comment_count: 8
      },
      {
        title: '校园数字化转型成果展示',
        channel: 'recommended',
        type: 'video',
        keywords: '数字化,转型,成果',
        summary: '展示我校在数字化转型方面取得的显著成果和创新实践。',
        content: `
          <h2>数字化转型成果</h2>
          <p>本视频详细展示了我校数字化转型的各项成果。</p>
          <p>包括智慧教学、智慧管理、智慧服务等多个方面的创新应用。</p>
        `,
        author_id: 1,
        status: 'published',
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
        view_count: 89,
        like_count: 15,
        comment_count: 5
      },
      {
        title: '教务管理系统操作指南',
        channel: 'recommended',
        type: 'article',
        keywords: '教务,管理,指南,操作',
        summary: '详细介绍教务管理系统的各项功能和操作流程，帮助用户快速上手。',
        content: `
          <h2>教务管理系统操作指南</h2>
          <h3>1. 登录系统</h3>
          <p>使用学号/工号和密码登录系统。</p>
          <h3>2. 功能导航</h3>
          <p>系统主要功能分为四大模块...</p>
          <h3>3. 常见问题</h3>
          <p>Q: 忘记密码怎么办？</p>
          <p>A: 可通过"忘记密码"功能重置...</p>
        `,
        author_id: 1,
        status: 'draft',
        view_count: 12,
        like_count: 2,
        comment_count: 1
      },
      {
        title: '校园安全防护知识讲座',
        channel: 'hot_today',
        type: 'audio',
        keywords: '安全,防护,讲座,知识',
        summary: '邀请安全专家为师生讲解校园安全防护知识，提高安全意识。',
        content: `
          <h2>校园安全防护知识讲座</h2>
          <p>本次音频讲座由安全专家主讲，内容包括：</p>
          <ul>
            <li>校园安全基本常识</li>
            <li>紧急情况应对措施</li>
            <li>个人防护技能</li>
            <li>安全设备使用方法</li>
          </ul>
          <p>讲座时长约30分钟，建议全体师生收听。</p>
        `,
        author_id: 1,
        status: 'published',
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
        view_count: 234,
        like_count: 45,
        comment_count: 12
      }
    ];

    await Article.bulkCreate(testArticles);
    console.log(`✓ 成功插入 ${testArticles.length} 条测试数据`);

    // 显示统计信息
    const channelStats = await Article.findAll({
      attributes: [
        'channel',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['channel']
    });

    const typeStats = await Article.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    console.log('\n📊 数据统计:');
    console.log('按频道统计:');
    channelStats.forEach(stat => {
      const label = Article.CHANNEL_LABELS[stat.channel] || stat.channel;
      console.log(`  ${label}: ${stat.dataValues.count} 篇`);
    });

    console.log('按类型统计:');
    typeStats.forEach(stat => {
      const label = Article.TYPE_LABELS[stat.type] || stat.type;
      console.log(`  ${label}: ${stat.dataValues.count} 篇`);
    });

    console.log('\n✅ 文章表初始化完成！');
    
  } catch (error) {
    console.error('❌ 文章表初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initArticle()
    .then(() => {
      console.log('初始化完成，即将退出...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
}

module.exports = initArticle; 