<template>
  <div class="homework-submit">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>提交作业</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form :model="homeworkForm" label-width="120px">
        <el-form-item label="作业标题">
          <span>{{ homeworkInfo.title }}</span>
        </el-form-item>
        <el-form-item label="所属课程">
          <span>{{ homeworkInfo.course }}</span>
        </el-form-item>
        <el-form-item label="截止时间">
          <span>{{ homeworkInfo.deadline }}</span>
        </el-form-item>
        <el-form-item label="作业要求">
          <div class="homework-requirements">
            {{ homeworkInfo.requirements }}
          </div>
        </el-form-item>
        <el-form-item label="提交文件">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                支持 .doc, .docx, .pdf 格式文件，不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="homeworkForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（选填）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交作业</el-button>
          <el-button @click="handleSave">保存草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { UploadFile } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 作业信息
const homeworkInfo = ref({
  id: 0,
  title: '',
  course: '',
  deadline: '',
  requirements: ''
})

// 提交表单
const homeworkForm = ref({
  remark: '',
  file: null as File | null
})

// 文件列表
const fileList = ref<UploadFile[]>([])

// 获取作业ID
const homeworkId = route.params.id

// 获取作业信息
const getHomeworkInfo = () => {
  // TODO: 调用API获取作业信息
  // 模拟数据
  homeworkInfo.value = {
    id: Number(homeworkId),
    title: '第一章习题',
    course: '高等数学',
    deadline: '2024-03-20 23:59',
    requirements: '完成教材第一章的所有习题，要求书写工整，计算过程完整。'
  }
}

// 处理文件变化
const handleFileChange = (file: UploadFile) => {
  homeworkForm.value.file = file.raw || null
}

// 提交作业
const handleSubmit = () => {
  // TODO: 实现作业提交功能
  console.log('提交作业', {
    homeworkId: homeworkId,
    ...homeworkForm.value
  })
}

// 保存草稿
const handleSave = () => {
  // TODO: 实现保存草稿功能
  console.log('保存草稿', {
    homeworkId: homeworkId,
    ...homeworkForm.value
  })
}

// 返回列表
const goBack = () => {
  router.push('/index/homework/list')
}

onMounted(() => {
  getHomeworkInfo()
})
</script>

<style scoped>
.homework-submit {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
}

.homework-requirements {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
}

.upload-demo {
  width: 100%;
}
</style> 