const express = require('express');
const router = express.Router();
const ZuHuXinXi = require('../models/ZuHuXinXi');
const { HeTong } = require('../models/HeTong');
const { Company, Employee } = require('../models/database');
const mongoose = require('mongoose');

/**
 * 获取租户信息列表
 * GET /zuhuxinxi
 * 支持分页、搜索、筛�?- 通过关联表查�?
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      companyName,        // 企业名称搜索
      employeeName,       // 员工名称搜索
      contractNumber,     // 合同编号搜索
      status,             // 状态筛�?
      industry,           // 行业筛选（从企业表�?
      building,           // 楼宇搜索
      room                // 房间搜索
    } = req.query;

    // 构建基础查询条件
    let matchQuery = {};
    
    // 状态筛�?
    if (status) {
      matchQuery.status = status;
    }

    // 构建聚合管道
    const pipeline = [
      // 匹配基础条件
      { $match: matchQuery },
      
      // 关联企业�?
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
                inaddress: 1,
                outaddress: 1,
                type: 1,
                logo: 1,
                house: 1
              }
            }
          ]
        }
      },
      
      // 关联员工�?
      {
        $lookup: {
          from: 'employee',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $project: {
                name: 1,
                sex: 1,
                phone: 1,
                email: 1,
                picture: 1,
                role: 1
              }
            }
          ]
        }
      },
      
      // 关联合同�?
      {
        $lookup: {
          from: 'HeTong',
          localField: 'hetongId',
          foreignField: '_id',
          as: 'contract',
          pipeline: [
            {
              $project: {
                he_bian: 1,
                name: 1,
                startDate: 1,
                endDate: 1,
                louyu: 1,
                fangjian: 1
              }
            }
          ]
        }
      },
      
      // 展开关联数据（处理数组）
      {
        $addFields: {
          company: { $arrayElemAt: ['$company', 0] },
          employee: { $arrayElemAt: ['$employee', 0] },
          contract: { $arrayElemAt: ['$contract', 0] }
        }
      }
    ];

    // 添加搜索条件
    const searchConditions = [];
    
    if (companyName) {
      searchConditions.push({
        'company.name': { $regex: companyName, $options: 'i' }
      });
    }
    
    if (employeeName) {
      searchConditions.push({
        'employee.name': { $regex: employeeName, $options: 'i' }
      });
    }
    
    if (contractNumber) {
      searchConditions.push({
        'contract.he_bian': { $regex: contractNumber, $options: 'i' }
      });
    }
    
    if (industry) {
      searchConditions.push({
        'company.type': { $regex: industry, $options: 'i' }
      });
    }
    
    if (building) {
      searchConditions.push({
        'company.inaddress': { $regex: building, $options: 'i' }
      });
    }
    
    if (room) {
      searchConditions.push({
        'company.house': { $regex: room, $options: 'i' }
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
    const totalResult = await ZuHuXinXi.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    // 添加分页和排�?
    const skip = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);
    
    pipeline.push(
      { $sort: { created_at: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // 执行查询
    const data = await ZuHuXinXi.aggregate(pipeline);

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
 * 获取企业列表（用于下拉选择�?
 * GET /zuhuxinxi/companies
 */
router.get('/companies', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // 构建查询条件
    let query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { inaddress: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 获取所有企业，按名称排�?
    const companies = await Company.find(query, { 
      _id: 1, 
      name: 1, 
      inaddress: 1,
      outaddress: 1,
      type: 1,
      logo: 1,
      house: 1
    })
      .sort({ name: 1 })
      .lean();
    
    res.json({
      code: 200,
      message: '获取企业列表成功',
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
 * 获取企业员工列表（用于下拉选择�?
 * GET /zuhuxinxi/employees/:companyId
 */
router.get('/employees/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // 验证companyId是否为有效的ObjectId
    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的企业ID'
      });
    }
    
    // 获取企业的所有员�?
    const employees = await Employee.find(
      { company_id: new mongoose.Types.ObjectId(companyId) }, 
      { _id: 1, name: 1, sex: 1, phone: 1, email: 1, picture: 1, role: 1 }
    )
      .sort({ name: 1 })
      .lean();
    
    res.json({
      code: 200,
      message: '获取员工列表成功',
      data: employees
    });
  } catch (error) {
    console.error('获取员工列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    });
  }
});

/**
 * 获取合同列表（用于下拉选择�?
 * GET /zuhuxinxi/contracts
 */
