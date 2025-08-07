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
        <el-tag>{{ row.shuxing }}</el-tag>
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
  batchDeleteHetong 
} from '@/api/auth'

const router = useRouter()

interface HetongData {
  _id: string
  name: string
  louyu: string
  fangjian: string
  shuxing: string
  qianPeople: string
  startDate: string | Date
  endDate: string | Date
  zujin: number
  wuye: number
  yajin: number
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
  handleAdd,
  handleEdit,
  handleDelete,
  handleBatchDelete,
  handleSubmit,
  handleCancel
} = useCrud<HetongData>({
  listApi: hetongList,
  addApi: addHetong,
  updateApi: updateHetong,
  deleteApi: deleteHetong,
  batchDeleteApi: batchDeleteHetong,
  pageSize: 10,
  defaultFormData: () => ({
    name: '',
    louyu: '',
    fangjian: '',
    shuxing: '租赁',
    qianPeople: '',
    startDate: '',
    endDate: '',
    zujin: 0,
    wuye: 0,
    yajin: 0
  })
})

const filterFields = [
  {
    key: 'name',
    label: '租户名称',
    type: 'input' as const,
    placeholder: '请输入租户名称'
  },
  {
    key: 'louyu',
    label: '所属楼宇',
    type: 'input' as const,
    placeholder: '请输入楼宇名称'
  },
  {
    key: 'shuxing',
    label: '合同类型',
    type: 'select' as const,
    placeholder: '请选择合同类型',
    options: [
      { label: '租赁', value: '租赁' },
      { label: '销售', value: '销售' }
    ]
  }
]

const columns: Column[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '租户名称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'louyu', label: '所属楼宇', width: 100 },
  { prop: 'fangjian', label: '房间名称', width: 100 },
  { prop: 'shuxing', label: '合同类型', width: 100, slot: 'shuxing' },
  { prop: 'status', label: '合同状态', width: 100, slot: 'status' },
  { prop: 'qianPeople', label: '签约人', width: 120 },
  { prop: 'startDate', label: '签约时间', width: 120, slot: 'startDate' },
  { prop: 'endDate', label: '到期时间', width: 120, slot: 'endDate' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]

const formGroups: FormGroup[] = [
  {
    title: '基本信息',
    fields: [
      {
        key: 'name',
        label: '租户名称',
        type: 'input',
        placeholder: '请输入租户名称',
        required: true,
        rules: [{ required: true, message: '请输入租户名称' }]
      },
      {
        key: 'louyu',
        label: '所属楼宇',
        type: 'input',
        placeholder: '请输入楼宇名称',
        required: true,
        rules: [{ required: true, message: '请输入楼宇名称' }]
      },
      {
        key: 'fangjian',
        label: '房间名称',
        type: 'input',
        placeholder: '请输入房间名称',
        required: true,
        rules: [{ required: true, message: '请输入房间名称' }]
      },
      {
        key: 'shuxing',
        label: '合同类型',
        type: 'select',
        placeholder: '请选择合同类型',
        required: true,
        options: [
          { label: '租赁', value: '租赁' },
          { label: '销售', value: '销售' }
        ],
        rules: [{ required: true, message: '请选择合同类型' }]
      },
      {
        key: 'qianPeople',
        label: '签约人',
        type: 'input',
        placeholder: '请输入签约人',
        required: true,
        rules: [{ required: true, message: '请输入签约人' }]
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
    title: '费用信息',
    fields: [
      {
        key: 'zujin',
        label: '租金',
        type: 'number',
        placeholder: '请输入租金',
        required: true,
        rules: [{ required: true, message: '请输入租金' }]
      },
      {
        key: 'wuye',
        label: '物业费',
        type: 'number',
        placeholder: '请输入物业费',
        required: true,
        rules: [{ required: true, message: '请输入物业费' }]
      },
      {
        key: 'yajin',
        label: '押金',
        type: 'number',
        placeholder: '请输入押金',
        required: true,
        rules: [{ required: true, message: '请输入押金' }]
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
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
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