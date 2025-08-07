const express = require('express')
const router = express.Router()
const TenantBillModel = require('../models/TenantBill')
const HeTongModel = require('../models/HeTong')
const CompanyModel = require('../models/KeHu')
const BuildingModel = require('../models/Building')
const HouseModel = require('../models/House')

// 获取运营总览数据
router.get('/overview', async (req, res) => {
  try {
    // 获取基础统计数据
    const [
      totalTenants,
      totalContracts,
      totalBuildings,
      totalHouses,
      totalBills,
      pendingBills,
      paidBills
    ] = await Promise.all([
      CompanyModel.countDocuments(),
      HeTongModel.countDocuments(),
      BuildingModel.countDocuments(),
      HouseModel.countDocuments(),
      TenantBillModel.countDocuments(),
      TenantBillModel.countDocuments({ paymentStatus: '未缴费' }),
      TenantBillModel.countDocuments({ paymentStatus: '已缴费' })
    ])

    // 计算入住率
    const occupiedHouses = await HouseModel.countDocuments({ status: '已租赁' })
    const occupancyRate = totalHouses > 0 ? ((occupiedHouses / totalHouses) * 100).toFixed(1) : 0

    // 计算本月新增合同
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    const newContracts = await HeTongModel.countDocuments({
      startDate: { $gte: currentMonth }
    })

    // 计算总收入和本月收入
    const totalRevenueData = await TenantBillModel.aggregate([
      { $match: { paymentStatus: '已缴费' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].total : 0

    const monthRevenueData = await TenantBillModel.aggregate([
      { 
        $match: { 
          paymentStatus: '已缴费',
          paymentDate: { $gte: currentMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const monthRevenue = monthRevenueData.length > 0 ? monthRevenueData[0].total : 0

    // 计算待缴费金额
    const pendingAmountData = await TenantBillModel.aggregate([
      { $match: { paymentStatus: '未缴费' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const pendingAmount = pendingAmountData.length > 0 ? pendingAmountData[0].total : 0

    res.send({
      code: 200,
      data: {
        totalRevenue,
        monthRevenue,
        totalTenants,
        occupancyRate: parseFloat(occupancyRate),
        totalContracts,
        newContracts,
        pendingBills,
        pendingAmount,
        totalBuildings,
        totalHouses,
        paidBills
      }
    })
  } catch (error) {
    console.error('获取运营总览数据失败:', error)
    res.send({ code: 500, msg: '内部服务器错误' })
  }
})

// 获取统计数据（用于图表）
router.get('/stats', async (req, res) => {
  try {
    // 租户类型分布
    const tenantTypeStats = await CompanyModel.aggregate([
      { $group: { _id: '$companyType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // 缴费状态统计
    const paymentStatusStats = await TenantBillModel.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ])

    // 账单类型统计
    const billTypeStats = await TenantBillModel.aggregate([
      { $group: { _id: '$billType', count: { $sum: 1 } } }
    ])

    // 楼宇入住率统计
    const buildingOccupancy = await BuildingModel.aggregate([
      {
        $lookup: {
          from: 'houses',
          localField: '_id',
          foreignField: 'buildingId',
          as: 'houses'
        }
      },
      {
        $addFields: {
          totalRooms: { $size: '$houses' },
          occupiedRooms: {
            $size: {
              $filter: {
                input: '$houses',
                cond: { $eq: ['$$this.status', '已租赁'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          occupancyRate: {
            $cond: {
              if: { $gt: ['$totalRooms', 0] },
              then: { $multiply: [{ $divide: ['$occupiedRooms', '$totalRooms'] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          totalRooms: 1,
          occupiedRooms: 1,
          occupancyRate: 1
        }
      }
    ])

    res.send({
      code: 200,
      data: {
        tenantTypeStats,
        paymentStatusStats,
        billTypeStats,
        buildingOccupancy
      }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.send({ code: 500, msg: '内部服务器错误' })
  }
})

// 获取收入趋势数据
router.get('/revenue', async (req, res) => {
  try {
    const { timeRange = '30days' } = req.query
    
    let startDate = new Date()
    let groupFormat = '%Y-%m-%d'
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3)
        groupFormat = '%Y-%m'
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    const revenueData = await TenantBillModel.aggregate([
      {
        $match: {
          paymentStatus: '已缴费',
          paymentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$paymentDate' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.send({
      code: 200,
      data: revenueData
    })
  } catch (error) {
    console.error('获取收入趋势数据失败:', error)
    res.send({ code: 500, msg: '内部服务器错误' })
  }
})

// 获取待处理事项
router.get('/pending-tasks', async (req, res) => {
  try {
    const tasks = []
    
    // 即将到期的合同
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
    
    const expiringContracts = await HeTongModel.find({
      endDate: { $lte: thirtyDaysLater, $gte: new Date() }
    }).limit(5).populate('companyId', 'name')

    expiringContracts.forEach(contract => {
      const daysLeft = Math.ceil((contract.endDate - new Date()) / (1000 * 60 * 60 * 24))
      tasks.push({
        id: `contract_${contract._id}`,
        title: '合同即将到期提醒',
        description: `${contract.name} 将于${daysLeft}天后到期`,
        time: '系统提醒',
        urgent: daysLeft <= 7,
        type: 'contract'
      })
    })

    // 逾期账单
    const overdueBills = await TenantBillModel.find({
      paymentStatus: '未缴费',
      dueDate: { $lt: new Date() }
    }).limit(5).populate('companyId', 'name')

    overdueBills.forEach(bill => {
      const overdueDays = Math.ceil((new Date() - bill.dueDate) / (1000 * 60 * 60 * 24))
      tasks.push({
        id: `bill_${bill._id}`,
        title: '账单逾期提醒',
        description: `${bill.companyId?.name || '未知企业'}的${bill.billType}已逾期${overdueDays}天`,
        time: `逾期${overdueDays}天`,
        urgent: overdueDays > 7,
        type: 'bill'
      })
    })

    res.send({
      code: 200,
      data: tasks
    })
  } catch (error) {
    console.error('获取待处理事项失败:', error)
    res.send({ code: 500, msg: '内部服务器错误' })
  }
})

module.exports = router 