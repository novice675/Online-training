const express = require('express');
const router = express.Router();
const ZuHuXinXi = require('../models/ZuHuXinXi');
const { HeTong } = require('../models/HeTong');

/**
 * 获取租户信息列表
 * GET /zuhuxinxi
 * 支持分页、搜索、筛选
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      name,
      louyu,
      suoshuHangye,
      qiyeGuimo,
      status,
      fuzerenName
    } = req.query;

    // 构建查询条件
    let query = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (louyu) {
      query.louyu = { $regex: louyu, $options: 'i' };
    }
    if (suoshuHangye) {
      query.suoshuHangye = { $regex: suoshuHangye, $options: 'i' };
    }
    if (qiyeGuimo) {
      query.qiyeGuimo = qiyeGuimo;
    }
    if (status) {
      query.status = status;
    }
    if (fuzerenName) {
      query.fuzerenName = { $regex: fuzerenName, $options: 'i' };
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // 执行查询
    const [data, total] = await Promise.all([
      ZuHuXinXi.find(query)
        .populate('hetongId')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      ZuHuXinXi.countDocuments(query)
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: data,
        total,
        page: parseInt(page),
        size: parseInt(size),
        pages: Math.ceil(total / parseInt(size))
      }
    });
  } catch (error) {
    console.error('获取租户信息列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 获取合同列表
 * GET /zuhuxinxi/contracts
 */
router.get('/contracts', async (req, res) => {
  try {
    // 获取所有合同
    const contracts = await HeTong.find({}, { _id: 1, he_bian: 1, name: 1, startDate: 1, endDate: 1 })
      .sort({ created_at: -1 });
    
    res.json({
      code: 200,
      message: '获取合同列表成功',
      data: contracts
    });
  } catch (error) {
    console.error('获取合同列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 获取统计信息
 * GET /zuhuxinxi/stats/overview
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalCount,
      normalCount,
      pausedCount,
      terminatedCount,
      industryStats,
      scaleStats
    ] = await Promise.all([
      ZuHuXinXi.countDocuments(),
      ZuHuXinXi.countDocuments({ status: '正常' }),
      ZuHuXinXi.countDocuments({ status: '暂停' }),
      ZuHuXinXi.countDocuments({ status: '终止' }),
      ZuHuXinXi.aggregate([
        { $group: { _id: '$suoshuHangye', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ZuHuXinXi.aggregate([
        { $group: { _id: '$qiyeGuimo', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      code: 200,
      message: '获取统计信息成功',
      data: {
        total: totalCount,
        statusStats: {
          normal: normalCount,
          paused: pausedCount,
          terminated: terminatedCount
        },
        industryStats,
        scaleStats
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 获取租户信息详情
 * GET /zuhuxinxi/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ZuHuXinXi.findById(id).populate('hetongId');
    
    if (!data) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data
    });
  } catch (error) {
    console.error('获取租户信息详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 新增租户信息
 * POST /zuhuxinxi
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      louyu,
      fangjian,
      fuzerenName,
      lianxiFangshi,
      suoshuHangye,
      qiyeGuimo,
      zhucezijin,
      shifoGaoxin,
      shifouShangshi,
      qiyeGuzhi,
      fuzeren,
      hetongId,
      status = '正常'
    } = req.body;

    // 验证必填字段
    if (!name || !louyu || !fangjian || !fuzerenName || !lianxiFangshi || !suoshuHangye || !qiyeGuimo) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段'
      });
    }

    // 验证负责人信息
    if (!fuzeren || !fuzeren.name || !fuzeren.xingbie || !fuzeren.lianxiFangshi) {
      return res.status(400).json({
        code: 400,
        message: '负责人信息不完整'
      });
    }

    // 检查租户名称是否已存在
    const existingZuHu = await ZuHuXinXi.findOne({ name, louyu, fangjian });
    if (existingZuHu) {
      return res.status(400).json({
        code: 400,
        message: '该房间的租户已存在'
      });
    }

    // 检查合同是否已被使用
    if (hetongId) {
      const existingZuHu = await ZuHuXinXi.findOne({ hetongId });
      if (existingZuHu) {
        return res.status(400).json({
          code: 400,
          message: '该合同已被使用'
        });
      }
    }

    const newZuHu = new ZuHuXinXi({
      name,
      louyu,
      fangjian,
      fuzerenName,
      lianxiFangshi,
      suoshuHangye,
      qiyeGuimo,
      zhucezijin,
      shifoGaoxin,
      shifouShangshi,
      qiyeGuzhi,
      fuzeren,
      hetongId,
      status
    });

    const savedZuHu = await newZuHu.save();

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: savedZuHu
    });
  } catch (error) {
    console.error('创建租户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 更新租户信息
 * PUT /zuhuxinxi/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查租户是否存在
    const existingZuHu = await ZuHuXinXi.findById(id);
    if (!existingZuHu) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    // 如果更新合同，检查是否重复
    if (updateData.hetongId && updateData.hetongId !== existingZuHu.hetongId?.toString()) {
      const duplicateZuHu = await ZuHuXinXi.findOne({ 
        hetongId: updateData.hetongId,
        _id: { $ne: id }
      });
      if (duplicateZuHu) {
        return res.status(400).json({
          code: 400,
          message: '该合同已被使用'
        });
      }
    }

    // 更新时间
    updateData.updated_at = new Date();

    const updatedZuHu = await ZuHuXinXi.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('hetongId');

    res.json({
      code: 200,
      message: '更新成功',
      data: updatedZuHu
    });
  } catch (error) {
    console.error('更新租户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 删除租户信息
 * DELETE /zuhuxinxi/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedZuHu = await ZuHuXinXi.findByIdAndDelete(id);
    
    if (!deletedZuHu) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: deletedZuHu
    });
  } catch (error) {
    console.error('删除租户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 批量删除租户信息
 * DELETE /zuhuxinxi/batch
 */
router.delete('/batch', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的租户ID数组'
      });
    }

    const result = await ZuHuXinXi.deleteMany({
      _id: { $in: ids }
    });

    res.json({
      code: 200,
      message: `成功删除 ${result.deletedCount} 条租户信息`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('批量删除租户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;