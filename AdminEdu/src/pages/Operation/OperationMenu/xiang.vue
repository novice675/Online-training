<template>
  <div class="article-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft">返回列表</el-button>
        <div class="page-title">
          <div class="title-bar"></div>
          <span>{{ getPageTitle(articleData?.type) }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="editArticle" v-if="articleData">{{ getEditButtonText(articleData.type) }}</el-button>
      </div>
    </div>

    <!-- 文章内容 -->
    <div class="article-content" v-if="articleData" v-loading="loading">
      <!-- 文章基本信息 -->
      <div class="article-info-card">
        <h1 class="article-title">{{ articleData.title }}</h1>
        
        <div class="article-meta">
          <div class="meta-item">
            <span class="meta-label">内容类型：</span>
            <el-tag :type="getTypeTagType(articleData.type)" effect="light">
              {{ articleData.type }}
            </el-tag>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">发布频道：</span>
            <el-tag :type="articleData.channel === '今日热点' ? 'danger' : 'primary'" effect="light">
              {{ articleData.channel }}
            </el-tag>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">发布状态：</span>
            <el-tag :type="getStatusTagType(articleData.status)" effect="light">
              {{ articleData.status || '草稿' }}
            </el-tag>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">发布时间：</span>
            <span class="meta-value">{{ formatDate(articleData.published_at || articleData.created_at) }}</span>
          </div>
          
          <div class="meta-item" v-if="articleData.keywords">
            <span class="meta-label">关键词：</span>
            <span class="meta-value">{{ articleData.keywords }}</span>
          </div>
        </div>

        <!-- 内容摘要 -->
        <div class="article-summary" v-if="articleData.summary">
          <h3>{{ getContentSummaryTitle(articleData.type) }}</h3>
          <p>{{ articleData.summary }}</p>
        </div>
      </div>

      <!-- 文章封面 -->
      <div class="article-cover-card" v-if="articleData.cover">
        <h3>文章封面</h3>
        <div class="cover-container">
          <img :src="articleData.cover" alt="文章封面" class="cover-image" />
        </div>
      </div>

      <!-- 文章主体内容 -->
      <div class="article-body-card">
        <!-- 图文内容 -->
        <div v-if="articleData.type === '图文'" class="content-text">
          <h3>文章内容</h3>
          <div v-if="cleanContent(articleData.content)" class="rich-content" v-html="cleanContent(articleData.content)"></div>
          <div v-else class="no-media">
            <el-empty description="暂无文章内容" />
          </div>
        </div>

        <!-- 视频内容 -->
        <div v-else-if="articleData.type === '视频'" class="content-video">
          <!-- 视频播放器 -->
          <div v-if="articleData.video_url" class="video-section">
            <h3>视频内容</h3>
            <div class="video-container">
              <video 
                :src="articleData.video_url" 
                controls 
                preload="metadata"
                class="video-player"
                @error="handleMediaError"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
          
          <!-- 视频描述 -->
          <div v-if="cleanContent(articleData.content)" class="media-description">
            <h3>视频介绍</h3>
            <div class="rich-content" v-html="cleanContent(articleData.content)"></div>
          </div>
          
          <!-- 如果没有视频URL和内容，显示提示 -->
          <div v-if="!articleData.video_url && !cleanContent(articleData.content)" class="no-media">
            <h3>视频内容</h3>
            <el-empty description="暂无视频内容" />
          </div>
        </div>

        <!-- 音频内容 -->
        <div v-else-if="articleData.type === '音频'" class="content-audio">
          <!-- 音频播放器 -->
          <div v-if="articleData.audio_url" class="audio-section">
            <h3>音频内容</h3>
            <div class="audio-container">
              <audio 
                :src="articleData.audio_url" 
                controls 
                preload="metadata"
                class="audio-player"
                @error="handleMediaError"
              >
                您的浏览器不支持音频播放
              </audio>
            </div>
          </div>
          
          <!-- 音频描述 -->
          <div v-if="cleanContent(articleData.content)" class="media-description">
            <h3>音频介绍</h3>
            <div class="rich-content" v-html="cleanContent(articleData.content)"></div>
          </div>
          
          <!-- 如果没有音频URL和内容，显示提示 -->
          <div v-if="!articleData.audio_url && !cleanContent(articleData.content)" class="no-media">
            <h3>音频内容</h3>
            <el-empty description="暂无音频内容" />
          </div>
        </div>

        <!-- 其他类型或无类型 -->
        <div v-else class="content-default">
          <h3>文章内容</h3>
          <div v-if="cleanContent(articleData.content)" class="rich-content" v-html="cleanContent(articleData.content)"></div>
          <div v-else class="no-media">
            <el-empty description="暂无内容" />
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="article-stats-card">
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ articleData.view_count || 0 }}</div>
            <div class="stat-label">浏览量</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ articleData.like_count || 0 }}</div>
            <div class="stat-label">点赞数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ articleData.comment_count || 0 }}</div>
            <div class="stat-label">评论数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ articleData.share_count || 0 }}</div>
            <div class="stat-label">分享数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-container">
      <el-loading-spinner />
      <p>正在加载文章详情...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="文章不存在或已被删除">
        <el-button type="primary" @click="goBack">返回列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { wenDetail } from '../../../api/auth.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const articleData = ref<any>(null)

