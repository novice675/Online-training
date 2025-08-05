<template>
  <div class="data-table-container">
    <!-- 数据表格 -->
    <div class="table-container">
      <el-table 
        :data="data" 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <!-- 动态列 -->
        <template v-for="column in columns">
          <!-- 选择列 -->
          <el-table-column 
            v-if="column.type === 'selection'" 
            :key="'selection-' + column.type"
            type="selection" 
            :width="column.width || 55" 
          />
          
          <!-- 序号列 -->
          <el-table-column 
            v-else-if="column.type === 'index'" 
            :key="'index-' + column.type"
            :label="column.label"
            :width="column.width || 60"
            :fixed="column.fixed"
          >
            <template #default="{ $index }">
              {{ $index + 1 + (pagination?.page - 1) * (pagination?.size || 10) }}
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column 
            v-else-if="column.type === 'actions'" 
            :key="'actions-' + column.type"
            :label="column.label" 
            :width="column.width || actionWidth" 
            :fixed="column.fixed || 'right'"
          >
            <template #default="{ row }">
              <slot name="actions" :row="row"></slot>
            </template>
          </el-table-column>
          
          <!-- 普通列 -->
          <el-table-column 
            v-else
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :show-overflow-tooltip="column.showOverflowTooltip"
          >
            <template #default="{ row }" v-if="column.slot">
              <slot :name="column.slot" :row="row" :column="column"></slot>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.size"
        :page-sizes="pageSizes"
        :total="pagination.total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Column {
  prop?: string
  label?: string
  type?: 'selection' | 'index' | 'actions' | string
  width?: string | number
  minWidth?: string | number
  fixed?: string | boolean
  showOverflowTooltip?: boolean
  slot?: string // 自定义插槽名称
}



export interface Pagination {
  page: number
  size: number
  total: number
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  showSelection?: boolean
  showActions?: boolean
  actionWidth?: string | number
  showPagination?: boolean
  pagination?: Pagination
  pageSizes?: number[]
  paginationLayout?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showSelection: true,
  showActions: true,
  actionWidth: 150,
  showPagination: true,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
  'selection-change': [selection: any[]]
  'size-change': [size: number]
  'current-change': [page: number]
}>()

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}
</script>

<style scoped>
.data-table-container {
  display: flex;
  flex-direction: column;
}

.table-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pagination-container {
  display: flex;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

:deep(.el-table th) {
  background-color: #fafafa;
}
</style> 