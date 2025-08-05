<template>
  <div class="vehicle-info-container">
    <!-- 标题栏 -->
    <div class="header-area">
      <div class="title">
        <div class="title-bar"></div>
        <h2>车辆信息管理</h2>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="warning" :disabled="multipleSelection.length === 0"
          @click="handleBatchDelete">批量删除</el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号码：">
          <el-input v-model="searchForm.licensePlate" placeholder="请输入车牌号码" clearable />
        </el-form-item>
        <el-form-item label="联系方式：">
          <el-input v-model="searchForm.contactWay" placeholder="请输入联系方式" clearable />
        </el-form-item>
        <el-form-item label="车辆类型：">
          <el-select v-model="searchForm.vehicleType" placeholder="请选择" clearable>
            <el-option label="包月车" value="包月车" />
            <el-option label="临时车" value="临时车" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ownerName" label="车主姓名" align="center" />
        <el-table-column prop="contactWay" label="联系方式" align="center" />
        <el-table-column prop="licensePlate" label="车牌号码" align="center" />
        <el-table-column prop="vehicleModel" label="车辆型号" align="center" />
        <el-table-column prop="vehicleType" label="车辆类型" align="center">
          <template #default="{ row }">
            <el-tag :type="row.vehicleType === '包月车' ? 'success' : 'warning'">
              {{ row.vehicleType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" align="center">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center">
          <template #default="{ row }">
            {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-area">
      <div class="pagination-info">
        共 {{ total }} 条
      </div>
      <el-pagination v-model="currentPage" :current-page="currentPage" :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]" layout="sizes, prev, pager, next, jumper" :total="total"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      <div class="pagination-goto">
        到第
        <el-input v-model="goToPage" class="page-input" />
        页
        <el-button size="small" @click="handleGoToPage">确定</el-button>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增车辆' : '车辆详情'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车主姓名" prop="ownerName">
              <el-input v-model="form.ownerName" placeholder="请输入车主姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactWay">
              <el-input v-model="form.contactWay" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号码" prop="licensePlate">
              <el-input v-model="form.licensePlate" placeholder="请输入车牌号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车辆型号" prop="vehicleModel">
              <el-input v-model="form.vehicleModel" placeholder="请输入车辆型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="vehicleType">
              <el-select v-model="form.vehicleType" placeholder="请选择车辆类型" style="width: 100%">
                <el-option label="包月车" value="包月车" />
                <el-option label="临时车" value="临时车" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="date" placeholder="选择开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="date" placeholder="选择结束时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="dialogType === 'add'">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import axios from '../../../../utils/axios'

// 搜索表单
const searchForm = reactive({
  licensePlate: '',
  contactWay: '',
  vehicleType: ''
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

// 生命周期钩子
onMounted(() => {
  fetchData()
})

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
    console.error('获取数据失败:', error)
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

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    licensePlate: '',
    contactWay: '',
    vehicleType: ''
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
    vehicleType: '',
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
        console.error('添加失败:', error)
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
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
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
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
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
</script>

<style scoped>
.vehicle-info-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
}

.title-bar {
  width: 4px;
  height: 20px;
  background-color: #4080ff;
  margin-right: 8px;
}

.title h2 {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.search-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  flex-shrink: 0;
}

.table-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-area :deep(.el-table) {
  flex: 1;
}

.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-goto {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.page-input {
  width: 50px;
  margin: 0 5px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

:deep(.el-form-item) {
  margin-right: 20px;
}

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .vehicle-info-container {
    padding: 15px;
  }

  .pagination-area {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .pagination-goto {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .vehicle-info-container {
    padding: 10px;
  }

  .header-area {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .search-area,
  .table-area,
  .pagination-area {
    padding: 15px;
  }
}
</style>