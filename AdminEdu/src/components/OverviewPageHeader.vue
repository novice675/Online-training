<template>
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <div class="title-bar"></div>
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div class="refresh-section">
        <el-button
          @click="$emit('refresh')"
          :loading="loading"
          icon="Refresh"
        >
          刷新数据
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  loading?: boolean;
}>();

defineEmits<{
  refresh: [];
}>();
</script>

<style scoped>
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-bar {
  width: 4px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 2px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 4px 0 0 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style> 