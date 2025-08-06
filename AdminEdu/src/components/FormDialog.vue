<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="title" 
    :width="width"
    @close="handleClose"
  >
    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="formRef" 
      :label-width="labelWidth"
    >
      <!-- 动态表单字段 -->
      <template v-if="useLayout">
        <el-row :gutter="20">
          <el-col 
            v-for="group in formGroups" 
            :key="group.title"
            :span="group.span || 12"
          >
            <h4 v-if="group.title">{{ group.title }}</h4>
            <form-field
              v-for="field in group.fields"
              :key="field.key"
              :field="field"
              :form-data="formData"
              @update="handleFieldUpdate"
              @change="handleFieldChange"
            />
          </el-col>
        </el-row>
      </template>
      
      <template v-else>
        <form-field
          v-for="field in formFields"
          :key="field.key"
          :field="field"
          :form-data="formData"
          @update="handleFieldUpdate"
          @change="handleFieldChange"
        />
      </template>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">{{ readonly ? '关闭' : cancelText }}</el-button>
        <el-button 
          v-if="!readonly"
          type="primary" 
          @click="handleSubmit" 
          :loading="submitting"
        >
          {{ submitText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import FormField from './FormField.vue'

export interface FormFieldConfig {
  key: string
  label: string
  type: 'input' | 'select' | 'date' | 'number' | 'textarea' | 'switch'
  placeholder?: string
  options?: Array<{ label: string; value: any }> | (() => Array<{ label: string; value: any }>)
  required?: boolean
  span?: number
  min?: number
  max?: number
  precision?: number
  rows?: number
  disabled?: boolean
  onChange?: (value: any) => void
}

export interface FormGroup {
  title?: string
  span?: number
  fields: FormFieldConfig[]
}

interface Props {
  modelValue: boolean
  title: string
  formData: Record<string, any>
  formFields?: FormFieldConfig[]
  formGroups?: FormGroup[]
  rules?: FormRules
  width?: string
  labelWidth?: string
  submitting?: boolean
  useLayout?: boolean
  cancelText?: string
  submitText?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '800px',
  labelWidth: '120px',
  submitting: false,
  useLayout: false,
  cancelText: '取消',
  submitText: '确定',
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:formData': [formData: Record<string, any>]
  'submit': [formData: Record<string, any>]
  'cancel': []
  'close': []
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleFieldUpdate = (key: string, value: any) => {
  // 处理嵌套字段，如 'fuzeren.name'
  const keys = key.split('.')
  const newFormData = { ...props.formData }
  
  if (keys.length === 1) {
    // 简单字段
    newFormData[key] = value
  } else {
    // 嵌套字段
    let current = newFormData
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }
    current[keys[keys.length - 1]] = value
  }
  
  // 通过事件更新表单数据，让父组件处理
  emit('update:formData', newFormData)
}

const handleFieldChange = (key: string, value: any) => {
  // 处理字段变化事件
  const field = findFieldByKey(key)
  if (field && field.onChange) {
    field.onChange(value)
  }
}

const findFieldByKey = (key: string): FormFieldConfig | undefined => {
  if (props.formFields) {
    return props.formFields.find(field => field.key === key)
  }
  if (props.formGroups) {
    for (const group of props.formGroups) {
      const field = group.fields.find(field => field.key === key)
      if (field) return field
    }
  }
  return undefined
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    emit('submit', props.formData)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleClose = () => {
  emit('close')
  formRef.value?.resetFields()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

h4 {
  color: #409eff;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e6f7ff;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 