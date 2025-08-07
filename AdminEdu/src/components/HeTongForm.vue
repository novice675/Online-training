<template>
  <div class="hetong-form">
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="120px"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="合同编号" prop="he_bian" required>
            <el-input 
              v-model="formData.he_bian" 
              placeholder="请输入合同编号"
              clearable
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="合同属性" prop="shuxing" required>
            <el-select 
              v-model="formData.shuxing" 
              placeholder="请选择合同属性"
              style="width: 100%"
            >
              <el-option label="新签" value="新签" />
              <el-option label="续签" value="续签" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="签订人" prop="qianPeople" required>
            <el-input 
              v-model="formData.qianPeople" 
              placeholder="请输入签订人"
              clearable
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="联系方式" prop="phone" required>
            <el-input 
              v-model="formData.phone" 
              placeholder="请输入联系方式"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="签订时间" prop="startDate" required>
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              placeholder="选择签订时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endDate" required>
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              placeholder="选择结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="合同备注" prop="beizhu">
        <el-input 
          v-model="formData.beizhu" 
          type="textarea"
          :rows="3"
          placeholder="请输入合同备注"
          clearable
        />
      </el-form-item>
    </el-form>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ isEditMode ? '更新合同' : '保存合同' }}
      </el-button>
    </div>
  </div>
</template>

<script setup name="HeTongForm">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addHetong, updateHetong } from '../api/auth'

const props = defineProps({
  contractData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 响应式数据
const formRef = ref()
const submitting = ref(false)

// 表单数据
const formData = reactive({
  he_bian: '',
  shuxing: '新签',
  qianPeople: '',
  phone: '',
  startDate: null,
  endDate: null,
  beizhu: ''
})

// 表单验证规则
const formRules = {
  he_bian: [
    { required: true, message: '请输入合同编号', trigger: 'blur' },
    { min: 1, max: 50, message: '合同编号长度应在1-50个字符', trigger: 'blur' }
  ],
  shuxing: [
    { required: true, message: '请选择合同属性', trigger: 'change' }
  ],
  qianPeople: [
    { required: true, message: '请输入签订人', trigger: 'blur' },
    { min: 1, max: 50, message: '签订人长度应在1-50个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择签订时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 计算是否为编辑模式
const isEditMode = computed(() => {
  return props.contractData && props.contractData._id
})

// 监听props变化，设置表单数据
watch(() => props.contractData, (newData) => {
  if (newData && newData._id) {
    // 编辑模式：填充数据
    Object.keys(formData).forEach(key => {
      if (newData[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          // 处理日期格式
          formData[key] = newData[key] ? new Date(newData[key]) : null
        } else {
          formData[key] = newData[key]
        }
      }
    })
  } else {
    // 新增模式：重置表单
    Object.keys(formData).forEach(key => {
      if (key === 'shuxing') {
        formData[key] = '新签'
      } else if (key === 'startDate' || key === 'endDate') {
        formData[key] = null
      } else {
        formData[key] = ''
      }
    })
  }
}, { immediate: true })

// 自定义验证：结束时间必须晚于开始时间
const validateEndDate = () => {
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (end <= start) {
      ElMessage.error('结束时间必须晚于签订时间')
      return false
    }
  }
  return true
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (!validateEndDate()) {
      return
    }
    
    submitting.value = true
    
    let response
    if (isEditMode.value) {
      // 编辑模式：调用更新接口
      response = await updateHetong(props.contractData._id, formData)
    } else {
      // 新增模式：调用创建接口
      response = await addHetong(formData)
    }
    
    const result = response.data
    
    if (result.code === 200) {
      ElMessage.success(isEditMode.value ? '合同更新成功' : '合同创建成功')
      emit('submit')
    } else {
      ElMessage.error(result.msg || (isEditMode.value ? '更新失败' : '创建失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.hetong-form {
  padding: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

.el-row {
  margin-bottom: 8px;
}
</style> 