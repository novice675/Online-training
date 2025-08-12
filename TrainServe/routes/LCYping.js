var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
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
        
        console.log(`📊 [后端] 评论 ${comment._id} 的回复统计:`, {
          commentTitle: comment.content?.substring(0, 20) + '...',
          repliesFound: replies.length,
          originalReplyCount: comment.replyCount,
          userInfo: comment.userId ? {
            username: comment.userId.username,
            type: typeof comment.userId
          } : 'no user'
        });
        
        return {
          ...comment,
          replies,
          replyCount: replies.length // 使用实际查询到的回复数量
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

// 删除单个评论
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    
    console.log('🗑️ [后端] 删除评论请求，ID:', commentId);
    
    // 验证评论ID格式
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      console.log('❌ [后端] 评论ID格式无效:', commentId);
      return res.status(400).json({
        success: false,
        message: '评论ID格式无效'
      });
    }
    
    // 查找要删除的评论
    const comment = await Comments.findById(commentId);
    if (!comment) {
      console.log('❌ [后端] 评论不存在，ID:', commentId);
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }
    
    // 删除评论及其所有回复
    if (!comment.parentId) {
      // 这是根评论，需要删除所有回复
      const deleteCount = await Comments.deleteMany({
        $or: [
          { _id: commentId },
          { rootId: commentId }
        ]
      });
      console.log(`✅ [后端] 删除根评论及其回复，共删除 ${deleteCount.deletedCount} 条`);
    } else {
      // 这是回复，只删除这条回复
      await Comments.findByIdAndDelete(commentId);
      
      // 更新父评论的回复数
      if (comment.parentId) {
        await Comments.findByIdAndUpdate(comment.parentId, {
          $inc: { replyCount: -1 }
        });
      }
      console.log('✅ [后端] 删除回复评论成功');
    }
    
    res.json({
      success: true,
      message: '删除评论成功'
    });
  } catch (error) {
    console.error('❌ [后端] 删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败',
      error: error.message
    });
  }
});

// 批量删除评论
router.delete('/comments/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    console.log('🗑️ [后端] 批量删除评论请求，IDs:', ids);
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的评论ID列表'
      });
    }
    
    // 验证所有ID格式
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: '存在无效的评论ID格式'
      });
    }
    
    // 查找要删除的评论
    const comments = await Comments.find({ _id: { $in: validIds } });
    
    let totalDeleted = 0;
    
    // 处理每个评论的删除
    for (const comment of comments) {
      if (!comment.parentId) {
        // 根评论：删除评论及其所有回复
        const deleteResult = await Comments.deleteMany({
          $or: [
            { _id: comment._id },
            { rootId: comment._id }
          ]
        });
        totalDeleted += deleteResult.deletedCount;
      } else {
        // 回复：只删除这条回复
        await Comments.findByIdAndDelete(comment._id);
        totalDeleted += 1;
        
        // 更新父评论的回复数
        if (comment.parentId) {
          await Comments.findByIdAndUpdate(comment.parentId, {
            $inc: { replyCount: -1 }
          });
        }
      }
    }
    
    console.log(`✅ [后端] 批量删除评论成功，共删除 ${totalDeleted} 条`);
    
    res.json({
      success: true,
      message: `成功删除 ${totalDeleted} 条评论`,
      deletedCount: totalDeleted
    });
  } catch (error) {
    console.error('❌ [后端] 批量删除评论失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除评论失败',
      error: error.message
    });
  }
});

module.exports = router;
