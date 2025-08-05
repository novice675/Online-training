<template>
  <el-form-item 
    :label="field.label" 
    :prop="field.key"
    :required="field.required"
  >
    <!-- 输入框 -->
    <el-input 
      v-if="field.type === 'input'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
      :placeholder="field.placeholder"
    />
    
    <!-- 选择器 -->
    <el-select 
      v-else-if="field.type === 'select'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
      :placeholder="field.placeholder"
      style="width: 100%"
    >
      <el-option 
        v-for="option in field.options" 
        :key="option.value"
        :label="option.label" 
        :value="option.value" 
      />
    </el-select>
    
    <!-- 数字输入框 -->
    <el-input-number 
      v-else-if="field.type === 'number'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
      :min="field.min"
      :max="field.max"
      :precision="field.precision"
      style="width: 100%"
      :placeholder="field.placeholder"
    />
    
    <!-- 日期选择器 -->
    <el-date-picker 
      v-else-if="field.type === 'date'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
      type="date"
      :placeholder="field.placeholder"
      style="width: 100%"
    />
    
    <!-- 文本域 -->
    <el-input 
      v-else-if="field.type === 'textarea'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
      type="textarea"
      :rows="field.rows || 3"
      :placeholder="field.placeholder"
    />
    
    <!-- 开关 -->
    <el-switch 
      v-else-if="field.type === 'switch'"
      :model-value="formData[field.key]"
      @update:model-value="handleUpdate"
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
}>()

const handleUpdate = (value: any) => {
  emit('update', props.field.key, value)
}
</script> 