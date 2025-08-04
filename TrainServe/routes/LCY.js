var express = require('express');
var router = express.Router();
const {News} = require('../db/news')

// 获取新闻列表接口
router.get('/news', async (req, res) => {
  try {
    const { page = 1, limit = 10, renderType, tag } = req.query;
    
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
    
    // 计算跳过的文档数量
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询新闻数据
    const news = await News.find(query)
      .sort({ publishTime: -1, createdAt: -1 }) // 按发布时间和创建时间倒序
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // 返回普通JavaScript对象，提高性能
    
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
    
    const news = await News.findById(id).lean();
    
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

module.exports = router;