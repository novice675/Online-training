<template>
  <div class="hetong-container">
    <PageHeader 
      title="合同管理"
      :show-add="true"
      :show-batch-delete="true"
      :selected-count="selectedRows.length"
      @add="handleAdd"
      @batch-delete="handleBatchDelete"
    />

    <FilterPanel 
      v-model="filterForm"
      :filter-fields="filterFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <DataTable 
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #shuxing="{ row }">
        <el-tag :type="row.shuxing === '新签' ? 'success' : 'warning'">{{ row.shuxing }}</el-tag>
      </template>

      <template #status="{ row }">
        <el-tag :type="getStatusType(row.endDate)">
          {{ getContractStatus(row.endDate) }}
        </el-tag>
      </template>

      <template #startDate="{ row }">
        <span>{{ formatDate(row.startDate) }}</span>
      </template>

      <template #endDate="{ row }">
        <span>{{ formatDate(row.endDate) }}</span>
      </template>

      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">详情</el-button>
        <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </DataTable>

    <FormDialog 
      v-model="dialogVisible"
      :title="isEdit ? '编辑合同' : '新增合同'"
      :form-data="formData"
      :form-groups="formGroups"
      :submitting="submitLoading"
      use-layout
      @update:formData="handleFormDataUpdate"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import FormDialog from '@/components/FormDialog.vue'
import type { Column } from '@/components/DataTable.vue'
import type { FormGroup } from '@/components/FormDialog.vue'
import { useCrud } from '@/composables/useCrud'
import { 
  hetongList, 
  addHetong, 
  updateHetong, 
  deleteHetong, 
  batchDeleteHetong,
  generateHetongNumber 
} from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface HetongData {
  _id: string
  he_bian: string
  shuxing: string
  qianPeople: string
  phone: string
  startDate: string | Date
  endDate: string | Date
  beizhu?: string
  created_at?: string
  updated_at?: string
}

const {
  tableData,
  loading,
  submitLoading,
  dialogVisible,
  isEdit,
  selectedRows,
  pagination,
  formData,
  filterForm,
  fetchList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleAdd: originalHandleAdd,
  handleEdit: originalHandleEdit,
  handleDelete,
  handleBatchDelete,
  handleSubmit: originalHandleSubmit,
  handleCancel
} = useCrud<HetongData>({
  listApi: hetongList,
  addApi: addHetong,
  updateApi: updateHetong,
  deleteApi: deleteHetong,
  batchDeleteApi: batchDeleteHetong,
  pageSize: 10,
  defaultFormData: () => ({
    he_bian: '',
    shuxing: '新签',
    qianPeople: '',
    phone: '',
    startDate: '',
    endDate: '',
    beizhu: ''
  })
})

// 重写编辑处理函数，确保日期字段正确处理
const handleEdit = (row: HetongData) => {
  // 处理日期字段转换
  const editData = { ...row }
  if (editData.startDate) {
    editData.startDate = new Date(editData.startDate)
  }
  if (editData.endDate) {
    editData.endDate = new Date(editData.endDate)
  }
  
  // 调用原始编辑方法
  originalHandleEdit(editData)
}

// 重写提交处理函数，确保日期格式正确
const handleSubmit = async () => {
  try {
    // 处理日期字段格式
    const submitData = { ...formData.value }
    if (submitData.startDate && submitData.startDate instanceof Date) {
      submitData.startDate = submitData.startDate.toISOString().split('T')[0]
    }
    if (submitData.endDate && submitData.endDate instanceof Date) {
      submitData.endDate = submitData.endDate.toISOString().split('T')[0]
    }
    
    // 临时更新formData
    const originalStartDate = formData.value.startDate
    const originalEndDate = formData.value.endDate
    
    formData.value.startDate = submitData.startDate
    formData.value.endDate = submitData.endDate
    
    try {
      await originalHandleSubmit()
    } finally {
      // 恢复原始数据
      formData.value.startDate = originalStartDate
      formData.value.endDate = originalEndDate
    }
  } catch (error) {
    console.error('提交合同失败:', error)
  }
}

// 重写新增处理函数，自动生成合同编号
const handleAdd = async () => {
  try {
    // 生成新的合同编号
    const newHebian = await generateContractNumber()
    
    // 调用原始新增方法
    originalHandleAdd()
    
    // 设置自动生成的合同编号
    formData.value.he_bian = newHebian
  } catch (error) {
    console.error('生成合同编号失败:', error)
    ElMessage.error('生成合同编号失败')
  }
}

