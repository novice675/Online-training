<template>
  <div class="operation-overview">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>运营总览</h1>
        <p>实时监控运营数据，掌握业务全貌</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button @click="exportData">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div class="metric-card revenue">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="metric-trend up">
            <el-icon><CaretTop /></el-icon>
            <span>+12.5%</span>
          </div>
        </div>
        <div class="metric-content">
          <h2>{{ formatCurrency(totalRevenue) }}</h2>
          <p>总收入</p>
          <div class="metric-detail">
            <span>本月: {{ formatCurrency(monthRevenue) }}</span>
          </div>
        </div>
      </div>

      <div class="metric-card tenants">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="metric-trend up">
            <el-icon><CaretTop /></el-icon>
            <span>+8.2%</span>
          </div>
        </div>
        <div class="metric-content">
          <h2>{{ totalTenants }}</h2>
          <p>租户总数</p>
          <div class="metric-detail">
            <span>入住率: {{ occupancyRate }}%</span>
          </div>
        </div>
      </div>

      <div class="metric-card contracts">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="metric-trend up">
            <el-icon><CaretTop /></el-icon>
            <span>+15.3%</span>
          </div>
        </div>
        <div class="metric-content">
          <h2>{{ totalContracts }}</h2>
          <p>合同总数</p>
          <div class="metric-detail">
            <span>本月新增: {{ newContracts }}</span>
          </div>
        </div>
      </div>

      <div class="metric-card bills">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="metric-trend down">
            <el-icon><CaretBottom /></el-icon>
            <span>-3.1%</span>
          </div>
        </div>
        <div class="metric-content">
          <h2>{{ pendingBills }}</h2>
          <p>待缴费账单</p>
          <div class="metric-detail">
            <span>金额: {{ formatCurrency(pendingAmount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-row">
        <!-- 收入趋势图 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
              <el-select v-model="revenueTimeRange" size="small">
                <el-option label="最近7天" value="7days" />
                <el-option label="最近30天" value="30days" />
                <el-option label="最近3个月" value="3months" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="revenueChartRef"></div>
        </el-card>

        <!-- 租户类型分布 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span>租户类型分布</span>
          </template>
          <div class="chart-container" ref="tenantTypeChartRef"></div>
        </el-card>
      </div>

      <div class="chart-row">
        <!-- 缴费状态统计 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span>缴费状态统计</span>
          </template>
          <div class="chart-container" ref="paymentStatusChartRef"></div>
        </el-card>

        <!-- 楼宇入住率 -->
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span>楼宇入住率</span>
          </template>
          <div class="chart-container" ref="occupancyChartRef"></div>
        </el-card>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="tables-section">
      <div class="table-row">
        <!-- 最新合同 -->
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最新合同</span>
              <el-button link type="primary" @click="viewAllContracts">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentContracts" style="width: 100%" size="small">
            <el-table-column prop="he_bian" label="合同编号" width="120" />
            <el-table-column prop="name" label="合同名称" />
            <el-table-column prop="qianPeople" label="签约方" width="100" />
            <el-table-column prop="startDate" label="开始日期" width="100">
              <template #default="{ row }">
                {{ formatDate(row.startDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="getContractStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 待处理事项 -->
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
              <el-badge :value="pendingTasks.length" class="item">
                <el-button link type="primary">处理</el-button>
              </el-badge>
            </div>
          </template>
          <div class="task-list">
            <div 
              v-for="task in pendingTasks" 
              :key="task.id"
              class="task-item"
              :class="{ urgent: task.urgent }"
            >
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                <div class="task-desc">{{ task.description }}</div>
                <div class="task-time">{{ task.time }}</div>
              </div>
              <div class="task-actions">
                <el-button size="small" type="primary" @click="handleTask(task)">处理</el-button>
              </div>
            </div>
          </div>
        </el-card>
          </div>
        </div>

    <!-- 快速操作面板 -->
    <div class="quick-actions-panel">
      <el-card shadow="hover">
        <template #header>
          <span>快速操作</span>
        </template>
        <div class="actions-grid">
          <div class="action-item" @click="navigateTo('/home/Operation/BillManagement/TenantBill')">
            <el-icon size="24"><Tickets /></el-icon>
            <span>账单管理</span>
          </div>
          <div class="action-item" @click="navigateTo('/home/Operation/InvestmentManagement/keHu')">
            <el-icon size="24"><User /></el-icon>
            <span>客户管理</span>
          </div>
          <div class="action-item" @click="navigateTo('/home/Operation/InvestmentManagement/heTong')">
            <el-icon size="24"><Document /></el-icon>
            <span>合同管理</span>
          </div>
          <div class="action-item" @click="navigateTo('/home/Operation/TenantManagement/ZuHuXinXi')">
            <el-icon size="24"><OfficeBuilding /></el-icon>
            <span>租户管理</span>
        </div>
          <div class="action-item" @click="navigateTo('/home/Operation/ZiChan/LouYu')">
            <el-icon size="24"><House /></el-icon>
            <span>楼宇管理</span>
          </div>
          <div class="action-item" @click="navigateTo('/home/Operation/ZiChan/ZiYuan')">
            <el-icon size="24"><Box /></el-icon>
            <span>房间管理</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Money, OfficeBuilding, Document, Tickets, CaretTop, CaretBottom,
  Refresh, Download, User, House, Box
} from '@element-plus/icons-vue'
import {
  getOperationOverview,
  getOperationStats,
  getRecentContracts,
  getRevenueStats,
  getRecentTenantBills
} from '../../api/auth.js'

const router = useRouter()

// 响应式数据
const totalRevenue = ref(0)
const monthRevenue = ref(0)
const totalTenants = ref(0)
const occupancyRate = ref(0)
const totalContracts = ref(0)
const newContracts = ref(0)
const pendingBills = ref(0)
const pendingAmount = ref(0)
const revenueTimeRange = ref('30days')

// 加载状态
const loading = ref(false)
const chartsLoading = ref(false)

// 图表引用
const revenueChartRef = ref()
const tenantTypeChartRef = ref()
const paymentStatusChartRef = ref()
const occupancyChartRef = ref()

// 图表数据
const chartData = reactive({
  tenantTypeStats: [],
  paymentStatusStats: [],
  billTypeStats: [],
  buildingOccupancy: [],
  revenueData: []
})

// 最新合同数据
const recentContracts = ref([])

// 待处理事项
const pendingTasks = ref([])

// 获取运营总览数据
const fetchOverviewData = async () => {
  try {
    loading.value = true
    const { data } = await getOperationOverview()
    
    if (data.code === 200) {
      const overview = data.data
      totalRevenue.value = overview.totalRevenue || 0
      monthRevenue.value = overview.monthRevenue || 0
      totalTenants.value = overview.totalTenants || 0
      occupancyRate.value = overview.occupancyRate || 0
      totalContracts.value = overview.totalContracts || 0
      newContracts.value = overview.newContracts || 0
      pendingBills.value = overview.pendingBills || 0
      pendingAmount.value = overview.pendingAmount || 0
    } else {
      ElMessage.error(data.msg || '获取运营数据失败')
    }
  } catch (error) {
    console.error('获取运营总览数据失败:', error)
    ElMessage.error('获取运营数据失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据（图表数据）
const fetchStatsData = async () => {
  try {
    chartsLoading.value = true
    const { data } = await getOperationStats()
    
    if (data.code === 200) {
      const stats = data.data
      chartData.tenantTypeStats = stats.tenantTypeStats || []
      chartData.paymentStatusStats = stats.paymentStatusStats || []
      chartData.billTypeStats = stats.billTypeStats || []
      chartData.buildingOccupancy = stats.buildingOccupancy || []
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    chartsLoading.value = false
  }
}

// 获取最新合同
const fetchRecentContracts = async () => {
  try {
    const { data } = await getRecentContracts()
    
    if (data.code === 200) {
      recentContracts.value = data.data || []
    }
  } catch (error) {
    console.error('获取最新合同失败:', error)
    ElMessage.error('获取最新合同失败')
  }
}

// 获取收入趋势数据
const fetchRevenueData = async () => {
  try {
    const { data } = await getRevenueStats(revenueTimeRange.value)
    
    if (data.code === 200) {
      chartData.revenueData = data.data || []
      // 这里可以更新收入图表
      updateRevenueChart()
    }
  } catch (error) {
    console.error('获取收入趋势数据失败:', error)
    ElMessage.error('获取收入趋势数据失败')
  }
}

// 获取待处理事项
const fetchPendingTasks = async () => {
  try {
    // 使用自定义的待处理事项API
    const response = await fetch('http://localhost:3008/operation/pending-tasks')
    const data = await response.json()
    
    if (data.code === 200) {
      pendingTasks.value = data.data || []
    }
  } catch (error) {
    console.error('获取待处理事项失败:', error)
    ElMessage.error('获取待处理事项失败')
  }
}

// 格式化货币
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取合同状态类型
const getContractStatusType = (status: string) => {
  switch (status) {
    case '生效中': return 'success'
    case '待生效': return 'warning'
    case '已到期': return 'danger'
    default: return 'info'
  }
}

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path)
}

// 查看所有合同
const viewAllContracts = () => {
  navigateTo('/home/Operation/InvestmentManagement/heTong')
}

// 处理任务
const handleTask = (task: any) => {
  ElMessage.success(`正在处理: ${task.title}`)
  // 根据任务类型跳转到相应页面
  if (task.type === 'contract') {
    navigateTo('/home/Operation/InvestmentManagement/heTong')
  } else if (task.type === 'bill') {
    navigateTo('/home/Operation/BillManagement/TenantBill')
  }
}

// 刷新数据
const refreshData = async () => {
  ElMessage.success('正在刷新数据...')
  await Promise.all([
    fetchOverviewData(),
    fetchStatsData(),
    fetchRecentContracts(),
    fetchRevenueData(),
    fetchPendingTasks()
  ])
  ElMessage.success('数据刷新完成')
}

// 导出数据
const exportData = () => {
  ElMessage.success('报表导出功能开发中...')
  // TODO: 实现数据导出功能
}

// 更新收入图表
const updateRevenueChart = () => {
  // 这里可以使用 ECharts 或其他图表库来更新图表
  console.log('收入数据:', chartData.revenueData)
}

// 初始化图表
const initCharts = () => {
  // 这里可以使用 ECharts 或其他图表库来初始化图表
  console.log('图表初始化完成')
  
  // 更新图表显示文本
  if (revenueChartRef.value) {
    revenueChartRef.value.innerHTML = chartsLoading.value ? '加载中...' : '收入趋势图表 (需要集成图表库)'
  }
  if (tenantTypeChartRef.value) {
    tenantTypeChartRef.value.innerHTML = chartsLoading.value ? '加载中...' : `租户类型分布: ${chartData.tenantTypeStats.length} 种类型`
  }
  if (paymentStatusChartRef.value) {
    paymentStatusChartRef.value.innerHTML = chartsLoading.value ? '加载中...' : `缴费状态: ${chartData.paymentStatusStats.length} 种状态`
  }
  if (occupancyChartRef.value) {
    occupancyChartRef.value.innerHTML = chartsLoading.value ? '加载中...' : `楼宇入住率: ${chartData.buildingOccupancy.length} 栋建筑`
  }
}

// 监听收入时间范围变化
watch(revenueTimeRange, () => {
  fetchRevenueData()
})

// 组件挂载后初始化
onMounted(async () => {
  await refreshData()
  nextTick(() => {
    initCharts()
  })
})

// 监听图表数据变化，更新图表显示
watch(() => chartData, () => {
  nextTick(() => {
    initCharts()
  })
}, { deep: true })
</script>

<style scoped>
.operation-overview {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 核心指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card.revenue::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #67C23A, #85CE61);
}

.metric-card.tenants::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #66B1FF);
}

.metric-card.contracts::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #E6A23C, #EBB563);
}

.metric-card.bills::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #F56C6C, #F78989);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.metric-trend.up {
  color: #67C23A;
  background: #f0f9ff;
}

.metric-trend.down {
  color: #F56C6C;
  background: #fef2f2;
}

.metric-content h2 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #303133;
}

.metric-content p {
  margin: 0 0 12px 0;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

.metric-detail {
  font-size: 12px;
  color: #606266;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 24px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  min-height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

/* 数据表格区域 */
.tables-section {
  margin-bottom: 24px;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.table-card {
  min-height: 300px;
}

/* 任务列表 */
.task-list {
  max-height: 240px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;
}

.task-item:hover {
  background-color: #f8f9fa;
}

.task-item.urgent {
  border-left: 3px solid #F56C6C;
  background-color: #fef2f2;
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.task-time {
  font-size: 11px;
  color: #909399;
}

/* 快速操作面板 */
.quick-actions-panel {
  margin-bottom: 24px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
}

.action-item:hover {
  background-color: #f8f9fa;
  color: #409EFF;
  transform: translateY(-2px);
}

.action-item span {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .table-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 