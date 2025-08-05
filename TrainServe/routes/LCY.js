var express = require('express');
var router = express.Router();
const {News} = require('../models/news')
const mongoose = require('mongoose')

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

// ==================== 管理端接口 ====================

// 测试连接接口
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 [测试] 收到测试请求');
    const count = await News.countDocuments();
    console.log('📊 [测试] 数据库中新闻总数:', count);
    
    res.json({
      code: 200,
      msg: '连接正常',
      data: {
        message: '后端服务运行正常',
        newsCount: count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('💥 [测试] 测试失败:', error);
    res.status(500).json({
      code: 500,
      msg: '连接异常',
      error: error.message
    });
  }
});

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
    
    // 查询新闻数据
    const news = await News.find(query)
      .sort({ publishTime: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();
    
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
    
    // 验证ID格式
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ [后端] ID格式无效:', id);
      return res.status(400).json({
        code: 400,
        msg: 'ID格式无效'
      });
    }
    
    const news = await News.findById(id).lean();
    res.json({
      code: 200,
      msg: '获取成功',
      data: news
    });
  } catch (error) {
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