// 生成合同编号的函数
const generateContractNumber = async (): Promise<string> => {
  try {
    const response = await generateHetongNumber()
    if (response.data.code === 200 && response.data.data) {
      return response.data.data.he_bian
    } else {
      throw new Error(response.data.msg || '生成合同编号失败')
    }
  } catch (error) {
    console.error('生成合同编号时出错:', error)
    // 如果出错，使用时间戳作为后备方案
    const timestamp = Date.now().toString().slice(-4)
    return `HT${new Date().getFullYear()}${timestamp}`
  }
}

// 处理表单数据更新
const handleFormDataUpdate = (newFormData: HetongData) => {
  Object.assign(formData.value, newFormData)
}

const filterFields = [
  {
    key: 'he_bian',
    label: '合同编号',
    type: 'input' as const,
    placeholder: '请输入合同编号'
  },
  {
    key: 'qianPeople',
    label: '签约人',
    type: 'input' as const,
    placeholder: '请输入签约人'
  },
  {
    key: 'shuxing',
    label: '合同属性',
    type: 'select' as const,
    placeholder: '请选择合同属性',
    options: [
      { label: '新签', value: '新签' },
      { label: '续签', value: '续签' }
    ]
  },
  {
    key: 'status_filter',
    label: '合同状态',
    type: 'select' as const,
    placeholder: '请选择合同状态',
    options: [
      { label: '生效中', value: '生效中' },
      { label: '已到期', value: '已到期' }
    ]
  }
]

const columns: Column[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'he_bian', label: '合同编号', minWidth: 150, showOverflowTooltip: true },
  { prop: 'shuxing', label: '合同属性', width: 100, slot: 'shuxing' },
  { prop: 'qianPeople', label: '签约人', width: 120 },
  { prop: 'phone', label: '联系方式', width: 130 },
  { prop: 'status', label: '合同状态', width: 100, slot: 'status' },
  { prop: 'startDate', label: '签约时间', width: 120, slot: 'startDate' },
  { prop: 'endDate', label: '到期时间', width: 120, slot: 'endDate' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]

const formGroups: FormGroup[] = [
  {
    title: '基本信息',
    fields: [
      {
        key: 'he_bian',
        label: '合同编号',
        type: 'input',
        placeholder: '自动生成',
        required: true,
        disabled: true,
        rules: [{ required: true, message: '合同编号不能为空' }]
      },
      {
        key: 'shuxing',
        label: '合同属性',
        type: 'select',
        placeholder: '请选择合同属性',
        required: true,
        options: [
          { label: '新签', value: '新签' },
          { label: '续签', value: '续签' }
        ],
        rules: [{ required: true, message: '请选择合同属性' }]
      },
      {
        key: 'qianPeople',
        label: '签约人',
        type: 'input',
        placeholder: '请输入签约人',
        required: true,
        rules: [{ required: true, message: '请输入签约人' }]
      },
      {
        key: 'phone',
        label: '联系方式',
        type: 'input',
        placeholder: '请输入联系方式',
        required: true,
        rules: [
          { required: true, message: '请输入联系方式' },
          { len: 11, message: '联系方式长度必须为11位' }
        ]
      }
    ]
  },
  {
    title: '时间信息',
    fields: [
      {
        key: 'startDate',
        label: '签约时间',
        type: 'date',
        placeholder: '请选择签约时间',
        required: true,
        rules: [{ required: true, message: '请选择签约时间' }]
      },
      {
        key: 'endDate',
        label: '到期时间',
        type: 'date',
        placeholder: '请选择到期时间',
        required: true,
        rules: [{ required: true, message: '请选择到期时间' }]
      }
    ]
  },
  {
    title: '其他信息',
    fields: [
      {
        key: 'beizhu',
        label: '合同备注',
        type: 'textarea',
        placeholder: '请输入合同备注',
        required: false
      }
    ]
  }
]

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

const handleView = (row: HetongData): void => {
  router.push({
    name: 'hetongDetail',
    query: { id: row._id }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.hetong-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
}

h4 {
  color: #409eff;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6f7ff;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-table th) {
  background-color: #fafafa;
}
</style> 