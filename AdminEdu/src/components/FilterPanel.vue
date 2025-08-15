<template>
  <div class="filter-container">
    <div class="filter-content">
      <!-- 筛选字段区域 -->
      <div class="filter-fields">
        <div 
          v-for="field in filterFields" 
          :key="field.key"
          class="filter-item"
          :style="{ width: getFieldWidth(field) }"
        >
          <label class="field-label">{{ field.label }}：</label>
          
          <!-- 输入框 -->
          <el-input 
            v-if="field.type === 'input'"
            v-model="filterData[field.key]"
            :placeholder="field.placeholder"
            clearable
            class="field-input"
          />
          
          <!-- 选择器 -->
          <el-select 
            v-else-if="field.type === 'select'"
            v-model="filterData[field.key]" 
            :placeholder="field.placeholder" 
            clearable
            class="field-input"
          >
            <el-option 
              v-for="option in field.options" 
              :key="option.value"
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
          
          <!-- 日期选择器 -->
          <el-date-picker 
            v-else-if="field.type === 'date'"
            v-model="filterData[field.key]"
            type="date"
            :placeholder="field.placeholder"
            class="field-input"
          />
          
          <!-- 日期范围选择器 -->
          <el-date-picker 
            v-else-if="field.type === 'daterange'"
            v-model="filterData[field.key]"
            type="daterange"
            :placeholder="field.placeholder"
            class="field-input"
          />
        </div>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch" icon="Search">
          {{ searchText }}
        </el-button>
        <el-button @click="handleReset" icon="Refresh">
          {{ resetText }}
        </el-button>
        <slot name="extra-actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface FilterOption {
  label: string
  value: string | number
}

interface FilterField {
  key: string
  label: string
  type: 'input' | 'select' | 'date' | 'daterange'
  placeholder?: string
  options?: FilterOption[]
  span?: number
  width?: string
}

interface Props {
  filterFields: FilterField[]
  modelValue: Record<string, any>
  searchText?: string
  resetText?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchText: '查询',
  resetText: '重置'
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: [filterData: Record<string, any>]
  reset: []
}>()

// 本地筛选数据
const filterData = reactive<Record<string, any>>({ ...props.modelValue })

// 获取字段宽度
const getFieldWidth = (field: FilterField) => {
  if (field.width) return field.width
  // 根据字段数量自动分配宽度
  const fieldCount = props.filterFields.length
  if (fieldCount <= 2) return '300px'
  if (fieldCount <= 3) return '250px'
  return '200px'
}

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(filterData, newVal)
}, { deep: true })

// 监听内部数据变化并同步到外部
watch(filterData, (newVal) => {
  emit('update:modelValue', { ...newVal })
}, { deep: true })

const handleSearch = () => {
  emit('search', { ...filterData })
}

const handleReset = () => {
  // 重置所有字段
  Object.keys(filterData).forEach(key => {
    filterData[key] = ''
  })
  emit('reset')
}
</script>

<style scoped>
.filter-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.filter-content {
  padding: 24px 32px;
  display: flex;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
  min-height: 80px;
}

.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  flex: 1;
  min-width: 0;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 240px;
  flex-shrink: 0;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  white-space: nowrap;
  min-width: 90px;
  text-align: right;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  min-width: 180px;
}

.filter-actions {
  display: flex;
  gap: 16px;
  flex-shrink: 0;
  margin-left: auto;
}

.filter-actions .el-button {
  padding: 10px 24px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 80px;
}

.filter-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .filter-fields {
    gap: 16px;
  }
  
  .filter-item {
    min-width: 220px;
  }
}

@media (max-width: 1200px) {
  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .filter-fields {
    justify-content: flex-start;
  }
  
  .filter-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .filter-content {
    padding: 16px;
  }
  
  .filter-fields {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-item {
    width: 100%;
    min-width: auto;
  }
  
  .field-label {
    min-width: 70px;
    text-align: left;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .filter-actions .el-button {
    flex: 1;
    max-width: 120px;
  }
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .filter-container {
    background: #1a1a1a;
    border-color: #303030;
  }
  
  .field-label {
    color: #e4e7ed;
  }
}
</style> 