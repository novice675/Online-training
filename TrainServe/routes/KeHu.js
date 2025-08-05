const express = require('express');
const router = express.Router();
const KeHu = require('../models/KeHu');

/**
 * 获取客户列表
 * GET /kehu
 * 支持分页、搜索、筛选
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      name,
      level,
      status,
      industry,
      followPerson
    } = req.query;

    // 构建查询条件
    let query = {};
    
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (level) {
      query.level = level;
    }
    if (status) {
      query.status = status;
    }
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }
    if (followPerson) {
      query.followPerson = { $regex: followPerson, $options: 'i' };
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // 执行查询
    const [data, total] = await Promise.all([
      KeHu.find(query)
        .sort({ updateTime: -1 })
        .skip(skip)
        .limit(limit),
      KeHu.countDocuments(query)
    ]);

    res.json({
      code: 200,
      msg: '获取客户列表成功',
      data,
      total,
      page: parseInt(page),
      size: parseInt(size)
    });

  } catch (error) {
    console.error('获取客户列表失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取客户列表失败',
      error: error.message
    });
  }
});

/**
 * 获取客户详情
 * GET /kehu/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await KeHu.findById(id);
    if (!customer) {
      return res.status(404).json({
        code: 404,
        msg: '客户不存在'
      });
    }

    res.json({
      code: 200,
      msg: '获取客户详情成功',
      data: customer
    });

  } catch (error) {
    console.error('获取客户详情失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取客户详情失败',
      error: error.message
    });
  }
});

/**
 * 新增客户
 * POST /kehu
 */
router.post('/', async (req, res) => {
  try {
    const customerData = req.body;
    
    // 检查客户名称是否已存在
    const existingCustomer = await KeHu.findOne({ 
      name: customerData.name,
      phone: customerData.phone 
    });
    
    if (existingCustomer) {
      return res.status(400).json({
        code: 400,
        msg: '该客户名称和联系方式已存在'
      });
    }

    const customer = new KeHu(customerData);
    const savedCustomer = await customer.save();

    res.status(201).json({
      code: 200,
      msg: '新增客户成功',
      data: savedCustomer
    });

  } catch (error) {
    console.error('新增客户失败:', error);
    res.status(500).json({
      code: 500,
      msg: '新增客户失败',
      error: error.message
    });
  }
});

/**
 * 更新客户
 * PUT /kehu/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查客户是否存在
    const existingCustomer = await KeHu.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        code: 404,
        msg: '客户不存在'
      });
    }

    // 如果修改了名称或电话，检查是否与其他客户重复
    if (updateData.name || updateData.phone) {
      const duplicateCustomer = await KeHu.findOne({
        _id: { $ne: id },
        name: updateData.name || existingCustomer.name,
        phone: updateData.phone || existingCustomer.phone
      });

      if (duplicateCustomer) {
        return res.status(400).json({
          code: 400,
          msg: '该客户名称和联系方式已存在'
        });
      }
    }

    const updatedCustomer = await KeHu.findByIdAndUpdate(
      id,
      { ...updateData, updateTime: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      code: 200,
      msg: '更新客户成功',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('更新客户失败:', error);
    res.status(500).json({
      code: 500,
      msg: '更新客户失败',
      error: error.message
    });
  }
});

/**
 * 删除客户
 * DELETE /kehu/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCustomer = await KeHu.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return res.status(404).json({
        code: 404,
        msg: '客户不存在'
      });
    }

    res.json({
      code: 200,
      msg: '删除客户成功',
      data: deletedCustomer
    });

  } catch (error) {
    console.error('删除客户失败:', error);
    res.status(500).json({
      code: 500,
      msg: '删除客户失败',
      error: error.message
    });
  }
});

/**
 * 批量删除客户
 * DELETE /kehu/batch
 */
router.delete('/batch/delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        msg: '请提供要删除的客户ID数组'
      });
    }

    const result = await KeHu.deleteMany({ _id: { $in: ids } });

    res.json({
      code: 200,
      msg: `成功删除 ${result.deletedCount} 个客户`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('批量删除客户失败:', error);
    res.status(500).json({
      code: 500,
      msg: '批量删除客户失败',
      error: error.message
    });
  }
});

/**
 * 获取客户统计信息
 * GET /kehu/stats/overview
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const [total, levelStats, statusStats] = await Promise.all([
      KeHu.countDocuments(),
      KeHu.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      KeHu.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      code: 200,
      msg: '获取统计信息成功',
      data: {
        total,
        levelStats,
        statusStats
      }
    });

  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      code: 500,
      msg: '获取统计信息失败',
      error: error.message
    });
  }
});

module.exports = router;
