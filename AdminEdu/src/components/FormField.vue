<template>
  <el-form-item 
    :label="field.label" 
    :prop="field.key"
    :required="field.required"
  >
    <!-- 输入框 -->
    <el-input 
      v-if="field.type === 'input'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
    />
    
    <!-- 选择器 -->
    <el-select 
      v-else-if="field.type === 'select'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      @change="handleChange"
      :placeholder="field.placeholder"
      style="width: 100%"
      :disabled="field.disabled"
    >
      <el-option 
        v-for="option in getFieldOptions()" 
        :key="option.value"
        :label="option.label" 
        :value="option.value" 
      />
    </el-select>
    
    <!-- 数字输入框 -->
    <el-input-number 
      v-else-if="field.type === 'number'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      :min="field.min"
      :max="field.max"
      :precision="field.precision"
      style="width: 100%"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
    />
    
    <!-- 日期选择器 -->
    <el-date-picker 
      v-else-if="field.type === 'date'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      type="date"
      :placeholder="field.placeholder"
      style="width: 100%"
      :disabled="field.disabled"
    />
    
    <!-- 文本域 -->
    <el-input 
      v-else-if="field.type === 'textarea'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      type="textarea"
      :rows="field.rows || 3"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
    />
    
    <!-- 开关 -->
    <el-switch 
      v-else-if="field.type === 'switch'"
      :model-value="getFieldValue(field.key)"
      @update:model-value="handleUpdate"
      :disabled="field.disabled"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import type { FormFieldConfig } from './FormDialog.vue'

interface Props {
  field: FormFieldConfig
  formData: Record<string, any>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [key: string, value: any]
  change: [key: string, value: any]
}>()

// 安全获取字段值
const getFieldValue = (key: string) => {
  if (!key || !props.formData) return ''
  
  // 处理嵌套字段，如 'fuzeren.name'
  const keys = key.split('.')
  let value = props.formData
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return ''
    }
  }
  
  return value !== undefined && value !== null ? value : ''
}

// 安全获取字段选项
const getFieldOptions = () => {
  if (!props.field || !props.field.options) return []
  
  // 如果options是computed响应式对象，需要访问其value属性
  if (typeof props.field.options === 'object' && props.field.options && 'value' in props.field.options) {
    try {
      return (props.field.options as any).value || []
    } catch (error) {
      console.error('Error getting field options:', error)
      return []
    }
  }
  
  // 如果options是函数，需要调用它
  if (typeof props.field.options === 'function') {
    try {
      return (props.field.options as () => Array<{ label: string; value: any }>)() || []
    } catch (error) {
      console.error('Error getting field options:', error)
      return []
    }
  }
  
  // 如果options是数组，直接返回
  if (Array.isArray(props.field.options)) {
    return props.field.options
  }
  
  return []
}

const handleUpdate = (value: any) => {
  emit('update', props.field.key, value)
}

const handleChange = (value: any) => {
  emit('change', props.field.key, value)
}
</script> 