router.get('/contracts', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // 构建查询条件
    let query = {};
    if (keyword) {
      query.$or = [
        { he_bian: { $regex: keyword, $options: 'i' } },
        { name: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 获取所有合同，按创建时间排�?
    const contracts = await HeTong.find(query, { 
      _id: 1, 
      he_bian: 1, 
      name: 1, 
      startDate: 1, 
      endDate: 1,
      louyu: 1,
      fangjian: 1
    })
      .sort({ created_at: -1 })
      .lean();
    
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
 * 获取统计信息 - 基于关联表数�?
 * GET /zuhuxinxi/stats/overview
 */
router.get('/stats/overview', async (req, res) => {
  try {
    // 基础统计
    const [totalCount, normalCount, pausedCount, terminatedCount] = await Promise.all([
      ZuHuXinXi.countDocuments(),
      ZuHuXinXi.countDocuments({ status: '正常' }),
      ZuHuXinXi.countDocuments({ status: '暂停' }),
      ZuHuXinXi.countDocuments({ status: '终止' })
    ]);

    // 行业统计 - 通过关联企业�?
    const industryStats = await ZuHuXinXi.aggregate([
      {
        $lookup: {
          from: 'company',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $unwind: '$company'
      },
      {
        $group: {
          _id: '$company.type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // 楼宇统计 - 通过关联合同�?
    const buildingStats = await ZuHuXinXi.aggregate([
      {
        $lookup: {
          from: 'HeTong',
          localField: 'hetongId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      {
        $unwind: {
          path: '$contract',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$contract.louyu',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          _id: { $ne: null }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // 企业关联统计
    const linkedStats = await ZuHuXinXi.aggregate([
      {
        $group: {
          _id: null,
          totalTenants: { $sum: 1 },
          linkedCompanies: { $sum: { $cond: [{ $ne: ['$companyId', null] }, 1, 0] } },
          linkedEmployees: { $sum: { $cond: [{ $ne: ['$employeeId', null] }, 1, 0] } },
          linkedContracts: { $sum: { $cond: [{ $ne: ['$hetongId', null] }, 1, 0] } }
        }
      }
    ]);

    const linkStats = linkedStats.length > 0 ? linkedStats[0] : {
      totalTenants: 0,
      linkedCompanies: 0,
      linkedEmployees: 0,
      linkedContracts: 0
    };

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
        buildingStats,
        linkageStats: {
          companies: `${linkStats.linkedCompanies}/${linkStats.totalTenants}`,
          employees: `${linkStats.linkedEmployees}/${linkStats.totalTenants}`,
          contracts: `${linkStats.linkedContracts}/${linkStats.totalTenants}`
        }
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
 * 获取租户信息详情 - 完整关联信息
 * GET /zuhuxinxi/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 使用聚合查询获取完整的关联信�?
    const data = await ZuHuXinXi.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
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
                inaddress: 1,
                outaddress: 1,
                type: 1,
                logo: 1,
                house: 1,
                created_at: 1,
                updated_at: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'employee',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
          pipeline: [
            {
              $project: {
                name: 1,
                sex: 1,
                phone: 1,
                sfz: 1,
                email: 1,
                weixin: 1,
                picture: 1,
                role: 1
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'HeTong',
          localField: 'hetongId',
          foreignField: '_id',
          as: 'contract',
          pipeline: [
            {
              $project: {
                he_bian: 1,
                name: 1,
                startDate: 1,
                endDate: 1,
                louyu: 1,
                fangjian: 1,
                kaiShiRiQi: 1,
                gengXinRiQi: 1
              }
            }
          ]
        }
      },
      {
        $addFields: {
          company: { $arrayElemAt: ['$company', 0] },
          employee: { $arrayElemAt: ['$employee', 0] },
          contract: { $arrayElemAt: ['$contract', 0] }
        }
      }
    ]);
    
    if (!data || data.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: data[0]
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
 * 新增租户信息 - 只操作模型中存在的字�?
 * POST /zuhuxinxi
 */
router.post('/', async (req, res) => {
  try {
    const {
      companyId,
      employeeId,
      hetongId,
      status = '正常'
    } = req.body;

    // 验证企业是否存在 - 必需字段
    if (!companyId) {
      return res.status(400).json({
        code: 400,
        message: '企业ID不能为空'
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({
        code: 400,
        message: '指定的企业不存在'
      });
    }

    // 验证员工是否存在且属于该企业 - 可选字�?
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(400).json({
          code: 400,
          message: '指定的员工不存在'
        });
      }
      if (employee.company_id.toString() !== companyId) {
        return res.status(400).json({
          code: 400,
          message: '员工不属于指定的企业'
        });
      }
    }

    // 验证合同是否存在 - 可选字�?
    if (hetongId) {
      const contract = await HeTong.findById(hetongId);
      if (!contract) {
        return res.status(400).json({
          code: 400,
          message: '指定的合同不存在'
        });
      }
      
      // 检查合同是否已被使�?
      const existingTenant = await ZuHuXinXi.findOne({ hetongId });
      if (existingTenant) {
        return res.status(400).json({
          code: 400,
          message: '该合同已被其他租户使用'
        });
      }
    }

    // 验证状态枚举�?
    const validStatuses = ['正常', '暂停', '终止'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '状态必须是：正常、暂停、终止'
      });
    }

    // 创建新租�?- 只使用模型中定义的字�?
    const newTenant = new ZuHuXinXi({
      companyId,
      employeeId: employeeId || null,
      hetongId: hetongId || null,
      status
    });

    const savedTenant = await newTenant.save();

    // 返回创建的数据（包含关联信息�?
    const result = await ZuHuXinXi.aggregate([
      {
        $match: { _id: savedTenant._id }
      },
      {
        $lookup: {
          from: 'company',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $lookup: {
          from: 'employee',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'HeTong',
          localField: 'hetongId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      {
        $addFields: {
          company: { $arrayElemAt: ['$company', 0] },
          employee: { $arrayElemAt: ['$employee', 0] },
          contract: { $arrayElemAt: ['$contract', 0] }
        }
      }
    ]);

    res.status(201).json({
      code: 201,
      message: '创建成功',
      data: result[0]
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
 * 更新租户信息 - 只操作模型中存在的字�?
 * PUT /zuhuxinxi/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, employeeId, hetongId, status } = req.body;

    // 检查租户是否存�?
    const existingTenant = await ZuHuXinXi.findById(id);
    if (!existingTenant) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    const updateData = {};

    // 验证和更新企业ID
    if (companyId !== undefined) {
      if (!companyId) {
        return res.status(400).json({
          code: 400,
          message: '企业ID不能为空'
        });
      }
      
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(400).json({
          code: 400,
          message: '指定的企业不存在'
        });
      }
      updateData.companyId = companyId;
    }

    // 验证和更新员工ID
    if (employeeId !== undefined) {
      if (employeeId) {
        const employee = await Employee.findById(employeeId);
        if (!employee) {
          return res.status(400).json({
            code: 400,
            message: '指定的员工不存在'
          });
        }
        
        const targetCompanyId = updateData.companyId || existingTenant.companyId;
        if (employee.company_id.toString() !== targetCompanyId.toString()) {
          return res.status(400).json({
            code: 400,
            message: '员工不属于指定的企业'
          });
        }
      }
      updateData.employeeId = employeeId || null;
    }

    // 验证和更新合同ID
    if (hetongId !== undefined) {
      if (hetongId) {
        const contract = await HeTong.findById(hetongId);
        if (!contract) {
          return res.status(400).json({
            code: 400,
            message: '指定的合同不存在'
          });
        }
        
        // 检查合同是否已被其他租户使�?
        const duplicateTenant = await ZuHuXinXi.findOne({ 
          hetongId,
          _id: { $ne: id }
        });
        if (duplicateTenant) {
          return res.status(400).json({
            code: 400,
            message: '该合同已被其他租户使用'
          });
        }
      }
      updateData.hetongId = hetongId || null;
    }

    // 验证和更新状�?
    if (status !== undefined) {
      const validStatuses = ['正常', '暂停', '终止'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          code: 400,
          message: '状态必须是：正常、暂停、终止'
        });
      }
      updateData.status = status;
    }

    // 更新时间
    updateData.updated_at = new Date();

    // 执行更新
    const updatedTenant = await ZuHuXinXi.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // 返回更新后的数据（包含关联信息）
    const result = await ZuHuXinXi.aggregate([
      {
        $match: { _id: updatedTenant._id }
      },
      {
        $lookup: {
          from: 'company',
          localField: 'companyId',
          foreignField: '_id',
          as: 'company'
        }
      },
      {
        $lookup: {
          from: 'employee',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'HeTong',
          localField: 'hetongId',
          foreignField: '_id',
          as: 'contract'
        }
      },
      {
        $addFields: {
          company: { $arrayElemAt: ['$company', 0] },
          employee: { $arrayElemAt: ['$employee', 0] },
          contract: { $arrayElemAt: ['$contract', 0] }
        }
      }
    ]);

    res.json({
      code: 200,
      message: '更新成功',
      data: result[0]
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

    const deletedTenant = await ZuHuXinXi.findByIdAndDelete(id);
    
    if (!deletedTenant) {
      return res.status(404).json({
        code: 404,
        message: '租户信息不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功',
      data: deletedTenant
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
