const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb+srv://mariadigo45566:sJj2QDWGxaBpltgW@cluster0.ke8hvn6.mongodb.net/OnlineTraining')
  .then(() => {
    console.log('数据库连接成功');
    initCommentData();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });

// 评论模型定义
const pingSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ping',
    default: null
  },
  replyToUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AppUser',
    default: null
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'Ping'
});

const Ping = mongoose.model('Ping', pingSchema);

// AppUser模型
const AppUser = mongoose.model('AppUser', new mongoose.Schema({
  username: String,
  phone: String,
  password: String,
  nickname: String,
  avatar: String
}, { collection: 'appUser' }));

// News模型
const News = mongoose.model('News', new mongoose.Schema({
  title: String,
  articleType: String,
  channel: String,
  status: String
}, { collection: 'news' }));

// 生成评论数据
async function initCommentData() {
  try {
    console.log('开始初始化评论数据...');
    
    // 获取所有用户和文章
    const users = await AppUser.find({});
    const articles = await News.find({});
    
    if (users.length === 0) {
      console.error('没有找到用户数据，请先运行 initAppUserData.js');
      return;
    }
    
    if (articles.length === 0) {
      console.error('没有找到文章数据，请先确保有文章数据');
      return;
    }
    
    console.log(`找到 ${users.length} 个用户，${articles.length} 篇文章`);
    
    // 清空现有评论数据
    await Ping.deleteMany({});
    console.log('已清空现有评论数据');
    
    const allComments = [];
    let commentIdCounter = 1;
    
    // 为每篇文章生成评论
    for (const article of articles) {
      const commentCount = Math.floor(Math.random() * 8) + 3; // 每篇文章3-10条评论
      console.log(`为文章《${article.title}》生成 ${commentCount} 条评论...`);
      
      const articleComments = [];
      
      // 生成主评论（楼层）
      const mainCommentCount = Math.floor(commentCount * 0.7); // 70%是主评论
      
      for (let floor = 1; floor <= mainCommentCount; floor++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        const mainComment = {
          content: getRandomMainComment(floor),
          userId: randomUser._id,
          articleId: article._id,
          parentId: null,
          replyToUserId: null,
          likeCount: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 最近7天内随机时间
          updatedAt: new Date()
        };
        
        articleComments.push(mainComment);
        allComments.push(mainComment);
      }
      
      // 生成回复评论
      const replyCount = commentCount - mainCommentCount;
      
      for (let i = 0; i < replyCount; i++) {
        // 随机选择一个主评论进行回复
        const parentComment = articleComments[Math.floor(Math.random() * articleComments.length)];
        const replyUser = users[Math.floor(Math.random() * users.length)];
        const parentUser = users.find(u => u._id.toString() === parentComment.userId.toString());
        
        const replyComment = {
          content: getRandomReplyComment(parentUser?.nickname || parentUser?.username),
          userId: replyUser._id,
          articleId: article._id,
          parentId: parentComment._id || new mongoose.Types.ObjectId(), // 临时ID，稍后更新
          replyToUserId: parentComment.userId,
          likeCount: Math.floor(Math.random() * 10),
          createdAt: new Date(parentComment.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000), // 在主评论之后
          updatedAt: new Date()
        };
        
        allComments.push(replyComment);
      }
    }
    
    console.log(`准备插入 ${allComments.length} 条评论...`);
    
    // 分批插入评论数据
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < allComments.length; i += batchSize) {
      const batch = allComments.slice(i, i + batchSize);
      const result = await Ping.insertMany(batch);
      insertedCount += result.length;
      console.log(`已插入 ${insertedCount}/${allComments.length} 条评论`);
    }
    
    // 更新回复评论的parentId（使用真实的MongoDB ObjectId）
    console.log('正在更新回复评论的关联关系...');
    const allInsertedComments = await Ping.find({}).populate('userId', 'nickname username');
    
    let updateCount = 0;
    for (const comment of allInsertedComments) {
      if (comment.parentId && comment.replyToUserId) {
        // 找到对应的父评论
        const parentComment = allInsertedComments.find(c => 
          c.articleId.toString() === comment.articleId.toString() && 
          c.userId.toString() === comment.replyToUserId.toString() && 
          !c.parentId // 确保是主评论
        );
        
        if (parentComment && parentComment._id.toString() !== comment.parentId.toString()) {
          await Ping.findByIdAndUpdate(comment._id, { parentId: parentComment._id });
          updateCount++;
        }
      }
    }
    
    console.log(`已更新 ${updateCount} 条回复评论的关联关系`);
    
    // 统计结果
    const finalStats = await Ping.aggregate([
      {
        $group: {
          _id: '$articleId',
          totalComments: { $sum: 1 },
          mainComments: { 
            $sum: { $cond: [{ $eq: ['$parentId', null] }, 1, 0] }
          },
          replyComments: { 
            $sum: { $cond: [{ $ne: ['$parentId', null] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'news',
          localField: '_id',
          foreignField: '_id',
          as: 'article'
        }
      },
      {
        $unwind: '$article'
      },
      {
        $project: {
          articleTitle: '$article.title',
          totalComments: 1,
          mainComments: 1,
          replyComments: 1
        }
      }
    ]);
    
    console.log('\n=== 评论数据统计 ===');
    finalStats.forEach((stat, index) => {
      console.log(`${index + 1}. 《${stat.articleTitle}》`);
      console.log(`   总评论: ${stat.totalComments} 条`);
      console.log(`   主评论(楼层): ${stat.mainComments} 条`);
      console.log(`   回复评论: ${stat.replyComments} 条`);
      console.log('');
    });
    
    const totalComments = finalStats.reduce((sum, stat) => sum + stat.totalComments, 0);
    console.log(`✅ 评论数据初始化完成！总共生成了 ${totalComments} 条评论`);
    
  } catch (error) {
    console.error('初始化评论数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('数据库连接已关闭');
  }
}

// 生成随机主评论内容
function getRandomMainComment(floor) {
  const mainComments = [
    '这篇文章写得很不错，学到了很多东西！',
    '感谢分享，很有价值的内容。',
    '观点很独到，给了我新的思路。',
    '内容很实用，已经收藏了。',
    '写得很详细，对我帮助很大。',
    '角度很新颖，值得深思。',
    '分析得很透彻，赞一个！',
    '这个话题很有意思，期待更多相关内容。',
    '作者功底深厚，文章质量很高。',
    '内容很全面，覆盖面广。',
    '逻辑清晰，条理分明。',
    '很有启发性，推荐大家看看。',
    '数据很详实，说服力强。',
    '观察很敏锐，分析到位。',
    '这个观点我很认同。',
    '写得很客观，没有偏见。',
    '内容很前沿，紧跟时代。',
    '实例很生动，容易理解。',
    '总结得很好，要点突出。',
    '这是我看过最好的相关文章之一。'
  ];
  
  return mainComments[Math.floor(Math.random() * mainComments.length)];
}

// 生成随机回复评论内容
function getRandomReplyComment(replyToName) {
  const replyComments = [
    `@${replyToName} 说得很对，我也是这么想的。`,
    `@${replyToName} 你的观点很有意思，能详细说说吗？`,
    `@${replyToName} 同意你的看法，确实如此。`,
    `@${replyToName} 这个角度我没想到，受教了。`,
    `@${replyToName} 有道理，但我觉得还有另一种可能。`,
    `@${replyToName} 感谢分享你的经验！`,
    `@${replyToName} 你说的这点很关键。`,
    `@${replyToName} 我也遇到过类似的情况。`,
    `@${replyToName} 能推荐一些相关资料吗？`,
    `@${replyToName} 这个建议很实用。`,
    `@${replyToName} 我觉得可以从这个方向思考。`,
    `@${replyToName} 你的分析很到位。`,
    `@${replyToName} 这确实是个值得关注的问题。`,
    `@${replyToName} 我也有同样的疑问。`,
    `@${replyToName} 谢谢解答，很有帮助。`
  ];
  
  return replyComments[Math.floor(Math.random() * replyComments.length)];
}

// 处理进程退出
process.on('SIGINT', () => {
  mongoose.connection.close();
  console.log('\n数据库连接已关闭');
  process.exit(0);
}); 