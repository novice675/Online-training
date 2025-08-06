<template>
  <div class="vehicle-info-container">
    <!-- 标题栏 -->
    <div class="header-area">
      <div class="title">
        <div class="title-bar"></div>
        <h2>车辆信息管理</h2>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增车辆</el-button>
        <el-button type="danger" :disabled="multipleSelection.length === 0" @click="handleBatchDelete" :icon="Delete">
          批量删除 ({{ multipleSelection.length }})
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号码">
          <el-input v-model="searchForm.licensePlate" placeholder="请输入车牌号码" clearable :prefix-icon="Search"
            style="width: 200px" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="searchForm.contactWay" placeholder="请输入联系方式" clearable :prefix-icon="Phone"
            style="width: 200px" />
        </el-form-item>
        <!-- 搜索区域的车辆类型选择框 -->
        <el-form-item label="车辆类型">
          <el-select v-model="searchForm.vehicleType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="请选择" value="" />
            <el-option label="临时车" value="临时车" />
            <el-option label="包月车" value="包月车" />
            <el-option label="周区车" value="周区车" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <div class="table-header">
        <div class="table-info">
          <span class="info-text">共找到 <strong>{{ total }}</strong> 条记录</span>
        </div>
      </div>

      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
        @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#f8f9fa', color: '#495057' }">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="ownerName" label="车主姓名" align="center" width="120">
          <template #default="{ row }">
            <div class="owner-info">
              <el-avatar :size="32" :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.ownerName}`" />
              <span class="owner-name">{{ row.ownerName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contactWay" label="联系方式" align="center" width="130">
          <template #default="{ row }">
            <div class="contact-info">
              <el-icon>
                <Phone />
              </el-icon>
              <span>{{ row.contactWay }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="licensePlate" label="车牌号码" align="center" width="120">
          <template #default="{ row }">
            <div class="license-plate">
              {{ row.licensePlate }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vehicleModel" label="车辆型号" align="center" min-width="180">
          <template #default="{ row }">
            <div class="vehicle-model">
              <el-icon>
                <CaretRight />
              </el-icon>
              <span>{{ row.vehicleModel }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="vehicleType" label="车辆类型" align="center" width="120">
          <template #default="{ row }">
            <span class="vehicle-type-text">{{ row.vehicleType }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" align="center" width="120">
          <template #default="{ row }">
            <div class="date-info">
              <el-icon>
                <Calendar />
              </el-icon>
              <span>{{ formatDate(row.startTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center" width="120">
          <template #default="{ row }">
            <div class="date-info">
              <el-icon>
                <Calendar />
              </el-icon>
              <span>{{ formatDate(row.endTime) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons-cell">
              <el-button type="primary" size="small" @click="handleEdit(row)" :icon="View">
                详情
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)" :icon="Delete">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-area">
      <el-pagination v-model="currentPage" :current-page="currentPage" :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增车辆' : '车辆详情'" width="700px"
      :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="vehicle-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车主姓名" prop="ownerName">
              <el-input v-model="form.ownerName" placeholder="请输入车主姓名" :prefix-icon="User" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactWay">
              <el-input v-model="form.contactWay" placeholder="请输入联系方式" :prefix-icon="Phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号码" prop="licensePlate">
              <el-input v-model="form.licensePlate" placeholder="请输入车牌号码" style="text-transform: uppercase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车辆型号" prop="vehicleModel">
              <el-input v-model="form.vehicleModel" placeholder="请输入车辆型号" :prefix-icon="CaretRight" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="vehicleType">
              <el-select v-model="form.vehicleType" placeholder="请选择车辆类型" style="width: 100%" clearable>
                <el-option label="临时车" value="临时车" />
                <el-option label="包月车" value="包月车" />
                <el-option label="周区车" value="周区车" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="date" placeholder="选择开始时间" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="date" placeholder="选择结束时间" style="width: 100%"
                format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" :icon="Close">取消</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="dialogType === 'add'" :icon="Check">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  Plus, Delete, Search, Refresh, Phone, User, CaretRight,
  Calendar, Close, Check
} from '@element-plus/icons-vue'
import axios from "axios"

// 搜索表单 - 修改初始值
const searchForm = reactive({
  licensePlate: '',
  contactWay: '',
  vehicleType: ''  // 保持空字符串，对应"全部"选项
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref<any[]>([])
const goToPage = ref<number | string>('')

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  ownerName: '',
  contactWay: '',
  licensePlate: '',
  vehicleModel: '',
  vehicleType: '',
  startTime: '',
  endTime: ''
})

// 表单验证规则
const rules = {
  ownerName: [
    { required: true, message: '请输入车主姓名', trigger: 'blur' }
  ],
  contactWay: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  licensePlate: [
    { required: true, message: '请输入车牌号码', trigger: 'blur' }
  ],
  vehicleModel: [
    { required: true, message: '请输入车辆型号', trigger: 'blur' }
  ],
  vehicleType: [
    { required: true, message: '请选择车辆类型', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}



// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm
    }

    const response = await axios.get('/vehicle/list', { params })

    if (response.data.code === 200) {
      tableData.value = response.data.data.list
      total.value = response.data.data.total
    } else {
      ElMessage.error(response.data.msg || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 表格多选
const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置搜索 - 确保重置时也设置为"全部"
const resetSearch = () => {
  Object.assign(searchForm, {
    licensePlate: '',
    contactWay: '',
    vehicleType: ''  // 重置为空字符串，对应"请选择"
  })
  handleSearch()
}

// 新增车辆
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  resetForm()
}

// 编辑车辆
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, {
    ...row,
    startTime: new Date(row.startTime),
    endTime: new Date(row.endTime)
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    ownerName: '',
    contactWay: '',
    licensePlate: '',
    vehicleModel: '',
    vehicleType: '',  // 确保重置为空字符串
    startTime: '',
    endTime: ''
  })
  formRef.value?.clearValidate()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/vehicle/add', form)
        if (response.data.code === 200) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(response.data.msg || '添加失败')
        }
      } catch (error) {
        ElMessage.error('添加失败')
      }
    }
  })
}

// 删除车辆
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该车辆记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/vehicle/delete/${row._id}`)

      if (response.data.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => { })
}

