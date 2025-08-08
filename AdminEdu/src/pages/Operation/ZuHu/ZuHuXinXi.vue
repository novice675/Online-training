<template>
  <div class="zuhu-container">
    <!-- 页面头部 -->
    <PageHeader 
      title="租户信息管理"
      :show-add="true"
      :show-batch-delete="true"
      :selected-count="selectedRows.length"
      add-text="新增"
      @add="handleAddWithData"
      @batch-delete="handleBatchDelete"
    />

    <!-- 筛选面板 -->
    <FilterPanel 
      v-model="filterForm"
      :filter-fields="filterFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <DataTable 
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义列插槽 -->
      <template #companyName="{ row }">
        <span>{{ row.company?.name || '暂无' }}</span>
      </template>

      <template #companyType="{ row }">
        <el-tag type="info" size="small">
          {{ row.company?.type || '暂无' }}
        </el-tag>
      </template>

      <template #employeeName="{ row }">
        <span v-if="row.employee">{{ row.employee.name }}</span>
        <el-tag v-else type="warning" size="small">未分配</el-tag>
      </template>

      <template #contractNumber="{ row }">
        <span v-if="row.contract">{{ row.contract.he_bian }}</span>
        <el-tag v-else type="warning" size="small">未关联</el-tag>
      </template>

      <template #building="{ row }">
        <span v-if="row.building">{{ row.building.name }}</span>
        <span v-else-if="row.company">{{ row.company.inaddress || '暂无' }}</span>
        <span v-else>暂无</span>
      </template>

      <template #room="{ row }">
        <span v-if="row.house">{{ row.house.number }}</span>
        <span v-else-if="row.company">{{ row.company.house || '暂无' }}</span>
        <span v-else>暂无</span>
      </template>

      <template #status="{ row }">
        <el-tag 
          :type="getStatusType(row.status)"
          size="small"
        >
          {{ row.status }}
        </el-tag>
      </template>

      <template #created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">详情</el-button>
        <el-button link type="success" @click="handleEditWithData(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </DataTable>

    <!-- 新增/编辑弹窗 -->
    <FormDialog 
      v-model="dialogVisible"
      :title="isEdit ? '编辑租户信息' : '新增租户信息'"
      :form-data="formData"
      :form-groups="formGroups"
      :submitting="submitLoading"
      use-layout
      width="800px"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import FormDialog from '@/components/FormDialog.vue'
import { useCrud } from '@/composables/useCrud'
import { 
  zuhuList, 
  addZuhu, 
  updateZuhu, 
  deleteZuhu, 
  batchDeleteZuhu,
  getContracts,
  getCompanies,
  getCompanyEmployees
} from '@/api/auth'

const router = useRouter()

// 类型定义 - 只包含模型中的字段和关联数据
interface ZuhuData {
  _id?: string
  companyId: string
  employeeId?: string | null
  hetongId?: string | null
  status: '正常' | '暂停' | '终止'
  created_at?: string
  updated_at?: string
  // 关联数据
  company?: {
    _id: string
    name: string
    inaddress: string
    outaddress: string
    type: string
    logo?: string
    house: string
  }
  employee?: {
    _id: string
    name: string
    sex: string
    phone: string
    email: string
    picture?: string
    role: string
    sfz?: string
    weixin?: string
  }
  contract?: {
    _id: string
    he_bian: string
    name: string
    startDate: string
    endDate: string
    louyu: string
    fangjian: string
  }
}

// 合同列表
const contracts = ref([])
// 企业列表
const companies = ref([])
// 当前企业的员工列表
const currentEmployees = ref([])

// 获取合同列表
const fetchContracts = async () => {
  try {
    const response = await getContracts()
    contracts.value = response.data.data || []
  } catch (error) {
    console.error('获取合同列表失败:', error)
  }
}

