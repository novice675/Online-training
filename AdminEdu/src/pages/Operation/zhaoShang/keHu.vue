<template>
  <div class="kehu-container">
    <!-- 页面头部 -->
    <PageHeader 
      title="客户信息管理"
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
      <template #intentLevel="{ row }">
        <el-tag :type="getIntentLevelType(row.intentLevel || '中')">
          {{ row.intentLevel || '中' }}
        </el-tag>
      </template>

      <template #level="{ row }">
        <el-tag :type="row.level === '一级' ? 'danger' : 'warning'">
          {{ row.level }}
        </el-tag>
      </template>



      <template #createTime="{ row }">
        {{ formatDate(row.createTime) }}
      </template>

      <template #updateTime="{ row }">
        {{ formatDate(row.updateTime) }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">编辑</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </DataTable>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="800px"
      @close="handleDialogClose"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>客户基本信息：</h4>
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入客户名称" />
            </el-form-item>
            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入联系方式" />
            </el-form-item>
            <el-form-item label="客户等级" prop="level">
              <el-select v-model="formData.level" placeholder="请选择客户等级" style="width: 100%">
                <el-option label="一级" value="一级" />
                <el-option label="二级" value="二级" />
              </el-select>
            </el-form-item>
            <el-form-item label="所属行业" prop="industry">
              <el-input v-model="formData.industry" placeholder="请输入所属行业" />
            </el-form-item>

            <el-form-item label="意向等级" prop="intentLevel">
              <el-select v-model="formData.intentLevel" placeholder="请选择意向等级" style="width: 100%">
                <el-option label="高" value="高" />
                <el-option label="中" value="中" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
            <el-form-item label="跟进人" prop="followPerson">
              <el-input v-model="formData.followPerson" placeholder="请输入跟进人姓名" />
            </el-form-item>
            <el-form-item label="跟进人联系方式" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入跟进人联系方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <h4>客户需求信息：</h4>
            <el-form-item label="需求面积">
              <el-row :gutter="10">
                <el-col :span="11">
                  <el-input-number 
                    v-model="formData.requiredAreaMin" 
                    :min="0" 
                    :precision="0"
                    placeholder="最小面积"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="2" style="text-align: center">~</el-col>
                <el-col :span="11">
                  <el-input-number 
                    v-model="formData.requiredAreaMax" 
                    :min="0" 
                    :precision="0"
                    placeholder="最大面积"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
              <div style="text-align: right; margin-top: 5px; font-size: 12px; color: #999">m²</div>
            </el-form-item>
            <el-form-item label="预算价格">
              <el-row :gutter="10">
                <el-col :span="11">
                  <el-input-number 
                    v-model="formData.budgetMin" 
                    :min="0" 
                    :precision="0"
                    placeholder="最小价格"
                    style="width: 100%"
                  />
                </el-col>
                <el-col :span="2" style="text-align: center">~</el-col>
                <el-col :span="11">
                  <el-input-number 
                    v-model="formData.budgetMax" 
                    :min="0" 
                    :precision="0"
                    placeholder="最大价格"
                    style="width: 100%"
                  />
                </el-col>
              </el-row>
              <div style="text-align: right; margin-top: 5px; font-size: 12px; color: #999">元/月</div>
            </el-form-item>
            <el-form-item label="租户用途" prop="purpose">
              <el-input v-model="formData.purpose" placeholder="请输入租户用途" />
            </el-form-item>
            <el-form-item label="意向房源" prop="interestedProperty">
              <el-input v-model="formData.interestedProperty" placeholder="请输入意向房源名称" />
            </el-form-item>
            <el-form-item label="备注信息" prop="remarks">
              <el-input 
                v-model="formData.remarks" 
                type="textarea" 
                :rows="3"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  </template>
  
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { useCrud } from '@/composables/useCrud'
import { 
  kehuList, 
  addKehu, 
  updateKehu, 
  deleteKehu, 
  batchDeleteKehu,
  kehuDetail
} from '@/api/auth'

// 类型定义
interface CustomerData {
  _id?: string
  name: string
  phone: string
  level: '一级' | '二级'
  industry: string
  followPerson: string
  contactPhone: string
  requiredAreaMin?: number | null
  requiredAreaMax?: number | null
  budgetMin?: number | null
  budgetMax?: number | null
  purpose?: string
  interestedProperty?: string
  remarks?: string
  createTime?: string
  updateTime?: string
  intentLevel?: '高' | '中' | '低'
}


const router = useRouter()

// 表单引用和验证规则  
const formRef = ref()
const formRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  level: [{ required: true, message: '请选择客户等级', trigger: 'change' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }],
  followPerson: [{ required: true, message: '请输入跟进人姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入跟进人联系方式', trigger: 'blur' }]
}

// 对话框标题
const dialogTitle = computed(() => isEdit.value ? '编辑客户信息' : '新增客户信息')

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
} = useCrud<CustomerData>({
  listApi: kehuList,
  addApi: addKehu,
  updateApi: updateKehu,
  deleteApi: deleteKehu,
  batchDeleteApi: batchDeleteKehu,
  pageSize: 10,
  defaultFormData: () => ({
    name: '',
    phone: '',
    level: '一级' as const,
    industry: '',
    intentLevel: '中' as const,
    followPerson: '',
    contactPhone: '',
    requiredAreaMin: null,
    requiredAreaMax: null,
    budgetMin: null,
    budgetMax: null,
    purpose: '',
    interestedProperty: '',
    remarks: ''
  })
})

// 筛选字段配置
const filterFields = [
  {
    key: 'name',
    label: '客户名称',
    type: 'input' as const,
    placeholder: '请输入客户名称'
  },
  {
    key: 'intentLevel',
    label: '意向等级',
    type: 'select' as const,
    placeholder: '请选择',
    options: [
      { label: '高', value: '高' },
      { label: '中', value: '中' },
      { label: '低', value: '低' }
    ]
  },
  {
    key: 'level',
    label: '客户等级',
    type: 'select' as const,
    placeholder: '请选择',
    options: [
      { label: '一级', value: '一级' },
      { label: '二级', value: '二级' }
    ]
  },

]

// 表格列配置
const columns: TableColumn[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'name', label: '客户名称', minWidth: 150, showOverflowTooltip: true },
  { prop: 'intentLevel', label: '意向等级', width: 100, slot: 'intentLevel' },
  { prop: 'level', label: '客户等级', width: 100, slot: 'level' },
  { prop: 'followPerson', label: '跟进人', width: 120 },
  { prop: 'createTime', label: '新增时间', width: 120, slot: 'createTime' },
  { prop: 'updateTime', label: '最近跟进时间', width: 140, slot: 'updateTime' },
  { type: 'actions', label: '操作', width: 150, fixed: 'right' }
]

// 工具函数
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getIntentLevelType = (level: string): string => {
  const typeMap: Record<string, string> = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[level] || 'info'
}

// 自定义查看方法（详情页面跳转）
const handleView = (row: CustomerData): void => {
  handleEdit(row) // 复用编辑方法
}

// 对话框关闭处理
const handleDialogClose = (): void => {
  formRef.value?.clearValidate()
}

// 生命周期
onMounted(() => {
  fetchList()
})
  </script>
  
<style scoped>
.kehu-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 40px);
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.filter-item label {
  min-width: 80px;
  margin-right: 10px;
  color: #666;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.table-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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