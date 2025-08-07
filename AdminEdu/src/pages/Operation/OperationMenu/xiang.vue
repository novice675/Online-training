<template>
  <div class="article-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft">返回列表</el-button>
        <div class="page-title">
          <div class="title-bar"></div>
          <span>{{ getPageTitle(articleData?.articleType) }}</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 审核操作按钮 -->
        <div class="audit-actions" v-if="articleData">
          <!-- 未审核状态：显示审核通过和审核失败按钮 -->
          <template v-if="articleData.status === '未审核'">
            <el-button type="success" @click="handleAudit('审核成功')" :loading="auditLoading">
              <el-icon><Check /></el-icon>
              审核通过
            </el-button>
            <el-button type="danger" @click="handleAudit('审核失败')" :loading="auditLoading">
              <el-icon><Close /></el-icon>
              审核失败
            </el-button>
          </template>
          
          <!-- 审核成功状态：显示设为失败按钮 -->
          <template v-else-if="articleData.status === '审核成功'">
            <el-button type="warning" @click="handleAudit('审核失败')" :loading="auditLoading">
              <el-icon><Close /></el-icon>
              设为审核失败
            </el-button>
          </template>
          
          <!-- 审核失败状态：显示重新审核按钮 -->
          <template v-else-if="articleData.status === '审核失败'">
            <el-button type="success" @click="handleAudit('审核成功')" :loading="auditLoading">
              <el-icon><Check /></el-icon>
              审核通过
            </el-button>
            <el-button type="primary" @click="handleAudit('未审核')" :loading="auditLoading">
              <el-icon><RefreshRight /></el-icon>
              重新审核
            </el-button>
          </template>
                 </div>
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
            <el-tag :type="getTypeTagType(articleData.articleType)" effect="light">
              {{ articleData.articleType }}
            </el-tag>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">发布频道：</span>
            <el-tag :type="getChannelTagType(articleData.channel)" effect="light">
              {{ articleData.channel }}
            </el-tag>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">审核状态：</span>
            <el-tag :type="getStatusTagType(articleData.status)" effect="light">
              {{ articleData.status || '未审核' }}
            </el-tag>
          </div>
          
          <div class="meta-item" v-if="articleData.renderType">
            <span class="meta-label">渲染类型：</span>
            <span class="meta-value">{{ getRenderTypeLabel(articleData.renderType) }}</span>
          </div>
          
          <div class="meta-item" v-if="articleData.author">
            <span class="meta-label">作者：</span>
            <span class="meta-value">{{ articleData.author }}</span>
          </div>
          
          <div class="meta-item">
            <span class="meta-label">发布时间：</span>
            <span class="meta-value">{{ formatDate(articleData.publishTime || articleData.createdAt) }}</span>
          </div>
          
          <div class="meta-item" v-if="articleData.keywords && articleData.keywords.length > 0">
            <span class="meta-label">关键词：</span>
            <span class="meta-value">{{ Array.isArray(articleData.keywords) ? articleData.keywords.join(', ') : articleData.keywords }}</span>
          </div>
          
          <div class="meta-item" v-if="articleData.tags && articleData.tags.length > 0">
            <span class="meta-label">标签：</span>
            <div class="tags-container">
              <el-tag v-for="tag in articleData.tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 内容摘要 -->
        <div class="article-summary" v-if="articleData.summary">
          <h3>{{ getContentSummaryTitle(articleData.articleType) }}</h3>
          <p>{{ articleData.summary }}</p>
        </div>
      </div>

      <!-- 文章封面 -->
      <div class="article-cover-card" v-if="articleData.coverImage">
        <h3>文章封面</h3>
        <div class="cover-container">
          <img :src="articleData.coverImage" alt="文章封面" class="cover-image" />
        </div>
      </div>
      
      <!-- 右侧小图 -->
      <div class="article-cover-card" v-if="articleData.rightImage">
        <h3>右侧小图</h3>
        <div class="cover-container">
          <img :src="articleData.rightImage" alt="右侧小图" class="cover-image" style="max-width: 200px;" />
        </div>
      </div>

      <!-- 文章主体内容 -->
      <div class="article-body-card">
        <!-- 文章内容 -->
        <div v-if="articleData.articleType === '文章'" class="content-text">
          <h3>文章内容</h3>
          <div v-if="cleanContent(articleData.detailContent)" class="rich-content" v-html="cleanContent(articleData.detailContent)"></div>
          <div v-else class="no-media">
            <el-empty description="暂无文章内容" />
          </div>
        </div>

        <!-- 视频内容 -->
        <div v-else-if="articleData.articleType === '视频'" class="content-video">
          <!-- 视频播放器 -->
          <div v-if="articleData.video" class="video-section">
            <h3>视频内容</h3>
            <div class="video-container">
              <video 
                :src="articleData.video" 
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
          <div v-if="cleanContent(articleData.detailContent)" class="media-description">
            <h3>视频介绍</h3>
            <div class="rich-content" v-html="cleanContent(articleData.detailContent)"></div>
          </div>
          
          <!-- 如果没有视频URL和内容，显示提示 -->
          <div v-if="!articleData.video && !cleanContent(articleData.detailContent)" class="no-media">
            <h3>视频内容</h3>
            <el-empty description="暂无视频内容" />
          </div>
        </div>

        <!-- 其他类型或无类型 -->
        <div v-else class="content-default">
          <h3>内容详情</h3>
          <div v-if="cleanContent(articleData.detailContent)" class="rich-content" v-html="cleanContent(articleData.detailContent)"></div>
          <div v-else class="no-media">
            <el-empty description="暂无内容" />
          </div>
        </div>
      </div>
      
      <!-- 详情页额外图片 -->
      <div class="article-images-card" v-if="articleData.detailImages && articleData.detailImages.length > 0">
        <h3>详情图片</h3>
        <div class="images-grid">
          <div v-for="(image, index) in articleData.detailImages" :key="index" class="image-item">
            <img :src="image" :alt="`详情图片${index + 1}`" class="detail-image" />
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="article-stats-card">
        <h3>统计信息</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ articleData.likeCount || 0 }}</div>
            <div class="stat-label">点赞数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatDate(articleData.createdAt) }}</div>
            <div class="stat-label">创建时间</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatDate(articleData.updatedAt) }}</div>
            <div class="stat-label">更新时间</div>
          </div>
          <div class="stat-item" v-if="articleData.auditRemark">
            <div class="stat-number">{{ articleData.auditRemark }}</div>
            <div class="stat-label">审核备注</div>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, RefreshRight } from '@element-plus/icons-vue'