// 批量删除
const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(`确认删除选中的 ${multipleSelection.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = multipleSelection.value.map(item => item._id)
      const response = await axios.delete('/vehicle/batchDelete', {
        data: { ids }
      })

      if (response.data.code === 200) {
        ElMessage.success('批量删除成功')
        fetchData()
      } else {
        ElMessage.error(response.data.msg || '批量删除失败')
      }
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => { })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

// 跳转到指定页
const handleGoToPage = () => {
  if (!goToPage.value) return

  const page = Number(goToPage.value)
  if (isNaN(page) || page < 1 || page > Math.ceil(total.value / pageSize.value)) {
    ElMessage.warning('请输入有效的页码')
    return
  }

  currentPage.value = page
  fetchData()
  goToPage.value = ''
}
// 生命周期钩子
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.vehicle-info-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #4080ff, #1890ff);
  border-radius: 2px;
}

.title h2 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
  color: #1f2937;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-left: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.search-area {
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  flex-shrink: 0;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.option-desc {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 8px;
}

.table-area {
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-info .info-text {
  color: #6b7280;
  font-size: 14px;
}

.table-info strong {
  color: #1f2937;
  font-weight: 600;
}

.owner-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-name {
  font-weight: 500;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.vehicle-model {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
}

.action-buttons-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}


.vehicle-form {
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 组件样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f1f5f9;
}

:deep(.el-table__row:hover) {
  background-color: #f8fafc;
}

/* 下拉框样式 - 纯文字样式 */
:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
  color: #606266;
  font-size: 14px;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
  color: #409eff;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: #f5f7fa;
  color: #409eff;
  font-weight: 600;
}

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .vehicle-info-container {
    padding: 16px;
  }

  .header-area {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-area {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }

  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .action-buttons-cell {
    flex-direction: column;
    gap: 4px;
  }
}

.vehicle-type-text {
  color: #606266;
  font-weight: 500;
}
</style>