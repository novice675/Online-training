const express = require('express');
const router = express.Router();
const TenantBill = require('../models/TenantBill');
const { Company } = require('../models/database');

/**
 * 获取租户账单列表
 * GET /tenantbill
 * 支持分页、搜索、筛选，关联企业、楼宇、房间信息
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      billNumber,        // 账单编号搜索
      companyName,       // 企业名称搜索
      buildingName,      // 楼宇名称搜索
      roomNumber,        // 房间号搜索
      billType,          // 账单类型筛选
      paymentStatus,     // 缴费状态筛选
      startDate,         // 开始日期筛选
      endDate            // 结束日期筛选
    } = req.query;

    // 构建聚合管道
    const pipeline = [
      // 关联企业表
      {
        $lookup: {
          from: 'company',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
          pipeline: [
            {
              $project: {
                name: 1,
                type: 1,
                buildingId: 1,
                houseId: 1,
                logo: 1
              }
            }
          ]
        }
      },
      
      // 关联楼宇表（通过企业的buildingId）
      {
        $lookup: {
          from: 'Building',
          localField: 'company.buildingId',
          foreignField: '_id',
          as: 'building'
        }
      },
      
      // 关联房间表（通过企业的houseId）
      {
        $lookup: {
          from: 'House',
          localField: 'company.houseId',
          foreignField: '_id',
          as: 'house'
        }
      },
      
      // 展开关联数据
      {
        $addFields: {
          company: { $arrayElemAt: ['$company', 0] },
          building: { $arrayElemAt: ['$building', 0] },
          house: { $arrayElemAt: ['$house', 0] }
        }
      }
    ];

    // 添加搜索条件
    const searchConditions = [];
    
    if (billNumber) {
      searchConditions.push({
        billNumber: { $regex: billNumber, $options: 'i' }
      });
    }
    
    if (companyName) {
      searchConditions.push({
        'company.name': { $regex: companyName, $options: 'i' }
      });
    }
    
    if (buildingName) {
      searchConditions.push({
        'building.name': { $regex: buildingName, $options: 'i' }
      });
    }
    
    if (roomNumber) {
      searchConditions.push({
        'house.number': { $regex: roomNumber, $options: 'i' }
      });
    }
    
    if (billType) {
      searchConditions.push({
        billType: billType
      });
    }
    
    if (paymentStatus) {
      searchConditions.push({
        paymentStatus: paymentStatus
      });
    }
    
    // 日期范围筛选
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      searchConditions.push({
        startDate: dateFilter
      });
    }

    // 如果有搜索条件，添加到管道中
    if (searchConditions.length > 0) {
      pipeline.push({
        $match: {
          $and: searchConditions
        }
      });
    }
    
    // 计算总数
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await TenantBill.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 添加分页和排序
    const skip = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // 执行查询
    const data = await TenantBill.aggregate(pipeline);

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
    console.error('获取租户账单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 获取企业列表（用于下拉选择）
 * GET /tenantbill/companies
 */
router.get('/companies', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // 构建查询条件
    let query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 获取企业列表，关联楼宇和房间信息
    const companies = await Company.find(query)
      .populate('buildingId', 'name address')
      .populate('houseId', 'number floor')
      .select('name type buildingId houseId')
      .sort({ name: 1 });
    
    res.json({
      code: 200,
      message: '获取成功',
      data: companies
    });
  } catch (error) {
    console.error('获取企业列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 新增租户账单
 * POST /tenantbill
 */
router.post('/', async (req, res) => {
  try {
    const billData = req.body;
    
    // 验证企业是否存在
    const company = await Company.findById(billData.companyId);
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: '企业不存在'
      });
    }
    
    // 自动生成账单编号
    const billNumber = await TenantBill.generateBillNumber();
    billData.billNumber = billNumber;
    
    // 计算账单金额
    billData.amount = billData.unitPrice * billData.usage;
    
    const bill = new TenantBill(billData);
    const savedBill = await bill.save();

    res.status(201).json({
      code: 200,
      message: '新增账单成功',
      data: savedBill
    });

  } catch (error) {
    console.error('新增账单失败:', error);
    res.status(500).json({
      code: 500,
      message: '新增账单失败',
      error: error.message
    });
  }
});

/**
 * 更新租户账单
 * PUT /tenantbill/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    // 重新计算金额
    if (updateData.unitPrice || updateData.usage) {
      const bill = await TenantBill.findById(id);
      if (bill) {
        updateData.amount = (updateData.unitPrice || bill.unitPrice) * (updateData.usage || bill.usage);
      }
    }
    
    const bill = await TenantBill.findByIdAndUpdate(id, updateData, { new: true })
      .populate({
        path: 'companyId',
        populate: [
          { path: 'buildingId', select: 'name address' },
          { path: 'houseId', select: 'number floor' }
        ]
      });
    
    if (!bill) {
      return res.status(404).json({
        code: 404,
        message: '账单不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '更新账单成功',
      data: bill
    });
  } catch (error) {
    console.error('更新账单失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新账单失败',
      error: error.message
    });
  }
});

/**
 * 删除租户账单
 * DELETE /tenantbill/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bill = await TenantBill.findByIdAndDelete(id);
    if (!bill) {
      return res.status(404).json({
        code: 404,
        message: '账单不存在'
      });
    }
    
    res.json({
      code: 200,
      message: '删除账单成功'
    });
  } catch (error) {
    console.error('删除账单失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除账单失败',
      error: error.message
    });
  }
});

/**
 * 批量删除租户账单
 * DELETE /tenantbill/batch
 */
router.delete('/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的账单ID列表'
      });
    }
    
    const result = await TenantBill.deleteMany({ _id: { $in: ids } });
    
    res.json({
      code: 200,
      message: `成功删除 ${result.deletedCount} 条账单`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('批量删除账单失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除账单失败',
      error: error.message
    });
  }
});

/**
 * 更新缴费状态
 * PUT /tenantbill/:id/payment
 */
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentDate, paymentStatus } = req.body;
    
    const bill = await TenantBill.findById(id);
    if (!bill) {
      return res.status(404).json({
        code: 404,
        message: '账单不存在'
      });
    }
    
    // 更新缴费信息
    const updateData = {
      paidAmount: paidAmount || 0,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      paymentStatus: paymentStatus || '未缴费',
      updatedAt: new Date()
    };
    
    // 自动判断缴费状态
    if (updateData.paidAmount >= bill.amount) {
      updateData.paymentStatus = '已缴费';
    } else if (updateData.paidAmount > 0) {
      updateData.paymentStatus = '部分缴费';
    } else {
      updateData.paymentStatus = '未缴费';
    }
    
    const updatedBill = await TenantBill.findByIdAndUpdate(id, updateData, { new: true });
    
    res.json({
      code: 200,
      message: '更新缴费状态成功',
      data: updatedBill
    });
  } catch (error) {
    console.error('更新缴费状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新缴费状态失败',
      error: error.message
    });
  }
});

module.exports = router; 