import { wenDetail, updateNewsStatus } from '../../../api/auth.js'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const auditLoading = ref(false)
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
    if (router.hasRoute('zhang')) {
      router.push({ name: 'zhang' })
    } else {
      router.push('/home/Operation/zhang').catch(() => {
        window.history.back()
      })
    }
  } catch (error) {
    console.error('路由跳转失败:', error)
    window.history.back()
  }
}

// 审核文章
const handleAudit = async (targetStatus: string) => {
  try {
    let confirmMessage = ''
    let remark = ''

    // 根据目标状态设置确认消息
    switch (targetStatus) {
      case '审核成功':
        confirmMessage = '确认审核通过这篇文章吗？'
        break
      case '审核失败':
        confirmMessage = '确认将这篇文章设置为审核失败吗？'
        // 如果是设置为审核失败，询问备注
        const { value } = await ElMessageBox.prompt('请输入审核失败原因（可选）', '审核备注', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入审核失败原因...'
        }).catch(() => ({ value: null }))
        
        if (value === null) return // 用户取消了操作
        remark = value || ''
        break
      case '未审核':
        confirmMessage = '确认重新设置为未审核状态吗？'
        break
    }
    
    // 最终确认
    await ElMessageBox.confirm(confirmMessage, '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    auditLoading.value = true

    const response = await updateNewsStatus(articleData.value._id, {
      status: targetStatus,
      remark: remark
    })

    if (response.data.code === 200) {
      ElMessage.success('审核状态更新成功')
      // 更新本地数据
      articleData.value.status = targetStatus
      if (remark) {
        articleData.value.auditRemark = remark
      }
    } else {
      ElMessage.error(response.data.msg || '更新失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('审核操作失败:', error)
      ElMessage.error('操作失败，请稍后重试')
  }
  } finally {
    auditLoading.value = false
  }
}



// 获取文章类型标签样式
const getTypeTagType = (articleType: string) => {
  switch (articleType) {
    case '文章':
      return 'primary'
    case '视频':
      return 'success'
    default:
      return 'info'
  }
}

// 获取文章状态标签样式
const getStatusTagType = (status: string) => {
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

// 获取频道标签样式
const getChannelTagType = (channel: string) => {
  switch (channel) {
    case '推荐':
      return 'primary'
    case '政策':
      return 'success'
    default:
      return 'info'
  }
}

// 获取渲染类型标签
const getRenderTypeLabel = (renderType: string) => {
  switch (renderType) {
    case 'TEXT_ONLY':
      return '纯文字'
    case 'IMAGE_FULL':
      return '大图图文'
    case 'IMAGE_RIGHT':
      return '右侧小图'
    default:
      return renderType || '-'
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
const getContentSummaryTitle = (articleType: string) => {
  switch (articleType) {
    case '视频':
      return '视频简介'
    case '文章':
    default:
      return '内容简介'
  }
}

// 根据内容类型获取页面标题
const getPageTitle = (articleType: string) => {
  switch (articleType) {
    case '视频':
      return '视频详情'
    case '文章':
      return '文章详情'
    default:
      return '内容详情'
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

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.audit-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
.article-stats-card,
.article-images-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 详情图片网格 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-item {
  text-align: center;
}

.detail-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
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

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  margin: 0;
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

/* 内容区域卡片标题通用样式 */
.article-body-card h3,
.article-cover-card h3,
.article-stats-card h3,
.article-images-card h3 {
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