// 获取文章详情
const getArticleDetail = async () => {
  const articleId = route.params.id as string
  if (!articleId) {
    ElMessage.error('文章ID不存在')
    goBack()
    return
  }

  try {
    loading.value = true
    const response = await wenDetail(articleId)
    
    if (response.data.code === 200) {
      articleData.value = response.data.data
      console.log('文章数据:', articleData.value)
      console.log('文章类型:', articleData.value?.type)
      console.log('文章内容:', articleData.value?.content)
    } else {
      ElMessage.error(response.data.msg || '获取文章详情失败')
      goBack()
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  try {
    // 先尝试使用路由名称跳转
    if (router.hasRoute('zhang')) {
      console.log('使用路由名称跳转到zhang')
      router.push({ name: 'zhang' })
    } else {
      console.log('zhang路由不存在，尝试路径跳转')
      // 直接使用路径跳转
      router.push('/home/Operation/zhang').catch(err => {
        console.error('路径跳转失败:', err)
        // 使用浏览器历史记录回退
        window.history.back()
      })
    }
  } catch (error) {
    console.error('路由跳转失败:', error)
    // 最后的兜底方案，使用浏览器历史记录回退
    window.history.back()
  }
}

// 编辑文章
const editArticle = () => {
  try {
    const editQuery = { 
      action: 'edit',
      id: articleData.value._id 
    }
    
    // 先尝试使用路由名称跳转
    if (router.hasRoute('zhang')) {
      router.push({ 
        name: 'zhang',
        query: editQuery
      })
    } else {
      // 如果路由不存在，跳转到运营管理主页，然后延迟跳转
      router.push('/home/Operation').then(() => {
        setTimeout(() => {
          router.push({
            path: '/home/Operation/zhang',
            query: editQuery
          })
        }, 100)
      })
    }
  } catch (error) {
    console.error('编辑跳转失败:', error)
    ElMessage.error('跳转失败，请稍后重试')
  }
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

// 获取文章状态标签样式
const getStatusTagType = (status: string) => {
  switch (status) {
    case '已发布':
      return 'success'
    case '草稿':
      return 'info'
    case '待审核':
      return 'warning'
    case '已下架':
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 处理媒体文件错误
const handleMediaError = () => {
  ElMessage.error('媒体文件加载失败，请检查文件路径')
}

// 清理内容中不需要的文本
const cleanContent = (content: string) => {
  if (!content) return ''
  
  // 移除常见的模板文本
  const unwantedTexts = [
    '详细内容正在完善中，敬请关注续更新。',
    '详细内容正在完善中，敬请关注续更新',
    '内容正在完善中',
    '敬请关注续更新'
  ]
  
  let cleanedContent = content
  unwantedTexts.forEach(text => {
    cleanedContent = cleanedContent.replace(new RegExp(text, 'g'), '')
  })
  
  return cleanedContent.trim()
}

// 根据内容类型获取摘要标题
const getContentSummaryTitle = (type: string) => {
  switch (type) {
    case '视频':
      return '视频简介'
    case '音频':
      return '音频简介'
    case '图文':
    default:
      return '内容简介'
  }
}

// 根据内容类型获取页面标题
const getPageTitle = (type: string) => {
  switch (type) {
    case '视频':
      return '视频详情'
    case '音频':
      return '音频详情'
    case '图文':
      return '文章详情'
    default:
      return '内容详情'
  }
}

// 根据内容类型获取编辑按钮文字
const getEditButtonText = (type: string) => {
  switch (type) {
    case '视频':
      return '编辑视频'
    case '音频':
      return '编辑音频'
    case '图文':
      return '编辑文章'
    default:
      return '编辑内容'
  }
}

onMounted(() => {
  getArticleDetail()
  
  // 调试：检查当前路由信息
  console.log('当前路由:', router.currentRoute.value)
  console.log('zhang路由是否存在:', router.hasRoute('zhang'))
  console.log('所有可用路由:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
})
</script>

<style scoped>
.article-detail-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}

/* ==================== 页面头部 ==================== */
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

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
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

/* ==================== 文章内容 ==================== */
.article-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-info-card,
.article-cover-card,
.article-body-card,
.article-stats-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 文章标题 */
.article-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.4;
  word-break: break-word;
}

/* 文章元信息 */
.article-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-weight: 600;
  color: #666;
  min-width: 80px;
}

.meta-value {
  color: #333;
}

/* 文章摘要 */
.article-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.article-summary h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.article-summary p {
  margin: 0;
  line-height: 1.6;
  color: #666;
}

/* 文章封面 */
.cover-container {
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 内容区域 */
.article-body-card h3,
.article-cover-card h3,
.article-stats-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

/* 富文本内容 */
.rich-content {
  line-height: 1.8;
  color: #333;
  font-size: 16px;
  word-break: break-word;
}

.rich-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

.rich-content :deep(p) {
  margin: 16px 0;
}

.rich-content :deep(h1),
.rich-content :deep(h2),
.rich-content :deep(h3),
.rich-content :deep(h4),
.rich-content :deep(h5),
.rich-content :deep(h6) {
  margin: 24px 0 16px 0;
  color: #333;
}

/* 视频播放器 */
.video-section {
  margin-bottom: 30px;
}

.video-container {
  text-align: center;
  margin-top: 20px;
}

.video-player {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 音频播放器 */
.audio-section {
  margin-bottom: 30px;
}

.audio-container {
  text-align: center;
  margin-top: 20px;
}

.audio-player {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
}

/* 媒体描述 */
.media-description {
  margin-top: 30px;
}

.media-description h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

/* 无媒体内容 */
.no-media {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

/* 无内容文本 */
.no-content-text {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-style: italic;
}

.no-content-text p {
  margin: 0;
  font-size: 14px;
}

/* 统计信息 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-detail-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: space-between;
  }
  
  .article-title {
    font-size: 24px;
  }
  
  .article-meta {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
