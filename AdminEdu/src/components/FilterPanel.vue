<template>
  <div class="filter-container">
    <el-row :gutter="20">
      <el-col 
        v-for="field in filterFields" 
        :key="field.key"
        :span="field.span || 6"
      >
        <div class="filter-item">
          <label>{{ field.label }}：</label>
          
          <!-- 输入框 -->
          <el-input 
            v-if="field.type === 'input'"
            v-model="filterData[field.key]"
            :placeholder="field.placeholder"
            clearable
          />
          
          <!-- 选择器 -->
          <el-select 
            v-else-if="field.type === 'select'"
            v-model="filterData[field.key]" 
            :placeholder="field.placeholder" 
            clearable
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
            style="width: 100%"
          />
          
          <!-- 日期范围选择器 -->
          <el-date-picker 
            v-else-if="field.type === 'daterange'"
            v-model="filterData[field.key]"
            type="daterange"
            :placeholder="field.placeholder"
            style="width: 100%"
          />
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="filter-actions">
          <el-button type="success" @click="handleSearch">{{ searchText }}</el-button>
          <el-button @click="handleReset">{{ resetText }}</el-button>
          <slot name="extra-actions"></slot>
        </div>
      </el-col>
    </el-row>
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
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.filter-item label {
  min-width: 80px;
  margin-right: 10px;
  color: #666;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style> 