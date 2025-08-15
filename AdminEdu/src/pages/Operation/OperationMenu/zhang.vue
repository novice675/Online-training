<template>
  <div class="article-management">
    <PageHeader 
      title="文章发布管理"
      :show-add="false"
      :show-batch-delete="false"
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
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <template #title="{ row }">
        <span class="article-title" @click="handleView(row)">
          {{ row.title }}
        </span>
      </template>

      <template #channel="{ row }">
        <el-tag :type="getChannelTagType(row.channel)">{{ row.channel || '-' }}</el-tag>
          </template>


        
      <template #status="{ row }">
        <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        
      <template #author="{ row }">
        <span>{{ row.authorId?.username || row.author || '未知用户' }}</span>
          </template>
        
      <template #publishTime="{ row }">
        <span>{{ formatDate(row.publishTime || row.createdAt) }}</span>
          </template>

      <template #actions="{ row }">
        <el-button link type="primary" @click="handleView(row)">详细</el-button>
        <el-button link type="success" @click="handleViewComments(row)">查看评论</el-button>
      </template>
    </DataTable>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import type { Column } from '@/components/DataTable.vue'
import { useCrud } from '@/composables/useCrud'

import { wenList } from '@/api/auth'

const router = useRouter()

interface ArticleData {
  _id?: string
  title: string
  articleType: string
  channel: string
  status: string
  renderType: string
  tags: string[]
  keywords: string[]
  author?: string
  publishTime?: string
  likeCount?: number
  coverImage?: string
  rightImage?: string
  detailContent: string
  detailImages?: string[]
  createdAt?: string
  updatedAt?: string
}



const {
  tableData,
  loading,
  pagination,
  filterForm,
  fetchList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange
} = useCrud<ArticleData>({
  listApi: wenList,
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
    key: 'channel',
    label: '发布频道',
    type: 'select' as const,
    placeholder: '请选择发布频道',
    options: [
      { label: '推荐', value: '推荐' },
      { label: '政策', value: '政策' }
    ]
  },
  {
    key: 'status',
    label: '审核状态',
    type: 'select' as const,
    placeholder: '请选择审核状态',
    options: [
      { label: '未审核', value: '未审核' },
      { label: '审核成功', value: '审核成功' },
      { label: '审核失败', value: '审核失败' }
    ]
  },
  {
    key: 'renderType',
    label: '渲染类型',
    type: 'select' as const,
    placeholder: '请选择渲染类型',
    options: [
      { label: '纯文字', value: 'TEXT_ONLY' },
      { label: '大图图文', value: 'IMAGE_FULL' },
      { label: '右侧小图', value: 'IMAGE_RIGHT' }
    ]
  }
]

const columns: Column[] = [
  { type: 'index', label: '序号', width: 60 },
  { prop: 'title', label: '文章标题', minWidth: 200, slot: 'title' },
  { prop: 'channel', label: '发布频道', width: 120, slot: 'channel' },
  { prop: 'status', label: '审核状态', width: 100, slot: 'status' },
  { prop: 'author', label: '作者', width: 100, slot: 'author' },
  { prop: 'publishTime', label: '发布时间', width: 120, slot: 'publishTime' },
  { type: 'actions', label: '操作', width: 180, fixed: 'right' }
]



const handleView = (row: ArticleData) => {
  // 跳转到文章详情页面
  if (!row._id) {
    ElMessage.error('文章ID不存在，无法查看详情')
    return
  }
  
  console.log('跳转到文章详情页面:', {
    articleId: row._id,
    articleTitle: row.title,
    routeName: 'xiang'
  })
  
  router.push({
    name: 'xiang',
    params: { id: row._id }
  }).catch((error) => {
    console.error('路由跳转失败:', error)
    ElMessage.error('页面跳转失败，请稍后重试')
  })
}

const handleViewComments = (row: ArticleData) => {
  console.log('查看评论 - 文章数据:', row)
  console.log('文章ID:', row._id)
  console.log('文章标题:', row.title)
  
  if (!row._id) {
    ElMessage.error('文章ID不存在，无法查看评论')
    return
  }
  
  // 跳转到评论管理页面
  router.push({
    name: 'ping',
    query: { 
      articleId: row._id,
      articleTitle: row.title 
    }
  }).catch((error) => {
    console.error('路由跳转失败:', error)
    ElMessage.error('页面跳转失败，请稍后重试')
  })
}


const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getChannelTagType = (channel: string): string => {
  switch (channel) {
    case '推荐':
      return 'primary'
    case '政策':
      return 'success'
    default:
      return 'info'
  }
}



const getStatusTagType = (status: string): string => {
  switch (status) {
    case '审核成功':
      return 'success'
    case '未审核':
      return 'warning'
    case '审核失败':
      return 'danger'
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
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
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