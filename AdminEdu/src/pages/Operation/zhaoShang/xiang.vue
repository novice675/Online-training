<template>
  <div class="contract-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" type="info" icon="ArrowLeft">返回</el-button>
        <h2>合同详情</h2>
      </div>
      <div class="header-actions">
        <el-button v-if="!isEditing" @click="handleEdit" type="primary" icon="Edit">编辑</el-button>
        <el-button v-if="isEditing" @click="handleSave" type="success" icon="Check" :loading="saving">保存</el-button>
        <el-button v-if="isEditing" @click="handleCancel" icon="Close">取消</el-button>
        <el-button @click="handleDelete" type="danger" icon="Delete">删除</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 合同详情内容 -->
    <div v-else-if="contractData" class="detail-content">
      <!-- 合同状态卡片 -->
      <el-card class="status-card" shadow="hover">
        <div class="status-info">
          <div class="status-badge">
            <el-tag :type="getStatusType(contractData.endDate)" size="large">
              {{ getContractStatus(contractData.endDate) }}
            </el-tag>
          </div>
          <div class="status-details">
            <h3>合同编号：{{ contractData.he_bian }}</h3>
            <p>合同属性：
              <el-tag :type="contractData.shuxing === '新签' ? 'success' : 'warning'">
                {{ contractData.shuxing }}
              </el-tag>
            </p>
            <div class="time-info">
              <span>签订时间：{{ formatDate(contractData.startDate) }}</span>
              <span>到期时间：{{ formatDate(contractData.endDate) }}</span>
            </div>
          </div>
          <div class="status-icon">
            <el-icon size="60" :color="getStatusColor(contractData.endDate)">
              <Document />
            </el-icon>
          </div>
        </div>
      </el-card>

      <!-- 详细信息 -->
      <el-row :gutter="20">
        <!-- 基本信息 -->
        <el-col :span="12">
          <el-card title="基本信息" class="info-card">
            <template #header>
              <span class="card-title">基本信息</span>
            </template>
            
            <div class="info-grid">
              <div class="info-item">
                <label>合同编号：</label>
                <span v-if="!isEditing">{{ contractData.he_bian }}</span>
                <el-input v-else v-model="editForm.he_bian" />
              </div>
              
              <div class="info-item">
                <label>合同属性：</label>
                <span v-if="!isEditing">
                  <el-tag :type="contractData.shuxing === '新签' ? 'success' : 'warning'">
                    {{ contractData.shuxing }}
                  </el-tag>
                </span>
                <el-select v-else v-model="editForm.shuxing" style="width: 100%">
                  <el-option label="新签" value="新签" />
                  <el-option label="续签" value="续签" />
                </el-select>
              </div>
              
              <div class="info-item">
                <label>签订人：</label>
                <span v-if="!isEditing">{{ contractData.qianPeople }}</span>
                <el-input v-else v-model="editForm.qianPeople" />
              </div>
              
              <div class="info-item">
                <label>联系方式：</label>
                <span v-if="!isEditing">{{ contractData.phone }}</span>
                <el-input v-else v-model="editForm.phone" />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 时间信息 -->
        <el-col :span="12">
          <el-card title="时间信息" class="info-card">
            <template #header>
              <span class="card-title">时间信息</span>
            </template>
            
            <div class="info-grid">
              <div class="info-item">
                <label>签订时间：</label>
                <span v-if="!isEditing">{{ formatDate(contractData.startDate) }}</span>
                <el-date-picker v-else v-model="editForm.startDate" type="date" style="width: 100%" />
              </div>
              
              <div class="info-item">
                <label>到期时间：</label>
                <span v-if="!isEditing">{{ formatDate(contractData.endDate) }}</span>
                <el-date-picker v-else v-model="editForm.endDate" type="date" style="width: 100%" />
              </div>
              
              <div class="info-item">
                <label>合同期限：</label>
                <span>{{ getContractDuration() }}</span>
              </div>
              
              <div class="info-item">
                <label>剩余天数：</label>
                <span :class="getRemainingDaysClass()">{{ getRemainingDays() }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 备注信息 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card title="备注信息" class="info-card">
            <template #header>
              <span class="card-title">备注信息</span>
            </template>
            
            <div class="remark-content">
              <div v-if="!isEditing" class="remark-text">
                {{ contractData.beizhu || '暂无备注' }}
              </div>
              <el-input v-else v-model="editForm.beizhu" type="textarea" :rows="4" placeholder="请输入备注信息" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="合同信息不存在或加载失败">
        <el-button @click="goBack">返回列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, ArrowLeft, Edit, Check, Close, Delete } from '@element-plus/icons-vue'
import { hetongDetail, updateHetong, deleteHetong } from '@/api/auth'

// 类型定义
interface ContractData {
  _id?: string
  he_bian: string
  shuxing: '新签' | '续签'
  qianPeople: string
  phone: string
  startDate: string | Date | null
  endDate: string | Date | null
  beizhu?: string
  created_at?: string
  updated_at?: string
}

interface EditForm {
  he_bian: string
  shuxing: '新签' | '续签'
  qianPeople: string
  phone: string
  startDate: Date | null
  endDate: Date | null
  beizhu: string
}

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading: Ref<boolean> = ref(true)
const saving: Ref<boolean> = ref(false)
const isEditing: Ref<boolean> = ref(false)
const contractData: Ref<ContractData | null> = ref(null)

