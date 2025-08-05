<template>
  <div class="zuhu-container">
    <!-- 页面头部 -->
    <PageHeader 
      title="租户信息管理"
      :show-add="true"
      :show-batch-delete="true"
      :selected-count="selectedRows.length"
      add-text="新增"
      @add="handleAdd"
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
      <template #qiyeGuimo="{ row }">
        <el-tag 
          :type="getScaleType(row.qiyeGuimo)"
          size="small"
        >
          {{ row.qiyeGuimo }}
        </el-tag>
      </template>

      <template #shifoGaoxin="{ row }">
        <el-tag 
          :type="row.shifoGaoxin === '是' ? 'success' : 'info'"
          size="small"
        >
          {{ row.shifoGaoxin }}
        </el-tag>
      </template>

      <template #status="{ row }">
        <el-tag 
          :type="getStatusType(row.status)"
          size="small"
        >
          {{ row.status }}
        </el-tag>
      </template>

      <template #hetongId="{ row }">
        <span v-if="row.hetongId">{{ row.hetongId.he_bian }}</span>
        <el-tag v-else type="warning" size="small">未关联</el-tag>
      </template>

      <template #created_at="{ row }">
        {{ formatDate(row.created_at) }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">详情</el-button>
        <el-button link type="success" @click="handleEdit(row)">编辑</el-button>
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
      width="1200px"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import FormDialog from '@/components/FormDialog.vue'
// import type { TableColumn } from '@/components/DataTable.vue'
// import type { FormGroup } from '@/components/FormDialog.vue'
import { useCrud } from '@/composables/useCrud'
import { 
  zuhuList, 
  addZuhu, 
  updateZuhu, 
  deleteZuhu, 
  batchDeleteZuhu,
  getContracts
} from '@/api/auth'

const router = useRouter()

// 类型定义
interface ZuhuData {
  _id?: string
  name: string
  louyu: string
  fangjian: string
  fuzerenName: string
  lianxiFangshi: string
  suoshuHangye: string
  qiyeGuimo: '小型' | '中型' | '大型' | '特大型'
  zhucezijin?: number
  shifoGaoxin?: '是' | '否'
  shifouShangshi?: '是' | '否'
  qiyeGuzhi?: number
  fuzeren: {
    name: string
    xingbie: '男' | '女'
    lianxiFangshi: string
  }
  hetongId?: string
  status: '正常' | '暂停' | '终止'
  created_at?: string
  updated_at?: string
  hetongDetail?: any
}

// 合同列表
const contracts = ref([])

// 获取合同列表
const fetchContracts = async () => {
  try {
    const response = await getContracts()
    contracts.value = response.data.data || []
  } catch (error) {
    console.error('获取合同列表失败:', error)
  }
}

// 使用CRUD Composable
const {
  loading,
  submitLoading,
  dialogVisible,
  isEdit,
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
    name: '',
    louyu: '',
    fangjian: '',
    fuzerenName: '',
    lianxiFangshi: '',
    suoshuHangye: '',
    qiyeGuimo: '中型' as const,
    zhucezijin: undefined,
    shifoGaoxin: '否' as const,
    shifouShangshi: '否' as const,
    qiyeGuzhi: undefined,
    fuzeren: {
      name: '',
      xingbie: '男' as const,
      lianxiFangshi: ''
    },
    hetongId: '',
    status: '正常' as const
  })
})

// 筛选字段配置
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
    type: 'select' as const,
    placeholder: '请选择',
    options: [
      { label: 'A1楼', value: 'A1楼' },
      { label: 'A2楼', value: 'A2楼' },
      { label: 'B1楼', value: 'B1楼' },
      { label: 'B2楼', value: 'B2楼' },
      { label: 'C1楼', value: 'C1楼' },
      { label: 'C2楼', value: 'C2楼' },
      { label: 'D1楼', value: 'D1楼' },
      { label: 'D2楼', value: 'D2楼' }
    ]
  },
  {
    key: 'fangjian',
    label: '房间名称',
    type: 'input' as const,
    placeholder: '请输入房间名称'
  },
  {
    key: 'fuzerenName',
    label: '负责人姓名',
    type: 'input' as const,
    placeholder: '请输入负责人姓名'
  },
  {
    key: 'lianxiFangshi',
    label: '联系方式',
    type: 'input' as const,
    placeholder: '请输入联系方式'
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

// 表格列配置
const columns: any[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '租户名称', minWidth: 180, showOverflowTooltip: true },
  { prop: 'louyu', label: '所属楼宇', width: 100 },
  { prop: 'fangjian', label: '房间名称', width: 100 },
  { prop: 'hetongId', label: '合同编号', width: 120, slot: 'hetongId' },
  { prop: 'fuzerenName', label: '负责人姓名', width: 120 },
  { prop: 'lianxiFangshi', label: '联系方式', width: 130 },
  { prop: 'suoshuHangye', label: '所属行业', width: 120 },
  { prop: 'qiyeGuimo', label: '企业规模', width: 100, slot: 'qiyeGuimo' },
  { prop: 'shifoGaoxin', label: '高新企业', width: 100, slot: 'shifoGaoxin' },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'created_at', label: '注册时间', width: 120, slot: 'created_at' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]

