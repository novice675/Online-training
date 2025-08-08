<template>
  <div class="tenant-bill-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>租户账单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除 ({{ selectedRows.length }})
        </el-button>
      </div>
    </div>

    <!-- 筛选面板 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="租户名称：">
          <el-input 
            v-model="filterForm.companyName" 
            placeholder="请输入租户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="所属楼宇：">
          <el-input 
            v-model="filterForm.buildingName" 
            placeholder="请输入楼宇名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        
        <el-form-item label="房间名称：">
          <el-input 
            v-model="filterForm.roomNumber" 
            placeholder="请输入房间名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-form :model="filterForm" inline style="margin-top: 10px">
        <el-form-item label="账单类型：">
          <el-select 
            v-model="filterForm.billType" 
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="水电费" value="水电费" />
            <el-option label="物业费" value="物业费" />
          </el-select>
        </el-form-item>

        
        <el-form-item label="缴费状态：">
          <el-select 
            v-model="filterForm.paymentStatus" 
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="未缴费" value="未缴费" />
            <el-option label="已缴费" value="已缴费" />
            <el-option label="逾期" value="逾期" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="租户名称" min-width="150">
          <template #default="{ row }">
            <span>{{ row.company?.name || '暂无' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="账单编号" min-width="160">
          <template #default="{ row }">
            <span style="color: #409EFF; font-weight: 500;">{{ row.billNumber }}</span>
          </template>
        </el-table-column>
        <el-table-column label="账单类型" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.billType === '水电费' ? 'primary' : 'success'"
              size="small"
            >
              {{ row.billType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usage" label="使用量" width="80" />
        <el-table-column prop="unitPrice" label="单价" width="80" />
        <el-table-column label="出账时间" width="110">
          <template #default="{ row }">
            <span>{{ formatDate(row.startDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="缴费时间" width="110">
          <template #default="{ row }">
            <span>{{ formatDate(row.dueDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="缴费状态" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getPaymentStatusType(row.paymentStatus)"
              size="small"
            >
              {{ row.paymentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
            <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="账单详情"
      width="900px"
      @close="handleDetailClose"
    >
      <div v-if="currentDetail" class="bill-detail">
        <!-- 基本信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
              <el-tag 
                :type="getPaymentStatusType(currentDetail.paymentStatus)"
                size="large"
              >
                {{ currentDetail.paymentStatus }}
              </el-tag>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">账单编号：</span>
                <span class="value highlight">{{ currentDetail.billNumber }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">账单类型：</span>
                <el-tag 
                  :type="currentDetail.billType === '水电费' ? 'primary' : 'success'"
                  size="small"
                >
                  {{ currentDetail.billType }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">开始时间：</span>
                <span class="value">{{ formatDate(currentDetail.startDate) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">到期时间：</span>
                <span class="value">{{ formatDate(currentDetail.dueDate) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 租户信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span>租户信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">企业名称：</span>
                <span class="value">{{ currentDetail.company?.name || '暂无' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">企业类型：</span>
                <span class="value">{{ currentDetail.company?.type || '暂无' }}</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">所属楼宇：</span>
                <span class="value">{{ currentDetail.building?.name || '暂无' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">房间号：</span>
                <span class="value">{{ currentDetail.house?.number || '暂无' }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 费用信息 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span>费用信息</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">单价：</span>
                <span class="value amount">{{ currentDetail.unitPrice }} 元</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">使用量：</span>
                <span class="value">{{ currentDetail.usage }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">应缴金额：</span>
                <span class="value amount highlight">{{ (currentDetail.amount || 0).toFixed(2) }} 元</span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">已缴金额：</span>
                <span class="value amount success">{{ (currentDetail.paidAmount || 0).toFixed(2) }} 元</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">剩余金额：</span>
                <span class="value amount" :class="{ 'danger': getRemainingAmount(currentDetail) > 0 }">
                  {{ getRemainingAmount(currentDetail).toFixed(2) }} 元
                </span>
              </div>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" v-if="currentDetail.paymentDate">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">缴费时间：</span>
                <span class="value">{{ formatDate(currentDetail.paymentDate) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 备注信息 -->
        <el-card class="detail-card" shadow="never" v-if="currentDetail.remarks">
          <template #header>
            <span>备注信息</span>
          </template>
          
          <div class="detail-item">
            <p class="remarks">{{ currentDetail.remarks }}</p>
          </div>
        </el-card>

        <!-- 操作记录 -->
        <el-card class="detail-card" shadow="never">
          <template #header>
            <span>操作记录</span>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">创建时间：</span>
                <span class="value">{{ formatDateTime(currentDetail.createdAt) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">更新时间：</span>
                <span class="value">{{ formatDateTime(currentDetail.updatedAt) }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDetailClose">关闭</el-button>
          <el-button type="primary" @click="handleEditFromDetail">编辑账单</el-button>
          <el-button 
            type="success" 
            v-if="currentDetail && currentDetail.paymentStatus !== '已缴费'"
            @click="handlePayment"
          >
            记录缴费
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑账单' : '新增账单'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="租户企业" prop="companyId">
              <el-select v-model="formData.companyId" placeholder="请选择租户企业" style="width: 100%">
                <el-option
                  v-for="company in companyList"
                  :key="company._id"
                  :label="company.name"
                  :value="company._id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账单类型" prop="billType">
              <el-select v-model="formData.billType" placeholder="请选择账单类型" style="width: 100%">
                <el-option label="水电费" value="水电费" />
                <el-option label="物业费" value="物业费" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
                 <el-row :gutter="20">
           <el-col :span="12">
             <el-form-item label="开始时间" prop="startDate">
               <el-date-picker
                 v-model="formData.startDate"
                 type="date"
                 placeholder="请选择开始时间"
                 style="width: 100%"
               />
             </el-form-item>
           </el-col>
           <el-col :span="12">
             <el-form-item label="到期时间" prop="dueDate">
               <el-date-picker
                 v-model="formData.dueDate"
                 type="date"
                 placeholder="请选择到期时间"
                 style="width: 100%"
               />
             </el-form-item>
           </el-col>
         </el-row>
        
                 <el-row :gutter="20">
           <el-col :span="12">
             <el-form-item label="单价" prop="unitPrice">
               <el-input-number 
                 v-model="formData.unitPrice" 
                 :min="0" 
                 :precision="2"
                 placeholder="请输入单价"
                 style="width: 100%"
               />
             </el-form-item>
           </el-col>
           <el-col :span="12">
             <el-form-item label="使用量" prop="usage">
               <el-input-number 
                 v-model="formData.usage" 
                 :min="0"
                 placeholder="请输入使用量"
                 style="width: 100%"
               />
             </el-form-item>
           </el-col>
         </el-row>
         
         <el-row :gutter="20">
           <el-col :span="12">
             <el-form-item label="缴费状态">
               <el-select v-model="formData.paymentStatus" placeholder="请选择缴费状态" style="width: 100%">
                 <el-option label="未缴费" value="未缴费" />
                 <el-option label="已缴费" value="已缴费" />
                 <el-option label="部分缴费" value="部分缴费" />
                 <el-option label="逾期" value="逾期" />
               </el-select>
             </el-form-item>
           </el-col>
         </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="formData.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '更新' : '新增' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getTenantBillList, 
  addTenantBill, 
  updateTenantBill, 
  deleteTenantBill, 
  batchDeleteTenantBill,
  getTenantBillCompanies
} from '@/api/auth'

// 接口定义
interface TenantBillData {
  _id?: string
  billNumber?: string
  companyId: string
  billType: '水电费' | '物业费'
  startDate: string | Date
  endDate?: string | Date
  unitPrice: number
  usage: number
  amount?: number
  paymentStatus: '未缴费' | '已缴费' | '部分缴费' | '逾期'
  paidAmount?: number
  paymentDate?: string | Date
  dueDate: string | Date
  remarks?: string
  company?: any
  building?: any
  house?: any
  createdAt?: string
  updatedAt?: string
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref('')
const currentDetail = ref<TenantBillData | null>(null)
const selectedRows = ref<TenantBillData[]>([])
const tableData = ref<TenantBillData[]>([])
const companyList = ref<any[]>([])
const formRef = ref()

// 分页信息
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 筛选表单
const filterForm = reactive({
  companyName: '',
  buildingName: '',
  roomNumber: '',
  billType: '',
  startDate: '',
  paymentStatus: ''
})

// 表单数据
const formData = ref<TenantBillData>({
  companyId: '',
  billType: '水电费',
  startDate: '',
  unitPrice: 0,
  usage: 0,
  paymentStatus: '未缴费',
  dueDate: '',
  remarks: ''
})

// 表单验证规则
const formRules = {
  companyId: [{ required: true, message: '请选择租户企业', trigger: 'change' }],
  billType: [{ required: true, message: '请选择账单类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  dueDate: [{ required: true, message: '请选择到期时间', trigger: 'change' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  usage: [{ required: true, message: '请输入使用量', trigger: 'blur' }]
}

// 获取企业列表
const fetchCompanyList = async () => {
  try {
    const response = await getTenantBillCompanies()
    if (response.data.code === 200) {
      companyList.value = response.data.data || []
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 获取账单列表
const fetchList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...filterForm
    }
    
    // 清除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await getTenantBillList(params)
    if (response.data.code === 200) {
      tableData.value = response.data.data.list || []
      pagination.total = response.data.data.total || 0
    } else {
      ElMessage.error(response.data.message || '获取列表失败')
    }
  } catch (error: any) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  pagination.page = 1
  fetchList()
}

// 分页事件
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchList()
}

// 选择事件
const handleSelectionChange = (selection: TenantBillData[]) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  currentEditId.value = ''
  formData.value = {
    companyId: '',
    billType: '水电费',
    startDate: '',
    unitPrice: 0,
    usage: 0,
    paymentStatus: '未缴费',
    dueDate: '',
    remarks: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: TenantBillData) => {
  isEdit.value = true
  currentEditId.value = row._id || ''
  formData.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: TenantBillData) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteTenantBill(row._id || '')
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchList()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row._id).filter(Boolean)
    const response = await batchDeleteTenantBill(ids)
    if (response.data.code === 200) {
      ElMessage.success(`成功删除 ${response.data.deletedCount} 条记录`)
      fetchList()
      selectedRows.value = []
    } else {
      ElMessage.error(response.data.message || '批量删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    let response: any
    if (isEdit.value) {
      response = await updateTenantBill(currentEditId.value, formData.value)
    } else {
      response = await addTenantBill(formData.value)
    }
    
    if (response.data.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error(response.data.message || (isEdit.value ? '更新失败' : '新增失败'))
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 查看详情
const handleView = (row: TenantBillData) => {
  currentDetail.value = row
  detailVisible.value = true
}

// 关闭详情弹窗
const handleDetailClose = () => {
  detailVisible.value = false
  currentDetail.value = null
}

// 从详情页面编辑
const handleEditFromDetail = () => {
  if (currentDetail.value) {
    handleEdit(currentDetail.value)
    detailVisible.value = false
  }
}

// 记录缴费
const handlePayment = () => {
  ElMessage.info('记录缴费功能开发中...')
}

// 计算剩余金额
const getRemainingAmount = (bill: TenantBillData) => {
  return (bill.amount || 0) - (bill.paidAmount || 0)
}

// 格式化日期时间
const formatDateTime = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

// 获取缴费状态类型
const getPaymentStatusType = (status: string) => {
  switch (status) {
    case '已缴费': return 'success'
    case '部分缴费': return 'warning'
    case '逾期': return 'danger'
    case '未缴费': return 'info'
    default: return 'info'
  }
}

// 初始化
onMounted(() => {
  fetchCompanyList()
  fetchList()
})
</script>

<style scoped>
.tenant-bill-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 详情页面样式 */
.bill-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.detail-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
  margin-right: 10px;
}

.detail-item .value {
  color: #303133;
}

.detail-item .value.highlight {
  color: #409EFF;
  font-weight: 600;
}

.detail-item .value.amount {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.detail-item .value.success {
  color: #67C23A;
}

.detail-item .value.danger {
  color: #F56C6C;
}

.remarks {
  margin: 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
