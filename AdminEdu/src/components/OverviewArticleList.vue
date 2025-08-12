<template>
  <div class="list-card" v-loading="loading">
    <div class="card-header">
      <h3>最近文章</h3>
      <el-button link type="primary" @click="$emit('viewAll')">
        查看全部
      </el-button>
    </div>
    <div class="list-container">
      <div v-if="articles.length === 0" class="empty-state">
        <el-empty description="暂无最近文章" />
      </div>
      <div v-else class="article-list">
        <div
          v-for="article in articles"
          :key="article._id"
          class="article-item"
        >
          <div class="article-info">
            <div class="article-title">{{ article.title }}</div>
            <div class="article-meta">
              <span class="article-channel">{{
                article.channel || "未分类"
              }}</span>
              <span class="article-date">{{
                formatDate(article.createdAt)
              }}</span>
            </div>
          </div>
          <div class="article-status">
            <el-tag
              :type="getArticleStatusType(article.status)"
              size="small"
            >
              {{ article.status || "草稿" }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Article {
  _id: string;
  title: string;
  channel?: string;
  createdAt: string;
  status?: string;
}

interface Props {
  articles: Article[];
  loading?: boolean;
}

defineProps<Props>();

defineEmits<{
  viewAll: [];
}>();

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("zh-CN");
};

const getArticleStatusType = (status: string): string => {
  switch (status) {
    case "已发布":
      return "success";
    case "草稿":
      return "info";
    case "审核中":
      return "warning";
    case "已拒绝":
      return "danger";
    default:
      return "info";
  }
};
</script>

<style scoped>
.list-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.list-container {
  max-height: 400px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.article-list {
  padding: 12px 0;
}

.article-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #f5f7fa;
  transition: background-color 0.2s ease;
}

.article-item:hover {
  background-color: #f8f9fa;
}

.article-item:last-child {
  border-bottom: none;
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.article-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.article-status {
  text-align: right;
}

.article-channel {
  color: #409eff;
}

.article-date {
  color: #909399;
}
</style> 