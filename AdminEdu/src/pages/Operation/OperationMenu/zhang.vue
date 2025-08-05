<template>
  <div class="article-management">
    <div class="page-header">
      <div class="page-title">
        <div class="title-bar"></div>
        <span>文章发布管理</span>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="Addqing">新增</el-button>
        <el-button 
          type="danger" 
          @click="AllDel"
          :disabled="checkedList.length === 0"
        >
          批量删除 ({{ checkedList.length }})
        </el-button>
      </div>
    </div>
 
    <div class="search-area">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="search-item">
            <label>文章标题：</label>
            <el-input 
              v-model="souForm.title" 
              placeholder="请输入文章标题"
              clearable
              @keyup.enter="show"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <label>文章类型：</label>
            <el-select 
              v-model="souForm.type" 
              placeholder="请选择"
              clearable
            >
              <el-option label="图文" value="图文" />
              <el-option label="视频" value="视频" />
              <el-option label="音频" value="音频" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-actions">
            <el-button type="success" @click="show">查询</el-button>
            <el-button @click="qing">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="table-area">
      <el-table 
        :data="data" 
        style="width: 100%"
        v-loading="loading"
        @selection-change="Allchecked"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="title" label="文章标题" min-width="200">
          <template #default="{ row }">
            <span class="article-title">{{ row.title }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="channel" label="发布渠道" width="120" />
        
        <el-table-column prop="channel" label="发布频道" width="120">
          <template #default="{ row }">
            <el-tag :type="row.channel === '今日热点' ? 'danger' : 'primary'">
              {{ row.channel }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="文章类型" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="yangshi(row.type)"
              effect="light"
            >
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="keywords" label="关键词" width="150">
          <template #default="{ row }">
            <span class="keywords">{{ row.keywords || '-' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="发布人" width="100">
          <template #default>
            <span>管理员</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="published_at" label="发布时间" width="120">
          <template #default="{ row }">
            <span>{{ formatDate(row.published_at || row.created_at) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="alone(row)">详情</el-button>
            <el-button link type="success" @click="EditWen(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-area">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="changeSzie"
        @current-change="changePage"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :close-on-click-modal="false"
    >
      <ArticleForm 
        ref="formRef"
        :article-data="WenFrom"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </el-dialog>




  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TableColumnCtx } from 'element-plus'
import { wenList, addWen, uploadFile, deleteWen, batchDeleteWen } from '../../../api/auth.js'
import ArticleForm from '../../../components/ArticleForm.vue'

const router = useRouter()

const loading = ref(false)
const data = ref<any[]>([])
const checkedList = ref<any[]>([])
const dialogVisible = ref<boolean>(false)
const WenFrom = ref<any>(null)
const formRef = ref<any>(null)


interface params {
  page: number
  size: number
  title: string
  type: string
}

const souForm = reactive({
  title: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})


const setTitle = computed(() => {
  return '新增文章'
})

const dialogTitle = computed(() => {
  return WenFrom.value ? '编辑文章' : '新增文章'
})


const getList = async () => {
  try {
    loading.value = true
    const params: params = {
      page: pagination.page,
      size: pagination.size,
      title:souForm.title,
      type:souForm.type
    }
    const res = await wenList(params)
    
    if (res.data.code === 200) {
      data.value = res.data.data
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.data.msg || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}


const show = () => {
  pagination.page = 1
  getList()
}


const qing = () => {
  souForm.title = ''
  souForm.type = ''
  pagination.page = 1
  getList()
}


const Addqing = () => {
  WenFrom.value = null
  dialogVisible.value = true
}

// 查看详情 - 跳转到详情页面
const alone = (row: any) => {
  router.push(`/home/Operation/xiang/${row._id}`)
}

// 编辑文章
const EditWen = (row: any) => {
  WenFrom.value = { ...row }
  dialogVisible.value = true
}



// 删除单个文章
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章"${row.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await deleteWen(row._id)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(response.data.msg || '删除失败')
      return
    }
    getList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文章失败:', error)
      ElMessage.error('删除失败')
    }
  }
}




// 批量删除
const AllDel = async () => {
  if (checkedList.value.length === 0) {
    ElMessage.warning('请先选择要删除的文章')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${checkedList.value.length} 篇文章吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const ids = checkedList.value.map(item => item._id)
    const response = await batchDeleteWen(ids)
    
    if (response.data.code === 200) {
      ElMessage.success(`成功删除 ${checkedList.value.length} 篇文章`)
    } else {
      ElMessage.error(response.data.msg || '批量删除失败')
      return
    }
    checkedList.value = [] // 清空选择
    getList() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}


const Allchecked = (selection: any[]) => {
  checkedList.value = selection
}


const changeSzie = (size: number) => {
  pagination.size = size
  pagination.page = 1
  getList()
}

const changePage = (page: number) => {
  pagination.page = page
  getList()
}

const handleSubmit = () => {
  dialogVisible.value = false    
  getList()                 
}

const handleCancel = () => {
  dialogVisible.value = false
}

const yangshi = (type: string) => {
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


const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取文章类型标签样式
const getTypeTagType = (type: string) => {
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
  getList()
  
  // 处理从详情页面回来的编辑请求
  const query = router.currentRoute.value.query
  if (query.action === 'edit' && query.id) {
    // 延迟执行，确保列表数据已加载
    setTimeout(() => {
      const article = data.value.find(item => item._id === query.id)
      if (article) {
        EditWen(article)
      }
    }, 500)
  }
})
</script>

<style scoped>

.article-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.page-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.title-bar {
  width: 4px;
  height: 20px;
  background: #409eff;
  margin-right: 10px;
  border-radius: 2px;
}


.header-actions {
  display: flex;
  gap: 10px;
}


.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.search-item {
  display: flex;
  align-items: center;
  gap: 10px;
}


.search-item label {
  min-width: 80px;
  color: #666;
  font-weight: 500;
}


.search-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}


.table-area {
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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


.pagination-area {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  font-weight: 600;
}

:deep(.el-pagination) {
  justify-content: center;
}

/* ==================== 文章详情样式 ==================== */

.article-detail {
  padding: 20px 0;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row label {
  min-width: 100px;
  font-weight: 600;
  color: #333;
  margin-right: 15px;
  flex-shrink: 0;
}

.detail-row span {
  color: #666;
  line-height: 1.6;
}

.content-preview {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  line-height: 1.6;
  color: #333;
}
</style>