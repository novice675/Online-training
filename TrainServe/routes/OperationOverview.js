const express = require('express')
const router = express.Router()
const TenantBillModel = require('../models/TenantBill')
const { HeTong: HeTongModel } = require('../models/HeTong')
const { Company: CompanyModel } = require('../models/database')
const BuildingModel = require('../models/Building')
const HouseModel = require('../models/House')
const { News: NewsModel } = require('../models/news')

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
      paidBills,
      totalArticles
    ] = await Promise.all([
      CompanyModel.countDocuments(),
      HeTongModel.countDocuments(),
      BuildingModel.countDocuments(),
      HouseModel.countDocuments(),
      TenantBillModel.countDocuments(),
      TenantBillModel.countDocuments({ paymentStatus: '未缴费' }),
      TenantBillModel.countDocuments({ paymentStatus: '已缴费' }),
      NewsModel.countDocuments()
    ])

    // 计算入住率
    const occupiedHouses = await HouseModel.countDocuments({ status: '已租' })
    const occupancyRate = totalHouses > 0 ? ((occupiedHouses / totalHouses) * 100).toFixed(1) : 0

    // 计算本月新增合同和文章
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    const newContracts = await HeTongModel.countDocuments({
      startDate: { $gte: currentMonth }
    })
    const monthArticles = await NewsModel.countDocuments({
      createdAt: { $gte: currentMonth }
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
        paidBills,
        totalArticles,
        monthArticles
      }
    })
  } catch (error) {
    console.error('获取运营总览数据失败:', error)
    res.send({ code: 500, msg: '内部服务器错误' })
  }
})

// 获取统计数据（用于前端仪表板）
router.get('/stats', async (req, res) => {
  try {
    // 基础数据统计
    const [
      totalTenants,
      activeContracts,
      totalHouses,
      occupiedHouses
    ] = await Promise.all([
      CompanyModel.countDocuments(),
      HeTongModel.countDocuments({ status: '生效中' }),
      HouseModel.countDocuments(),
      HouseModel.countDocuments({ status: '已租' })
    ])

    // 计算平均入住率
    const averageOccupancy = totalHouses > 0 ? Math.round((occupiedHouses / totalHouses) * 100) : 0

    // 计算本月收入
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const monthRevenueData = await TenantBillModel.aggregate([
      { 
        $match: { 
          paymentStatus: '已缴费',
          paymentDate: { $gte: currentMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    const monthlyRevenue = monthRevenueData.length > 0 ? monthRevenueData[0].total : 0

    // 计算上月数据用于变化趋势
    const lastMonth = new Date(currentMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const lastMonthData = await Promise.all([
      CompanyModel.countDocuments({ createdAt: { $lt: currentMonth } }),
      HeTongModel.countDocuments({ status: '生效中', startDate: { $lt: currentMonth } }),
      TenantBillModel.aggregate([
        { 
          $match: { 
            paymentStatus: '已缴费',
            paymentDate: { $gte: lastMonth, $lt: currentMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ])

    const lastMonthRevenue = lastMonthData[2].length > 0 ? lastMonthData[2][0].total : 0

    // 计算变化百分比
    const tenantsChange = lastMonthData[0] > 0 ? Math.round(((totalTenants - lastMonthData[0]) / lastMonthData[0]) * 100) : 0
    const contractsChange = lastMonthData[1] > 0 ? Math.round(((activeContracts - lastMonthData[1]) / lastMonthData[1]) * 100) : 0
    const revenueChange = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0
    const occupancyChange = 5 // 模拟数据，实际可以通过历史数据计算

    res.send({
      code: 200,
      data: {
        totalTenants,
        tenantsChange,
        activeContracts,
        contractsChange,
        monthlyRevenue,
        revenueChange,
        averageOccupancy,
        occupancyChange,
        totalOccupiedRooms: occupiedHouses,
        totalVacantRooms: totalHouses - occupiedHouses,
        totalRooms: totalHouses
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
    let groupFormat = '%Y-%m'
    let monthNames = []
    
    // 生成最近6个月的数据
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      monthNames.push(`${date.getMonth() + 1}月`)
    }

    startDate.setMonth(startDate.getMonth() - 6)

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
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // 创建完整的6个月数据，没有数据的月份填充0
    const completeData = monthNames.map((month, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existingData = revenueData.find(item => item._id === yearMonth)
      return {
        month: month,
        amount: existingData ? existingData.amount : 0
      }
    })

    res.send({
      code: 200,
      data: completeData
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