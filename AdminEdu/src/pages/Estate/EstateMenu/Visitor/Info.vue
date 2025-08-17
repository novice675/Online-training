<template>
  <div class="visitor-info-container">
    <!-- 标题栏 -->
    <div class="header-area">
      <div class="title">
        <div class="title-bar"></div>
        <h2>访客信息登记</h2>
      </div>
      <div class="action-buttons">

        <el-button type="danger"  @click="handleBatchDelete" :icon="Delete">
          批量删除 ({{ multipleSelection.length }})
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="访客姓名：">
          <el-input v-model="searchForm.name" placeholder="请输入访客姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="访客类型：">
          <el-select v-model="searchForm.visitType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="请选择" value="" />
            <el-option label="企业" value="企业" />
            <el-option label="公寓" value="公寓" />
            <el-option label="其它" value="其它" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式：">
          <el-input v-model="searchForm.phone" placeholder="请输入联系方式" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">查询</el-button>
          <el-button @click="resetSearch" :icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
        @selection-change="handleSelectionChange" :header-cell-style="{ backgroundColor: '#f8f9fa', color: '#495057' }">
        <el-table-column type="selection" width="55" align="center" />

        <el-table-column prop="name" label="访客姓名" align="center" width="120" />

        <el-table-column prop="phone" label="联系方式" align="center" width="130" />

        <el-table-column prop="visitType" label="访客类型" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visitType === '企业' ? 'success' : row.visitType === '公寓' ? 'warning' : 'info'">
              {{ row.visitType || '企业' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="companyName" label="造访单位" align="center" min-width="180" />

        <el-table-column prop="hasCar" label="是否驾车" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.carcode ? 'success' : 'info'">
              {{ row.carcode ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="carcode" label="车牌号码" align="center" width="120">
          <template #default="{ row }">
            <div class="license-plate" v-if="row.carcode">
              {{ row.carcode }}
            </div>
            <span v-else class="no-car">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="time" label="造访结束时间" align="center" width="160">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.time) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
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
      <div class="pagination-info">
        <span>共 {{ total }} 条记录，当前第 {{ currentPage }} 页</span>
      </div>
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" background />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增访客' : '访客详情'" width="700px"
      :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="visitor-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="访客姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入访客姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="sfz">
              <el-input v-model="form.sfz" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="访客类型" prop="visitType">
              <el-select v-model="form.visitType" placeholder="请选择访客类型" style="width: 100%" clearable>
                <el-option label="企业" value="企业" />
                <el-option label="公寓" value="公寓" />
                <el-option label="其它" value="访客" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="造访单位" prop="company">
              <el-select v-model="form.company" placeholder="请选择造访单位" style="width: 100%" clearable filterable>
                <el-option v-for="company in companyList" :key="company._id" :label="company.name"
                  :value="company.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到访时间" prop="time">
              <el-date-picker v-model="form.time" type="datetime" placeholder="选择到访时间" style="width: 100%"
                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号码">
              <el-input v-model="form.carcode" placeholder="如有车辆请输入车牌号" style="text-transform: uppercase" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车辆类型">
              <el-select v-model="form.cartype" placeholder="请选择车辆类型" style="width: 100%" clearable>
                <el-option label="轿车" value="轿车" />
                <el-option label="SUV" value="SUV" />
                <el-option label="商务车" value="商务车" />
                <el-option label="货车" value="货车" />
              </el-select>
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
  Plus, Delete, Search, Refresh, Close, Check, View
} from '@element-plus/icons-vue'
import axios from "axios"

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  visitType: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref<any[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

// 企业列表
const companyList = ref<any[]>([])

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  sfz: '',
  visitType: '企业', // 默认为企业
  company: '',
  time: '',
  carcode: '',
  cartype: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入访客姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sfz: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  visitType: [
    { required: true, message: '请选择访客类型', trigger: 'change' }
  ],
  company: [
    { required: true, message: '请选择造访单位', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择到访时间', trigger: 'change' }
  ]
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取企业列表
const fetchCompanyList = async () => {
  try {
    const response = await axios.get('/WYQ/company')
    if (response.data.code === 200) {
      companyList.value = response.data.list
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 获取表格数据 - 修改接口地址
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.name,
      phone: searchForm.phone,
      visitType: searchForm.visitType
    }

    // 修改接口地址为新的接口
    const response = await axios.get('/WYQ/visitor/list', { params })

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

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    visitType: ''
  })
  handleSearch()
}

// 新增访客
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  resetForm()
}

// 编辑访客
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, {
    ...row,
    company: row.companyName,
    time: row.time ? new Date(row.time).toISOString().slice(0, 19).replace('T', ' ') : ''
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    phone: '',
    sfz: '',
    visitType: '企业',
    company: '',
    time: '',
    carcode: '',
    cartype: ''
  })
  formRef.value?.clearValidate()
}

// 提交表单 - 修改接口地址
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 修改接口地址为新的添加接口
        const response = await axios.post('/WYQ/visitor/add', form)
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

// 删除访客
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该访客记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await axios.delete(`/WYQ/visitor/delete/${row._id}`)

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
      const response = await axios.delete('/WYQ/visitor/batchDelete', {
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

// 生命周期钩子
onMounted(() => {
  fetchCompanyList()
  fetchData()
})
</script>

<style scoped>
.visitor-info-container {
  padding: 24px;
  background-color: #f5f7fa;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
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

.license-plate {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.no-car {
  color: #9ca3af;
  font-style: italic;
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

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.visitor-form {
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

:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .visitor-info-container {
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
</style>