// 获取企业列表
const fetchCompanies = async () => {
  try {
    const response = await getCompanies()
    companies.value = response.data.data || []
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 获取企业员工列表
const fetchCompanyEmployees = async (companyId: any) => {
  const companyIdStr = typeof companyId === 'object' ? companyId._id || companyId.toString() : String(companyId)
  
  if (!companyIdStr || companyIdStr === 'null' || companyIdStr === 'undefined') {
    currentEmployees.value = []
    return []
  }
  
  try {
    const response = await getCompanyEmployees(companyIdStr)
    currentEmployees.value = response.data.data || []
    return response.data.data || []
  } catch (error) {
    console.error('获取企业员工信息失败:', error)
    currentEmployees.value = []
    return []
  }
}

// 处理企业选择变化
const handleCompanyChange = async (companyId: any) => {
  if (!companyId) {
    currentEmployees.value = []
    formData.value.employeeId = null
    return
  }

  // 获取该企业的员工列表
  await fetchCompanyEmployees(companyId)
  
  // 如果是新增模式且有员工，可以自动选择第一个员工
  if (!isEdit.value && currentEmployees.value.length > 0) {
    formData.value.employeeId = currentEmployees.value[0]._id
  }
}

// 使用CRUD Composable
const {
  loading,
  submitLoading,
  dialogVisible,
  isEdit,
  currentEditId,
  selectedRows,
  tableData,
  pagination,
  filterForm,
  formData,
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
} = useCrud<ZuhuData>({
  listApi: zuhuList,
  addApi: addZuhu,
  updateApi: updateZuhu,
  deleteApi: deleteZuhu,
  batchDeleteApi: batchDeleteZuhu,
  pageSize: 10,
  defaultFormData: () => ({
    companyId: '',
    employeeId: null,
    hetongId: null,
    status: '正常' as const
  })
})

// 筛选字段配置 - 使用新的搜索参数
const filterFields = [
  {
    key: 'companyName',
    label: '企业名称',
    type: 'input' as const,
    placeholder: '请输入企业名称'
  },
  {
    key: 'employeeName',
    label: '负责人姓名',
    type: 'input' as const,
    placeholder: '请输入负责人姓名'
  },
  {
    key: 'contractNumber',
    label: '合同编号',
    type: 'input' as const,
    placeholder: '请输入合同编号'
  },
  {
    key: 'industry',
    label: '企业行业',
    type: 'input' as const,
    placeholder: '请输入企业行业'
  },
  {
    key: 'building',
    label: '楼宇',
    type: 'input' as const,
    placeholder: '请输入楼宇'
  },
  {
    key: 'room',
    label: '房间',
    type: 'input' as const,
    placeholder: '请输入房间'
  },
  {
    key: 'status',
    label: '租户状态',
    type: 'select' as const,
    placeholder: '请选择',
    options: [
      { label: '正常', value: '正常' },
      { label: '暂停', value: '暂停' },
      { label: '终止', value: '终止' }
    ]
  }
]

// 表格列配置 - 使用关联表数据
const columns: any[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'companyName', label: '企业名称', minWidth: 200, slot: 'companyName', showOverflowTooltip: true },
  { prop: 'companyType', label: '企业类型', minWidth: 150, slot: 'companyType', showOverflowTooltip: true },
  { prop: 'employeeName', label: '负责人', width: 100, slot: 'employeeName' },
  { prop: 'building', label: '楼宇', width: 100, slot: 'building' },
  { prop: 'room', label: '房间', width: 80, slot: 'room' },
  { prop: 'contractNumber', label: '合同编号', width: 120, slot: 'contractNumber' },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'created_at', label: '创建时间', width: 120, slot: 'created_at' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]

// 表单组配置 - 只包含模型字段
const formGroups: any[] = [
  {
    title: '基本信息',
    fields: [
      {
        key: 'companyId',
        label: '选择企业',
        type: 'select',
        placeholder: '请选择企业',
        required: true,
        options: computed(() => companies.value.map(company => ({
          label: `${company.name} - ${company.type || '未知行业'}`,
          value: company._id
        }))),
        rules: [{ required: true, message: '请选择企业' }],
        onChange: handleCompanyChange
      },
      {
        key: 'employeeId',
        label: '选择负责人',
        type: 'select',
        placeholder: '请选择负责人（可选）',
        options: computed(() => currentEmployees.value.map(employee => ({
          label: `${employee.name} - ${employee.phone || '无手机号'}`,
          value: employee._id
        })))
      },
      {
        key: 'hetongId',
        label: '关联合同',
        type: 'select',
        placeholder: '请选择合同（可选）',
        options: computed(() => contracts.value.map(contract => ({
          label: `${contract.he_bian} - ${contract.name}`,
          value: contract._id
        })))
  },
      {
        key: 'status',
        label: '租户状态',
        type: 'select',
        placeholder: '请选择租户状态',
        required: true,
        options: [
          { label: '正常', value: '正常' },
          { label: '暂停', value: '暂停' },
          { label: '终止', value: '终止' }
        ],
        rules: [{ required: true, message: '请选择租户状态' }]
      }
    ]
  }
]

// 工具函数
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    '正常': 'success',
    '暂停': 'warning',
    '终止': 'danger'
  }
  return typeMap[status] || 'info'
}

// 查看详情 - 跳转到详情页面
const handleView = (row: ZuhuData): void => {
  const id = (row as any)._id
  if (id) {
    router.push({
      name: 'ZuHuDetail',
      params: { id }
    })
  } else {
    console.error('租户ID不存在，无法跳转到详情页面')
  }
}

// 重写handleAdd方法，确保在新增时获取必要数据
const handleAddWithData = async () => {
  await Promise.all([
    fetchCompanies(),
    fetchContracts()
  ])
  handleAdd()
}

// 重写handleEdit方法，确保在编辑时获取必要数据
const handleEditWithData = async (row: ZuhuData) => {
  await Promise.all([
    fetchCompanies(),
    fetchContracts()
  ])
  
  // 如果是编辑模式，需要获取该企业的员工信息
  if (row.companyId) {
    await fetchCompanyEmployees(row.companyId)
  }
  
  // 先调用原始的handleEdit来设置表单数据
  handleEdit(row)
}

// 监听对话框显示，获取必要数据
watch(dialogVisible, async (newVal) => {
  if (newVal) {
    await Promise.all([
      fetchCompanies(),
      fetchContracts()
    ])
  }
})

// 生命周期
onMounted(() => {
  fetchList()
  fetchCompanies()
  fetchContracts()
})
</script>

<style scoped>
.zuhu-container {
  padding: 20px;
  background: #f5f5f5;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  box-sizing: border-box;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

:deep(.el-tag) {
  font-size: 12px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
  color: #606266;
}
</style>
