var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const {News} = require('../models/news')
const socketManager = require('../socket/index')
const AppUser = require('../models/AppUser');


// 获取新闻列表接口
router.get('/news', async (req, res) => {
  try {
    const { page = 1, limit = 10, renderType, tag, channel } = req.query;
    
    // 构建查询条件
    const query = {};
    
    // 如果指定了渲染类型，添加到查询条件
    if (renderType) {
      query.renderType = renderType;
    }
    
    // 如果指定了标签，添加到查询条件
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // 如果指定了频道，添加到查询条件
    if (channel) {
      query.channel = channel;
    }
    
    // 计算跳过的文档数量
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 使用聚合管道进行排序：置顶 > 热点 > 普通文章 > 时间排序
    const news = await News.aggregate([
      { $match: query }, // 应用查询条件
      {
        $lookup: {
          from: 'appUser',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $addFields: {
          authorId: { $arrayElemAt: ['$author', 0] }
        }
      },
      {
        $addFields: {
          // 确保头像URL正确
          "authorId.avatar": {
            $cond: {
              if: { $and: [{ $ne: ["$authorId.avatar", null] }, { $ne: ["$authorId.avatar", ""] }] },
              then: "$authorId.avatar",
              else: "/default-avatar.png" // 默认头像
            }
          }
        }
      },
      {
        $addFields: {
          // 计算优先级：置顶=3，热点=2，普通=1
          priority: {
            $cond: {
              if: { $in: ["置顶", "$tags"] },
              then: 3,
              else: {
                $cond: {
                  if: { $in: ["热点", "$tags"] },
                  then: 2,
                  else: 1
                }
              }
            }
          }
        }
      },
      {
        $sort: {
          priority: -1, // 优先级降序（置顶在前）
          publishTime: -1, // 同优先级按发布时间降序
          createdAt: -1 // 最后按创建时间降序
        }
      },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // 获取总数
    const total = await News.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        list: news,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取新闻列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新闻列表失败',
      error: error.message
    });
  }
});

// 获取单个新闻详情接口
router.get('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const news = await News.findById(id)
      .populate('authorId', 'username nickname avatar')
      .lean();
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: '新闻不存在'
      });
    }
    
    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('获取新闻详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新闻详情失败',
      error: error.message
    });
  }
});

// 发布新闻接口
router.post('/news', async (req, res) => {
  try {
    const {
      title,
      channel,
      renderType,
      authorId,
      rightImage,
      detailContent,
      detailImages = [],
      publishTime,
      likeCount = 0
    } = req.body;

    // 验证必填字段
    if (!title || !channel || !renderType || !authorId || !detailContent) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }

    // 验证作者是否存在
    const author = await AppUser.findById(authorId);
    if (!author) {
      return res.status(400).json({
        success: false,
        message: '作者不存在'
      });
    }

    // 创建新闻
    const news = new News({
      title,
      channel,
      renderType,
      authorId,
      rightImage,
      detailContent,
      detailImages,
      publishTime: publishTime || new Date(),
      likeCount
    });

    const savedNews = await news.save();

    // 通知移动端
    socketManager.notifyArticleCreated({
      title: savedNews.title,
      content: savedNews.detailContent
    });

    res.status(201).json({
      success: true,
      data: {
        _id: savedNews._id
      },
      message: '新闻发布成功'
    });
  } catch (error) {
    console.error('发布新闻失败:', error);
    res.status(500).json({
      success: false,
      message: '发布新闻失败',
      error: error.message
    });
  }
});

// 点赞/取消点赞接口
router.post('/news/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' 或 'unlike'
    
    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的操作类型'
      });
    }
    
    const updateValue = action === 'like' ? 1 : -1;
    
    const news = await News.findByIdAndUpdate(
      id,
      { $inc: { likeCount: updateValue } },
      { new: true }
    ).lean();
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: '新闻不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        likeCount: news.likeCount
      }
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞操作失败',
      error: error.message
    });
  }
});

// 更新用户头像接口
router.put('/user/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: '头像URL不能为空'
      });
    }

    const user = await AppUser.findByIdAndUpdate(
      id,
      { avatar },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        avatar: user.avatar
      },
      message: '头像更新成功'
    });
  } catch (error) {
    console.error('更新头像失败:', error);
    res.status(500).json({
      success: false,
      message: '更新头像失败',
      error: error.message
    });
  }
});

// 获取用户信息接口
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await AppUser.findById(id).lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 确保头像URL正确
    if (!user.avatar || user.avatar === '') {
      user.avatar = '/default-avatar.png';
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
      error: error.message
    });
  }
});

