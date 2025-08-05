<template>
  <div class="article-management">
    <PageHeader 
      title="文章发布管理"
      :show-add="false"
      :show-batch-delete="true"
      :selected-count="selectedRows.length"
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
      <template #title="{ row }">
        <span class="article-title" @click="handleView(row)">
          {{ row.title }}
        </span>
      </template>

      <template #channel="{ row }">
        <span>{{ row.channel || '-' }}</span>
          </template>

      <template #type="{ row }">
        <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        
      <template #keywords="{ row }">
            <span class="keywords">{{ row.keywords || '-' }}</span>
          </template>
        
      <template #publisher>
            <span>管理员</span>
          </template>
        
      <template #publishTime="{ row }">
            <span>{{ formatDate(row.published_at || row.created_at) }}</span>
          </template>

      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">详细</el-button>
        <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </DataTable>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import type { Column } from '@/components/DataTable.vue'
import { useCrud } from '@/composables/useCrud'

import { wenList, deleteWen, batchDeleteWen } from '@/api/auth'

const router = useRouter()

interface ArticleData {
  _id?: string
  title: string
  channel: string
  type: string
  keywords: string
  content: string
  published_at?: string
  created_at?: string
  updated_at?: string
}



const {
  tableData,
  loading,
  selectedRows,
  pagination,
  filterForm,
  fetchList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleDelete,
  handleBatchDelete
} = useCrud<ArticleData>({
  listApi: wenList,
  deleteApi: deleteWen,
  batchDeleteApi: batchDeleteWen,
  pageSize: 10
})

const filterFields = [
  {
    key: 'title',
    label: '文章标题',
    type: 'input' as const,
    placeholder: '请输入文章标题'
  },
  {
    key: 'type',
    label: '文章类型',
    type: 'select' as const,
    placeholder: '请选择文章类型',
    options: [
      { label: '图文', value: '图文' },
      { label: '视频', value: '视频' },
      { label: '音频', value: '音频' }
    ]
  }
]

const columns: Column[] = [
  { type: 'selection', width: 55 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'title', label: '文章标题', minWidth: 200, slot: 'title' },
  { prop: 'channel', label: '发布渠道', width: 120 },
  { prop: 'channel', label: '发布频道', width: 120, slot: 'channel' },
  { prop: 'type', label: '文章类型', width: 100, slot: 'type' },
  { prop: 'keywords', label: '关键词', width: 150, slot: 'keywords' },
  { prop: 'publisher', label: '发布人', width: 100, slot: 'publisher' },
  { prop: 'published_at', label: '发布时间', width: 120, slot: 'publishTime' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]



const handleView = (row: ArticleData) => {
  // 跳转到文章详情页面
  router.push({
    name: 'xiang',
    params: { id: row._id }
  })
}


const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getTypeTagType = (type: string): string => {
  switch (type) {
    case '图文':
      return 'primary'
    case '视频':
      return 'success'
    case '音频':
      return 'warning'
    default:
      return 'info'
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.article-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.article-title {
  color: #409eff;
  cursor: pointer;
}

.article-title:hover {
  text-decoration: underline;
}

.keywords {
  color: #666;
  font-size: 12px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #666;
}

:deep(.el-pagination) {
  justify-content: center;
}
</style>