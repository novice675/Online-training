<template>
  <div class="page-header">
    <div class="header-content">
      <div class="title-section">
        <div class="title-bar"></div>
        <div>
          <h1 class="page-title">{{ title }}</h1>
        </div>
      </div>
      <div class="actions-section">
        <el-button
          v-if="showAdd"
          type="primary"
          @click="$emit('add')"
          icon="Plus"
        >
          {{ addText || '新增' }}
        </el-button>
        <el-button
          v-if="showBatchDelete"
          type="danger"
          :disabled="!selectedCount"
          @click="$emit('batch-delete')"
          icon="Delete"
        >
          批量删除 ({{ selectedCount || 0 }})
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  showAdd?: boolean;
  showBatchDelete?: boolean;
  selectedCount?: number;
  addText?: string;
}>();

defineEmits<{
  add: [];
  'batch-delete': [];
}>();
</script>

<style scoped>
.page-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  box-sizing: border-box;
}

.header-content {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
}

.title-section {
  display: flex !important;
  align-items: center !important;
  gap: 16px;
  flex: 1; /* 让标题区域占据剩余空间 */
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

.actions-section {
  display: flex !important;
  gap: 12px;
  align-items: center !important;
  flex-shrink: 0; /* 防止按钮区域被压缩 */
  margin-left: auto; /* 强制右对齐 */
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

  .actions-section {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 