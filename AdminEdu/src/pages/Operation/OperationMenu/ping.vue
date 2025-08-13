<template>
  <div class="comment-management">
    <!-- 页面头部 -->
    <PageHeader 
      :title="`文章评论管理 - ${articleTitle || '未知文章'}`"
      :show-add="false"
      :show-batch-delete="true"
      :selected-count="selectedComments.length"
      @batch-delete="handleBatchDelete"
    />

    <!-- 文章信息卡片 -->
    <el-card class="article-info-card" v-if="articleTitle">
      <div class="article-info">
        <div class="info-item">
          <span class="label">文章标题：</span>
          <span class="value">{{ articleTitle }}</span>
        </div>
        <div class="info-item">
          <span class="label">评论总数：</span>
          <span class="value">{{ pagination.total }} 条</span>
        </div>
        <div class="info-item">
          <span class="label">管理操作：</span>
          <el-button size="small" @click="refreshList">刷新列表</el-button>
          <el-button size="small" @click="goBack">返回文章列表</el-button>
        </div>
      </div>
    </el-card>

    <!-- 搜索过滤面板 -->
    <FilterPanel 
      v-model="filterForm"
      :filter-fields="filterFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 评论数据表格 -->
    <DataTable 
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :selection="true"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 评论内容插槽 -->
      <template #content="{ row }">
        <div class="comment-content">
          <div class="content-text" :class="{ 'is-reply': row.parentId }">
            <span v-if="row.parentId" class="reply-indicator">回复：</span>
            {{ row.content }}
          </div>
          <div class="content-meta">
            <span v-if="row.replyToAuthor" class="reply-to">@{{ row.replyToAuthor }}</span>
          </div>
        </div>
      </template>

      <!-- 用户信息插槽 -->
      <template #user="{ row }">
        <span class="user-name">{{ row.userId?.username || '未知用户' }}</span>
      </template>

      <!-- 层级结构插槽 -->
      <template #level="{ row }">
        <div class="comment-level">
          <el-tag v-if="!row.parentId" type="primary" size="small">主评论</el-tag>
          <el-tag v-else type="info" size="small">{{ `${row.floor}楼` }}</el-tag>
          <div class="level-info">
            <span v-if="row.replyCount > 0" class="reply-count">{{ row.replyCount }}条回复</span>
          </div>
        </div>
      </template>

      <!-- 点赞数插槽 -->
      <template #likes="{ row }">
        <div class="like-info">
          <el-icon><StarFilled /></el-icon>
          <span>{{ row.likeCount || 0 }}</span>
        </div>
      </template>

      <!-- 时间插槽 -->
      <template #time="{ row }">
        <div class="time-info">
          <div class="created-time">{{ formatDate(row.createdAt) }}</div>
          <div class="updated-time" v-if="row.updatedAt && row.updatedAt !== row.createdAt">
            更新：{{ formatDate(row.updatedAt) }}
          </div>
        </div>
      </template>

      <!-- 操作插槽 -->
      <template #actions="{ row }">
        <el-button link type="primary" @click="handleViewReplies(row)" v-if="row.replyCount > 0">
          查看回复({{ row.replyCount }})
        </el-button>
        <el-button link type="warning" @click="handleViewDetail(row)">
          详情
        </el-button>
        <el-popconfirm 
          title="确定要删除这条评论吗？删除后无法恢复！"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button link type="danger">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </DataTable>

    <!-- 评论详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="评论详情" 
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedComment" class="comment-detail">
        <div class="detail-row">
          <span class="detail-label">评论ID：</span>
          <span class="detail-value">{{ selectedComment._id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">用户信息：</span>
          <span class="detail-value">{{ selectedComment.userId?.username || '未知用户' }} ({{ selectedComment.userId?._id || 'N/A' }})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">评论内容：</span>
          <div class="detail-content">{{ selectedComment.content }}</div>
        </div>
        <div class="detail-row" v-if="selectedComment.replyToAuthor">
          <span class="detail-label">回复对象：</span>
          <span class="detail-value">@{{ selectedComment.replyToAuthor }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">楼层/类型：</span>
          <span class="detail-value">
            {{ selectedComment.parentId ? `${selectedComment.floor}楼回复` : '主评论' }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">点赞数：</span>
          <span class="detail-value">{{ selectedComment.likeCount || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">回复数：</span>
          <span class="detail-value">{{ selectedComment.replyCount || 0 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">发表时间：</span>
          <span class="detail-value">{{ formatDate(selectedComment.createdAt) }}</span>
        </div>
        <div class="detail-row" v-if="selectedComment.updatedAt && selectedComment.updatedAt !== selectedComment.createdAt">
          <span class="detail-label">更新时间：</span>
          <span class="detail-value">{{ formatDate(selectedComment.updatedAt) }}</span>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleDeleteFromDetail" v-if="selectedComment">
          删除此评论
        </el-button>
      </template>
    </el-dialog>

    <!-- 回复列表对话框 -->
    <el-dialog 
      v-model="repliesDialogVisible" 
      title="评论回复列表" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedComment" class="replies-container">
        <!-- 原评论 -->
        <div class="original-comment">
          <h4>原评论</h4>
          <div class="comment-card">
            <div class="comment-user">{{ selectedComment.userId?.username || '未知用户' }}</div>
            <div class="comment-content">{{ selectedComment.content }}</div>
            <div class="comment-meta">
              <span>{{ formatDate(selectedComment.createdAt) }}</span>
              <span>{{ selectedComment.likeCount || 0 }}个赞</span>
            </div>
          </div>
        </div>

        <!-- 回复列表 -->
        <div class="replies-list">
          <h4>回复列表 (共{{ repliesPagination.total }}条，当前显示{{ repliesData.length }}条)</h4>
          <div v-if="repliesData.length === 0" class="no-replies">
            <el-empty description="暂无回复" />
          </div>
          <div v-else v-loading="repliesLoading">
            <div 
              v-for="reply in repliesData" 
              :key="reply._id" 
              class="reply-item"
            >
              <div class="reply-user">{{ reply.userId?.username || '未知用户' }}</div>
              <div class="reply-content">
                <span v-if="reply.replyToAuthor" class="reply-to">@{{ reply.replyToAuthor }} </span>
                {{ reply.content }}
              </div>
              <div class="reply-meta">
                <span>{{ formatDate(reply.createdAt) }}</span>
                <span>{{ reply.likeCount || 0 }}个赞</span>
                <el-button link type="danger" size="small" @click="handleDeleteReply(reply)">删除</el-button>
              </div>
            </div>
            
            <!-- 回复分页 -->
            <div v-if="repliesPagination.total > repliesPagination.pageSize" class="replies-pagination">
              <el-pagination
                :current-page="repliesPagination.page"
                :page-size="repliesPagination.pageSize"
                :total="repliesPagination.total"
                :page-sizes="[20, 50, 100]"
                layout="total, sizes, prev, pager, next"
                @size-change="handleRepliesPageSizeChange"
                @current-change="handleRepliesPageChange"
              />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="repliesDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import DataTable from '@/components/DataTable.vue'
import type { Column } from '@/components/DataTable.vue'
import { 
  getCommentsByNews, 
  getCommentReplies, 
  deleteComment, 
  batchDeleteComments 
} from '../../../api/auth.js'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedComments = ref([])
const articleTitle = ref('')
const articleId = ref('')
const detailDialogVisible = ref(false)
const repliesDialogVisible = ref(false)
const selectedComment = ref(null)
const repliesData = ref([])

// 回复分页数据
const repliesPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})
const repliesLoading = ref(false)

// 分页信息
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 过滤表单（简化为只有用户名和评论内容）
const filterForm = ref({
  content: '',
  username: ''
})

// 过滤字段配置（简化搜索）
const filterFields = [
  {
    key: 'content',
    label: '评论内容',
    type: 'input' as const,
    placeholder: '请输入评论内容关键词'
  },
  {
    key: 'username',
    label: '用户名',
    type: 'input' as const,
    placeholder: '请输入用户名'
  }
]

// 表格列配置
const columns: Column[] = [
  { type: 'selection', width: 50 },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'content', label: '评论内容', minWidth: 300, slot: 'content' },
  { prop: 'userId', label: '用户信息', width: 150, slot: 'user' },
  { prop: 'level', label: '层级/楼层', width: 120, slot: 'level' },
  { prop: 'likeCount', label: '点赞数', width: 100, slot: 'likes' },
  { prop: 'createdAt', label: '发表时间', width: 150, slot: 'time' },
  { type: 'actions', label: '操作', width: 200, fixed: 'right' }
]

// 初始化
onMounted(() => {
  // 从路由参数获取文章信息
  articleId.value = route.query.articleId as string
  articleTitle.value = route.query.articleTitle as string

  console.log('路由参数:', route.query)
  console.log('文章ID:', articleId.value)
  console.log('文章标题:', articleTitle.value)

  if (!articleId.value) {
    ElMessage.error('缺少文章ID参数，请从文章列表页面进入')
    // 延迟返回，给用户看到错误信息的时间
    setTimeout(() => {
      goBack()
    }, 2000)
    return
  }

  fetchCommentsList()
})

// 获取评论列表
const fetchCommentsList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.value.page,
      limit: pagination.value.pageSize,
      ...filterForm.value
    }

    const response = await getCommentsByNews(articleId.value, params)
    
    console.log('📋 [前端] 评论列表响应数据:', response.data)
    
    if (response.data.success) {
      tableData.value = response.data.data.list || []
      pagination.value.total = response.data.data.pagination?.total || 0
      
      // 调试用户信息显示
      if (tableData.value.length > 0) {
        console.log('📋 [前端] 第一条评论的用户信息:', {
          userId: tableData.value[0].userId,
          replyCount: tableData.value[0].replyCount,
          repliesLength: tableData.value[0].replies?.length
        })
      }
    } else {
      ElMessage.error('获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.page = 1
  fetchCommentsList()
}

// 重置处理
const handleReset = () => {
  filterForm.value = {
    content: '',
    username: ''
  }
  pagination.value.page = 1
  fetchCommentsList()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  pagination.value.pageSize = newSize
  pagination.value.page = 1
  fetchCommentsList()
}

const handleCurrentChange = (newPage: number) => {
  pagination.value.page = newPage
  fetchCommentsList()
}

// 选择处理
const handleSelectionChange = (selection: any[]) => {
  selectedComments.value = selection
}

// 查看评论详情
const handleViewDetail = (row: any) => {
  selectedComment.value = row
  detailDialogVisible.value = true
}

// 查看回复列表
const handleViewReplies = async (row: any) => {
  selectedComment.value = row
  // 重置分页到第一页
  repliesPagination.value.page = 1
  await fetchRepliesList()
  repliesDialogVisible.value = true
}

// 获取回复列表（支持分页）
const fetchRepliesList = async () => {
  if (!selectedComment.value) return
  
  try {
    repliesLoading.value = true
    const params = {
      page: repliesPagination.value.page,
      limit: repliesPagination.value.pageSize
    }
    
    const response = await getCommentReplies(selectedComment.value._id, params)
    
    if (response.data.success) {
      repliesData.value = response.data.data.list || []
      repliesPagination.value.total = response.data.data.pagination?.total || 0
      
      console.log('📄 [前端] 回复列表分页信息:', {
        currentPage: repliesPagination.value.page,
        pageSize: repliesPagination.value.pageSize,
        total: repliesPagination.value.total,
        loaded: repliesData.value.length
      })
    } else {
      ElMessage.error('获取回复列表失败')
    }
  } catch (error) {
    console.error('获取回复列表失败:', error)
    ElMessage.error('获取回复列表失败')
  } finally {
    repliesLoading.value = false
  }
}

// 回复分页处理
const handleRepliesPageSizeChange = (newSize: number) => {
  repliesPagination.value.pageSize = newSize
  repliesPagination.value.page = 1
  fetchRepliesList()
}

const handleRepliesPageChange = (newPage: number) => {
  repliesPagination.value.page = newPage
  fetchRepliesList()
}

// 删除单个评论
const handleDelete = async (row: any) => {
  try {
    const response = await deleteComment(row._id)
    if (response.data.success) {
      ElMessage.success('删除评论成功')
      fetchCommentsList()
    } else {
      ElMessage.error('删除评论失败')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除评论失败')
  }
}

// 从详情对话框删除评论
const handleDeleteFromDetail = async () => {
  if (!selectedComment.value) return
  
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？删除后无法恢复！', '确认删除', {
      type: 'warning'
    })
    
    await handleDelete(selectedComment.value)
    detailDialogVisible.value = false
    selectedComment.value = null
  } catch (error) {
    // 用户取消删除
  }
}

// 删除回复
const handleDeleteReply = async (reply: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条回复吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await deleteComment(reply._id)
    if (response.data.success) {
      ElMessage.success('删除回复成功')
      // 刷新回复列表（保持当前分页）
      await fetchRepliesList()
      // 刷新主列表（更新回复计数）
      fetchCommentsList()
    } else {
      ElMessage.error('删除回复失败')
    }
  } catch (error) {
    console.error('删除回复失败:', error)
    ElMessage.error('删除回复失败')
  }
}

// 批量删除评论
const handleBatchDelete = async () => {
  if (selectedComments.value.length === 0) {
    ElMessage.warning('请先选择要删除的评论')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedComments.value.length} 条评论吗？删除后无法恢复！`,
      '确认删除',
      { type: 'warning' }
    )

    const commentIds = selectedComments.value.map((comment: any) => comment._id)
    const response = await batchDeleteComments(commentIds)
    
    if (response.data.success) {
      ElMessage.success(`成功删除 ${selectedComments.value.length} 条评论`)
      selectedComments.value = []
      fetchCommentsList()
    } else {
      ElMessage.error('批量删除评论失败')
    }
  } catch (error) {
    console.error('批量删除评论失败:', error)
    ElMessage.error('批量删除评论失败')
  }
}

// 刷新列表
const refreshList = () => {
  fetchCommentsList()
}

// 返回文章列表
const goBack = () => {
  router.push({ name: 'zhang' })
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.comment-management {
  padding: 20px;
  background: #f5f5f5;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.article-info-card {
  margin-bottom: 20px;
}

.article-info {
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  font-weight: 500;
  color: #666;
}

.info-item .value {
  color: #333;
  font-weight: 600;
}

.comment-content {
  max-width: 100%;
}

.content-text {
  margin-bottom: 5px;
  line-height: 1.5;
  word-break: break-word;
}

.content-text.is-reply {
  padding-left: 15px;
  border-left: 3px solid #409eff;
  background: #f0f9ff;
  padding: 8px 15px;
  border-radius: 4px;
}

.reply-indicator {
  color: #409eff;
  font-weight: 500;
}

.content-meta {
  font-size: 12px;
  color: #999;
}

.reply-to {
  color: #409eff;
  font-weight: 500;
}

.user-name {
  font-weight: 500;
  color: #409eff;
}

.comment-level {
  text-align: center;
}

.level-info {
  margin-top: 5px;
  font-size: 12px;
}

.reply-count {
  color: #409eff;
}

.like-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #f56c6c;
}

.time-info {
  text-align: center;
}

.created-time {
  font-size: 13px;
  color: #333;
  margin-bottom: 3px;
}

.updated-time {
  font-size: 11px;
  color: #999;
}

/* 评论详情对话框样式 */
.comment-detail {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.detail-label {
  min-width: 80px;
  font-weight: 500;
  color: #666;
  margin-right: 10px;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-content {
  flex: 1;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  line-height: 1.6;
  word-break: break-word;
}

/* 回复列表对话框样式 */
.replies-container {
  max-height: 500px;
  overflow-y: auto;
}

.original-comment {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.comment-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.comment-user {
  font-weight: 500;
  color: #409eff;
  margin-bottom: 8px;
}

.comment-content {
  line-height: 1.6;
  margin-bottom: 10px;
  color: #333;
}

.comment-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
}

.replies-list h4 {
  margin-bottom: 15px;
  color: #333;
}

.no-replies {
  text-align: center;
  padding: 30px;
}

.reply-item {
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 10px;
  background: white;
}

.reply-user {
  font-weight: 500;
  color: #409eff;
  margin-bottom: 6px;
  font-size: 14px;
}

.reply-content {
  line-height: 1.5;
  margin-bottom: 8px;
  color: #333;
}

.reply-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 12px;
  color: #666;
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

:deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
}

/* 回复分页样式 */
.replies-pagination {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
}

.replies-pagination :deep(.el-pagination) {
  justify-content: center;
}
</style>
  