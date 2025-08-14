const mongoose = require('../db/index');
const { News } = require('../models/news');
const AppUser = require('../models/AppUser');

async function initNewsData() {
  try {
    console.log('开始初始化新闻数据...');

    // 检查是否已有新闻数据
    const newsCount = await News.countDocuments();
    if (newsCount > 0) {
      console.log(`✓ 新闻表已有 ${newsCount} 条数据，跳过初始化`);
      return;
    }

    // 获取一个用户作为作者
    const author = await AppUser.findOne();
    if (!author) {
      console.log('⚠️ 未找到用户，请先初始化用户数据');
      return;
    }

    console.log(`✓ 使用用户 ${author.username} 作为作者`);

    // 测试新闻数据
    const testNews = [
      {
        title: '科尔：库里是我们队的魔术师约翰逊和邓肯',
        channel: '推荐',
        renderType: 'IMAGE_RIGHT',
        authorId: author._id,
        rightImage: '/images/1.png',
        detailContent: '勇士队主教练史蒂夫·科尔在接受采访时表示，斯蒂芬·库里对于勇士队的重要性，就像魔术师约翰逊对于湖人队和蒂姆·邓肯对于马刺队一样。库里不仅是一位伟大的球员，更是球队文化的象征和领袖。',
        detailImages: ['/images/2.png', '/images/3.png'],
        publishTime: new Date(),
        likeCount: 156
      },
      {
        title: '智慧校园管理系统正式上线',
        channel: '政策',
        renderType: 'TEXT_ONLY',
        authorId: author._id,
        detailContent: '经过数月的精心开发和测试，我校智慧校园管理系统今日正式上线运行。系统将为师生提供更便捷的校园服务，包括课程管理、成绩查询、校园卡服务等功能。',
        publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
        likeCount: 89
      },
      {
        title: '数字化转型成果展示',
        channel: '推荐',
        renderType: 'IMAGE_FULL',
        authorId: author._id,
        coverImage: '/images/4.png',
        detailContent: '本视频详细展示了我校数字化转型的各项成果，包括智慧教学、智慧管理、智慧服务等多个方面的创新应用。通过数字化转型，我们实现了教学效率的提升和管理流程的优化。',
        detailImages: ['/images/5.png', '/images/6.png'],
        publishTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
        likeCount: 234
      }
    ];

    // 插入测试数据
    await News.insertMany(testNews);
    console.log(`✓ 成功插入 ${testNews.length} 条新闻数据`);

    console.log('✓ 新闻数据初始化完成');
  } catch (error) {
    console.error('❌ 新闻数据初始化失败:', error);
  }
}

// 运行初始化
initNewsData(); 