// 编辑表单
const editForm: EditForm = reactive({
  he_bian: '',
  shuxing: '新签',
  qianPeople: '',
  phone: '',
  startDate: null,
  endDate: null,
  beizhu: ''
})

// 获取合同详情
const fetchContractDetail = async (): Promise<void> => {
  try {
    loading.value = true
    const contractId = route.params.id || route.query.id
    
    if (!contractId) {
      ElMessage.error('缺少合同ID参数')
      goBack()
      return
    }

    const response = await hetongDetail(contractId as string)
    console.log('合同详情API响应:', response)
    
    if (response.data.code === 200) {
      contractData.value = response.data.data
      console.log('获取到的合同数据:', contractData.value)
      
      // 填充编辑表单
      Object.keys(editForm).forEach((key: string) => {
        if (contractData.value && (contractData.value as any)[key] !== undefined) {
          if (key === 'startDate' || key === 'endDate') {
            ;(editForm as any)[key] = (contractData.value as any)[key] ? new Date((contractData.value as any)[key]) : null
          } else {
            ;(editForm as any)[key] = (contractData.value as any)[key] || ''
          }
        }
      })
    } else {
      ElMessage.error(response.data.msg || '获取合同详情失败')
      contractData.value = null
    }
  } catch (error: any) {
    console.error('获取合同详情失败:', error)
    ElMessage.error('获取合同详情失败')
    contractData.value = null
  } finally {
    loading.value = false
  }
}

// 工具函数
const formatDate = (dateStr: string | Date | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getContractStatus = (endDate: string | Date | undefined): string => {
  if (!endDate) return '未知'
  return new Date(endDate) > new Date() ? '生效中' : '已到期'
}

const getStatusType = (endDate: string | Date | undefined): string => {
  if (!endDate) return 'info'
  return new Date(endDate) > new Date() ? 'success' : 'danger'
}

const getStatusColor = (endDate: string | Date | undefined): string => {
  if (!endDate) return '#909399'
  return new Date(endDate) > new Date() ? '#67C23A' : '#F56C6C'
}

const getContractDuration = (): string => {
  if (!contractData.value?.startDate || !contractData.value?.endDate) return '-'
  const start = new Date(contractData.value.startDate)
  const end = new Date(contractData.value.endDate)
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  
  if (years > 0) {
    return `${years}年${months > 0 ? months + '个月' : ''}`
  } else if (months > 0) {
    return `${months}个月`
  } else {
    return `${days}天`
  }
}

const getRemainingDays = (): string => {
  if (!contractData.value?.endDate) return '-'
  const now = new Date()
  const end = new Date(contractData.value.endDate)
  const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (remaining > 0) {
    return `${remaining}天`
  } else if (remaining === 0) {
    return '今日到期'
  } else {
    return `已过期${Math.abs(remaining)}天`
  }
}

const getRemainingDaysClass = (): string => {
  if (!contractData.value?.endDate) return ''
  const now = new Date()
  const end = new Date(contractData.value.endDate)
  const remaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (remaining <= 0) return 'text-danger'
  if (remaining <= 30) return 'text-warning'
  return 'text-success'
}

// 事件处理
const goBack = (): void => {
  router.go(-1)
}

const handleEdit = (): void => {
  isEditing.value = true
}

const handleCancel = (): void => {
  isEditing.value = false
  // 重置编辑表单
  Object.keys(editForm).forEach((key: string) => {
    if (contractData.value && (contractData.value as any)[key] !== undefined) {
      if (key === 'startDate' || key === 'endDate') {
        ;(editForm as any)[key] = (contractData.value as any)[key] ? new Date((contractData.value as any)[key]) : null
      } else {
        ;(editForm as any)[key] = (contractData.value as any)[key] || ''
      }
    }
  })
}

const handleSave = async (): Promise<void> => {
  try {
    saving.value = true
    const contractId = route.params.id || route.query.id
    
    const response = await updateHetong(contractId as string, editForm)
    if (response.data.code === 200) {
      ElMessage.success('合同更新成功')
      isEditing.value = false
      await fetchContractDetail() // 重新获取数据
    } else {
      ElMessage.error(response.data.msg || '更新失败')
    }
  } catch (error: any) {
    console.error('更新合同失败:', error)
    ElMessage.error('更新失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除这个合同吗？删除后无法恢复！', '危险操作', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      buttonSize: 'default'
    })
    
    const contractId = route.params.id || route.query.id
    const response = await deleteHetong(contractId as string)
    if (response.data.code === 200) {
      ElMessage.success('合同删除成功')
      goBack()
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除合同失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 生命周期
onMounted(() => {
  fetchContractDetail()
})
</script>

<style scoped>
/* 重置页面布局 */
* {
  box-sizing: border-box;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.contract-detail {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding-bottom: 40px;
}

.status-card {
  margin-bottom: 20px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-badge {
  flex-shrink: 0;
}

.status-details {
  flex: 1;
}

.status-details h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.status-details p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 16px;
}

.time-info {
  display: flex;
  gap: 24px;
  color: #909399;
  font-size: 14px;
}

.status-icon {
  flex-shrink: 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-title {
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
}

.text-success {
  color: #67C23A;
  font-weight: 600;
}

.text-warning {
  color: #E6A23C;
  font-weight: 600;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}

.remark-content {
  min-height: 60px;
}

.remark-text {
  color: #303133;
  line-height: 1.6;
  padding: 12px;
  background: #F5F7FA;
  border-radius: 4px;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.error-container {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-tag) {
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .status-info {
    flex-direction: column;
    text-align: center;
  }
  
  .time-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
