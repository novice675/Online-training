<template>
  <div class="table-layout">
    <!-- 标题区域 -->
    <div class="header-area">
      <div class="title">
        <div class="title-bar"></div>
        <h2>{{ title }}</h2>
      </div>
      <div class="action-buttons">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area" v-if="$slots.search">
      <slot name="search"></slot>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <slot name="table"></slot>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-area" v-if="showPagination">
      <slot name="pagination">
        <!-- 默认分页组件 -->
        <div class="pagination-info" v-if="showTotal">
          共 {{ total }} 条
        </div>
        <el-pagination
          :current-page="currentPageModel"
          :page-size="pageSizeModel"
          :page-sizes="pageSizes"
          :layout="paginationLayout"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义
const props = defineProps({
  // 页面标题
  title: {
    type: String,
    required: true
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 是否显示总数信息
  showTotal: {
    type: Boolean,
    default: true
  },
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 10
  },
  // 总条数
  total: {
    type: Number,
    default: 0
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50]
  },
  // 分页布局
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

// Events 定义
const emit = defineEmits(['update:currentPage', 'update:pageSize', 'size-change', 'current-change'])

// 响应式计算属性
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (value) => emit('update:pageSize', value)
})

// 事件处理
const handleSizeChange = (size) => {
  emit('update:pageSize', size)
  emit('size-change', size)
}

const handleCurrentChange = (page) => {
  emit('update:currentPage', page)
  emit('current-change', page)
}
</script>

<style scoped>
.table-layout {
  padding: 20px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.title {
  display: flex;
  align-items: center;
}

.title-bar {
  width: 4px;
  height: 20px;
  background-color: #4080ff;
  margin-right: 8px;
}

.title h2 {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.search-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.table-area {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pagination-info {
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-area {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .pagination-area {
    flex-direction: column;
    gap: 15px;
  }
}

/* 深度选择器 - 优化表单样式 */
:deep(.el-form--inline .el-form-item) {
  margin-right: 20px;
  margin-bottom: 15px;
}

:deep(.el-date-editor--daterange) {
  width: 260px;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-input) {
  width: 180px;
}
</style> 