// 表单组配置
const formGroups: any[] = [
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
        type: 'select',
        placeholder: '请选择所属楼宇',
        required: true,
        options: [
          { label: 'A1楼', value: 'A1楼' },
          { label: 'A2楼', value: 'A2楼' },
          { label: 'B1楼', value: 'B1楼' },
          { label: 'B2楼', value: 'B2楼' },
          { label: 'C1楼', value: 'C1楼' },
          { label: 'C2楼', value: 'C2楼' },
          { label: 'D1楼', value: 'D1楼' },
          { label: 'D2楼', value: 'D2楼' }
        ],
        rules: [{ required: true, message: '请选择所属楼宇' }]
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
        key: 'fuzerenName',
        label: '负责人姓名',
        type: 'input',
        placeholder: '请输入负责人姓名',
        required: true,
        rules: [{ required: true, message: '请输入负责人姓名' }]
      },
      {
        key: 'lianxiFangshi',
        label: '联系方式',
        type: 'input',
        placeholder: '请输入联系方式',
        required: true,
        rules: [
          { required: true, message: '请输入联系方式' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
        ]
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
  },
  {
    title: '企业信息',
    fields: [
      {
        key: 'suoshuHangye',
        label: '所属行业',
        type: 'input',
        placeholder: '请输入所属行业',
        required: true,
        rules: [{ required: true, message: '请输入所属行业' }]
      },
      {
        key: 'qiyeGuimo',
        label: '企业规模',
        type: 'select',
        placeholder: '请选择企业规模',
        required: true,
        options: [
          { label: '小型', value: '小型' },
          { label: '中型', value: '中型' },
          { label: '大型', value: '大型' },
          { label: '特大型', value: '特大型' }
        ],
        rules: [{ required: true, message: '请选择企业规模' }]
      },
      {
        key: 'zhucezijin',
        label: '注册资金',
        type: 'number',
        placeholder: '请输入注册资金(万元)',
        min: 0
      },
      {
        key: 'shifoGaoxin',
        label: '是否高新',
        type: 'select',
        placeholder: '请选择',
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' }
        ]
      },
      {
        key: 'shifouShangshi',
        label: '是否上市',
        type: 'select',
        placeholder: '请选择',
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' }
        ]
      },
      {
        key: 'qiyeGuzhi',
        label: '企业估值',
        type: 'number',
        placeholder: '请输入企业估值(万元)',
        min: 0
      }
    ]
  },
  {
    title: '负责人信息',
    fields: [
      {
        key: 'fuzeren.name',
        label: '负责人姓名',
        type: 'input',
        placeholder: '请输入负责人姓名',
        required: true,
        rules: [{ required: true, message: '请输入负责人姓名' }]
      },
      {
        key: 'fuzeren.xingbie',
        label: '性别',
        type: 'select',
        placeholder: '请选择性别',
        required: true,
        options: [
          { label: '男', value: '男' },
          { label: '女', value: '女' }
        ],
        rules: [{ required: true, message: '请选择性别' }]
      },
      {
        key: 'fuzeren.lianxiFangshi',
        label: '联系方式',
        type: 'input',
        placeholder: '请输入联系方式',
        required: true,
        rules: [
          { required: true, message: '请输入联系方式' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
        ]
      }
    ]
  },
  {
    title: '合同信息',
    fields: [
      {
        key: 'hetongId',
        label: '合同编号',
        type: 'select',
        placeholder: '请选择合同编号',
        options: computed(() => contracts.value.map(contract => ({
          label: `${contract.he_bian} - ${contract.name}`,
          value: contract._id
        })))
      }
    ]
  }
]

// 工具函数
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getScaleType = (scale: string): string => {
  const typeMap: Record<string, string> = {
    '小型': 'info',
    '中型': 'warning',
    '大型': 'success',
    '特大型': 'danger'
  }
  return typeMap[scale] || 'info'
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    '正常': 'success',
    '暂停': 'warning',
    '终止': 'danger'
  }
  return typeMap[status] || 'info'
}

// 查看详情
const handleView = (row: ZuhuData): void => {
  handleEdit(row) // 复用编辑功能显示详情
}

// 监听对话框显示，获取合同列表
const handleDialogOpen = () => {
  if (dialogVisible.value) {
    fetchContracts()
  }
}

// 生命周期
onMounted(() => {
  fetchList()
  fetchContracts()
})

// 监听对话框状态变化
import { watch } from 'vue'
watch(dialogVisible, (newVal) => {
  if (newVal) {
    fetchContracts()
  }
})
</script>

<style scoped>
.zuhu-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 40px);
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
</style>
