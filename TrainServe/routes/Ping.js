const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ping = require('../models/Ping');

// 获取指定文章的所有评论（树形结构）
router.get('/article/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 验证文章ID格式
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({
        code: 400,
        msg: '无效的文章ID'
      });
    }

    // 获取该文章的所有评论
    const comments = await Ping.find({ articleId })
      .populate('userId', 'username avatar nickname') // 评论者信息
      .populate('replyToUserId', 'username nickname') // 被回复者信息
      .sort({ createdAt: 1 }) // 按时间正序排列
      .exec();

    // 构建评论树结构
    const buildCommentTree = (comments) => {
      const commentMap = new Map();
      const rootComments = [];

      // 先将所有评论放入map中
      comments.forEach(comment => {
        const commentObj = comment.toObject();
        commentObj.replies = [];
        commentMap.set(commentObj._id.toString(), commentObj);
      });

      // 构建树形结构
      comments.forEach(comment => {
        const commentObj = commentMap.get(comment._id.toString());
        
        if (comment.parentId) {
          // 这是回复评论，添加到父评论的replies中
          const parentComment = commentMap.get(comment.parentId.toString());
          if (parentComment) {
            parentComment.replies.push(commentObj);
          }
        } else {
          // 这是顶级评论
          rootComments.push(commentObj);
        }
      });

      return rootComments;
    };

    const commentTree = buildCommentTree(comments);

    res.json({
      code: 200,
      msg: '获取评论成功',
      data: {
        comments: commentTree,
        total: comments.length,
        articleId: articleId
      }
    });

  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取评论失败',
      error: error.message
    });
  }
});

// 管理端：获取所有评论列表（平铺结构，用于管理）
router.get('/admin/comments', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      articleId, 
      userId,
      keyword 
    } = req.query;

    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNum - 1) * pageSize;

    // 构建查询条件
    let query = {};
    
    if (articleId && mongoose.Types.ObjectId.isValid(articleId)) {
      query.articleId = articleId;
    }
    
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }
    
    if (keyword) {
      query.content = { $regex: keyword, $options: 'i' };
    }

    // 查询评论列表
    const comments = await Ping.find(query)
      .populate('userId', 'username avatar nickname')
      .populate('replyToUserId', 'username nickname')
      .populate('articleId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const total = await Ping.countDocuments(query);

    res.json({
      code: 200,
      msg: '获取成功',
      data: comments,
      total: total,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: total,
        pages: Math.ceil(total / pageSize)
      }
    });

  } catch (error) {
    console.error('获取评论列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取评论列表失败',
      error: error.message
    });
  }
});

// 获取单个评论详情
router.get('/admin/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        msg: '无效的评论ID'
      });
    }

    const comment = await Ping.findById(id)
      .populate('userId', 'username avatar nickname')
      .populate('replyToUserId', 'username nickname')
      .populate('articleId', 'title')
      .exec();

    if (!comment) {
      return res.status(404).json({
        code: 404,
        msg: '评论不存在'
      });
    }

    res.json({
      code: 200,
      msg: '获取成功',
      data: comment
    });

  } catch (error) {
    console.error('获取评论详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取评论详情失败',
      error: error.message
    });
  }
});

module.exports = router;
