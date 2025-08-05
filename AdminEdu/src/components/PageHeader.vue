<template>
  <div class="page-header">
    <h2>{{ title }}</h2>
    <div class="header-actions">
      <el-button 
        v-if="showAdd" 
        type="primary" 
        @click="$emit('add')"
      >
        {{ addText }}
      </el-button>
      <el-button 
        v-if="showBatchDelete" 
        type="warning" 
        :disabled="selectedCount === 0"
        @click="$emit('batchDelete')"
      >
        {{ batchDeleteText }} ({{ selectedCount }})
      </el-button>
      <slot name="extra-actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  showAdd?: boolean
  showBatchDelete?: boolean
  selectedCount?: number
  addText?: string
  batchDeleteText?: string
}

withDefaults(defineProps<Props>(), {
  showAdd: true,
  showBatchDelete: true,
  selectedCount: 0,
  addText: '新增',
  batchDeleteText: '批量删除'
})

defineEmits<{
  add: []
  batchDelete: []
}>()
</script>

<style scoped>
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
</style> 