// ==================== 管理端接口 ====================

// 删除单个新闻（管理端使用）
router.delete('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedNews = await News.findByIdAndDelete(id);
    
    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: '新闻不存在'
      });
    }
    
    // 通知移动端
    socketManager.notifyArticleDeleted(id, deletedNews.title);
    
    res.json({
      success: true,
      message: '删除成功',
      data: deletedNews
    });
  } catch (error) {
    console.error('删除新闻失败:', error);
    res.status(500).json({
      success: false,
      message: '删除新闻失败',
      error: error.message
    });
  }
});

// 批量删除新闻（管理端使用）
router.delete('/news/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的新闻ID数组'
      });
    }
    
    const result = await News.deleteMany({ _id: { $in: ids } });
    
    // 通知移动端批量删除
    if (result.deletedCount > 0) {
      socketManager.notifyArticleDeleted('batch', `${result.deletedCount}篇新闻`);
    }
    
    res.json({
      success: true,
      message: `成功删除${result.deletedCount}条新闻`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('批量删除新闻失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除新闻失败',
      error: error.message
    });
  }
});

// 管理端获取新闻列表（支持更多筛选条件）
router.get('/admin/news', async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 10, 
      title, 
      articleType, 
      channel, 
      status,
      renderType, 
      tag 
    } = req.query;
    
    // 兼容前端的 size 参数
    const pageSize = size
    
    // 构建查询条件
    const query = {};
    
    // 按标题模糊搜索
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    // 按文章类型筛选
    if (articleType) {
      query.articleType = articleType;
    }
    
    // 按频道筛选
    if (channel) {
      query.channel = channel;
    }
    
    // 按审核状态筛选
    if (status) {
      query.status = status;
    }
    
    // 按渲染类型筛选
    if (renderType) {
      query.renderType = renderType;
    }
    
    // 按标签筛选
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // 计算跳过的文档数量
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    
    // 查询新闻数据，并关联作者信息
    const news = await News.find(query)
      .populate('authorId', 'username avatar') // 关联作者信息
      .sort({ publishTime: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();
    
    console.log('📋 [后端] 管理端新闻列表查询结果样例:', news.length > 0 ? {
      title: news[0].title,
      authorId: news[0].authorId,
      hasAuthor: !!news[0].authorId
    } : '无数据');
    
    // 获取总数
    const total = await News.countDocuments(query);
    
    res.json({
      code: 200,
      msg: '获取成功',
      data: news,
      total: total,
      pagination: {
        page: parseInt(page),
        size: parseInt(pageSize),
        total,
        pages: Math.ceil(total / parseInt(pageSize))
      }
    });
  } catch (error) {
    console.error('获取新闻列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取新闻列表失败',
      error: error.message
    });
  }
});

// 管理端获取单个新闻详情（管理端使用）
router.get('/admin/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 [后端] 获取文章详情，ID:', id);
    
    // 验证ID格式
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ [后端] ID格式无效:', id);
      return res.status(400).json({
        code: 400,
        msg: 'ID格式无效'
      });
    }
    
    const news = await News.findById(id)
      .populate('authorId', 'username avatar') // 关联作者信息
      .lean();
    
    if (!news) {
      console.log('❌ [后端] 文章不存在，ID:', id);
      return res.status(404).json({
        code: 404,
        msg: '文章不存在'
      });
    }
    
    console.log('✅ [后端] 文章详情获取成功，标题:', news.title);
    res.json({
      code: 200,
      msg: '获取成功',
      data: news
    });
  } catch (error) {
    console.error('❌ [后端] 获取文章详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取新闻详情失败',
      error: error.message
    });
  }
});

// 更新新闻审核状态（管理端使用）
router.put('/admin/news/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remark } = req.body;
    
    // 验证状态值
    const validStatuses = ['未审核', '审核成功', '审核失败'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        msg: '无效的审核状态'
      });
    }
    
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    // 如果有审核备注，添加到更新数据中
    if (remark) {
      updateData.auditRemark = remark;
    }
    
    const updatedNews = await News.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedNews) {
      return res.status(404).json({
        code: 404,
        msg: '新闻不存在'
      });
    }
    
    res.json({
      code: 200,
      msg: '审核状态更新成功',
      data: updatedNews
    });
  } catch (error) {
    console.error('更新审核状态失败:', error);
    res.status(500).json({
      code: 500,
      msg: '更新审核状态失败',
      error: error.message
    });
  }
});


module.exports = router;