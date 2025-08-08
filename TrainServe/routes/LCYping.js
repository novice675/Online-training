var express = require('express');
var router = express.Router();
const { Comments } = require('../models/Comment');
const AppUser = require('../models/AppUser');

// 获取新闻评论列表
router.get('/news/:newsId/comments', async (req, res) => {
  try {
    const { newsId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;
    
    // 构建查询条件
    const query = {
      newsId: newsId
    };
    
    // 只获取根评论（楼主）
    query.parentId = null;
    
    // 计算跳过的文档数量
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建排序条件
    let sortCondition = {};
    switch (sort) {
      case 'newest':
        sortCondition = { createdAt: -1 };
        break;
      case 'oldest':
        sortCondition = { createdAt: 1 };
        break;
      case 'hot':
        sortCondition = { replyCount: -1, likeCount: -1, createdAt: -1 };
        break;
      default:
        sortCondition = { createdAt: -1 };
    }
    
    // 获取根评论列表，并关联用户信息
    const rootComments = await Comments.find(query)
      .populate('userId', 'username avatar')
      .sort(sortCondition)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 为每个根评论获取回复列表
    const commentsWithReplies = await Promise.all(
      rootComments.map(async (comment) => {
        // 获取该评论的所有回复，并关联用户信息
        const replies = await Comments.find({
          rootId: comment._id
        })
        .populate('userId', 'username avatar')
        .sort({ createdAt: 1 })
        .lean();
        
        return {
          ...comment,
          replies,
          replyCount: replies.length
        };
      })
    );
    
    // 获取总数
    const total = await Comments.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        list: commentsWithReplies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取评论列表失败',
      error: error.message
    });
  }
});

// 获取评论的回复列表
router.get('/comments/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const replies = await Comments.find({
      rootId: commentId
    })
    .populate('userId', 'username avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
    
    const total = await Comments.countDocuments({
      rootId: commentId
    });
    
    res.json({
      success: true,
      data: {
        list: replies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取回复列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取回复列表失败',
      error: error.message
    });
  }
});

// 发布评论（楼主）
router.post('/news/:newsId/comments', async (req, res) => {
  try {
    const { newsId } = req.params;
    const { content, userId } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({
        success: false,
        message: '评论内容和用户ID不能为空'
      });
    }
    
    // 验证用户是否存在
    const user = await AppUser.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取当前楼层号
    const floorCount = await Comments.countDocuments({
      newsId: newsId,
      parentId: null
    });
    
    const comment = new Comments({
      newsId,
      content,
      userId,
      floor: floorCount + 1,
      parentId: null,
      rootId: null
    });
    
    await comment.save();
    
    // 返回时关联用户信息
    const savedComment = await Comments.findById(comment._id)
      .populate('userId', 'username avatar');
    
    res.json({
      success: true,
      data: savedComment
    });
  } catch (error) {
    console.error('发布评论失败:', error);
    res.status(500).json({
      success: false,
      message: '发布评论失败',
      error: error.message
    });
  }
});

// 回复评论
router.post('/comments/:commentId/replies', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, userId, replyToAuthor } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({
        success: false,
        message: '回复内容和用户ID不能为空'
      });
    }
    
    // 验证用户是否存在
    const user = await AppUser.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取父评论信息
    const parentComment = await Comments.findById(commentId)
      .populate('userId', 'username');
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: '父评论不存在'
      });
    }
    
    // 确定根评论ID
    const rootId = parentComment.rootId || parentComment._id;
    
    const reply = new Comments({
      newsId: parentComment.newsId,
      content,
      userId,
      parentId: commentId,
      rootId: rootId,
      replyTo: commentId,
      replyToAuthor: replyToAuthor || parentComment.userId.username
    });
    
    await reply.save();
    
    // 更新父评论的回复数
    await Comments.findByIdAndUpdate(commentId, {
      $inc: { replyCount: 1 }
    });
    
    // 返回时关联用户信息
    const savedReply = await Comments.findById(reply._id)
      .populate('userId', 'username avatar');
    
    res.json({
      success: true,
      data: savedReply
    });
  } catch (error) {
    console.error('回复评论失败:', error);
    res.status(500).json({
      success: false,
      message: '回复评论失败',
      error: error.message
    });
  }
});

// 点赞评论
router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action } = req.body; // 'like' 或 'unlike'
    
    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '无效的操作类型'
      });
    }
    
    const updateValue = action === 'like' ? 1 : -1;
    
    const comment = await Comments.findByIdAndUpdate(
      commentId,
      { $inc: { likeCount: updateValue } },
      { new: true }
    ).lean();
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        likeCount: comment.likeCount
      }
    });
  } catch (error) {
    console.error('点赞评论失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞评论失败',
      error: error.message
    });
  }
});

module.exports = router;
