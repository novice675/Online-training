<template>
  <div class="article-form">
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="100px"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文章标题" prop="title" required>
            <el-input 
              v-model="formData.title" 
              placeholder="请输入文章标题"
              clearable
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="文章类型" prop="type" required>
            <el-select 
              v-model="formData.type" 
              placeholder="请选择文章类型"
              style="width: 100%"
            >
              <el-option label="图文" value="图文" />
              <el-option label="视频" value="视频" />
              <el-option label="音频" value="音频" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="发布频道" prop="channel" required>
            <el-select 
              v-model="formData.channel" 
              placeholder="请选择发布频道"
              style="width: 100%"
            >
              <el-option label="今日热点" value="今日热点" />
              <el-option label="推荐" value="推荐" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="文章状态" prop="status">
            <el-select 
              v-model="formData.status" 
              placeholder="请选择状态"
              style="width: 100%"
            >
              <el-option label="草稿" value="草稿" />
              <el-option label="已发布" value="已发布" />
              <el-option label="已下线" value="已下线" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="关键词" prop="keywords">
        <el-input 
          v-model="formData.keywords" 
          placeholder="请输入关键词，多个关键词用逗号分隔"
          clearable
        />
      </el-form-item>

      <el-form-item label="文章摘要" prop="summary">
        <el-input 
          v-model="formData.summary" 
          type="textarea"
          :rows="3"
          placeholder="请输入文章摘要"
          clearable
        />
      </el-form-item>

      <!-- 根据文章类型显示不同的上传组件 -->
      <el-form-item v-if="formData.type === '图文'" label="文章封面">
        <el-upload
          class="cover-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleCoverSuccess"
          :before-upload="beforeImageUpload"
          accept="image/*"
        >
          <img v-if="formData.cover" :src="formData.cover" class="cover-image" />
          <div v-else class="cover-uploader-icon">
            <el-icon><Plus /></el-icon>
            <div class="upload-text">上传封面</div>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item v-else-if="formData.type === '视频'" label="视频文件">
        <el-upload
          class="video-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleVideoSuccess"
          :before-upload="beforeVideoUpload"
          accept="video/*"
        >
          <div v-if="formData.videoUrl" class="video-preview">
            <video :src="formData.videoUrl" controls style="width: 200px; height: 120px;"></video>
            <div class="file-name">{{ formData.videoName }}</div>
          </div>
          <div v-else class="upload-area">
            <el-icon><VideoPlay /></el-icon>
            <div class="upload-text">上传视频</div>
            <div class="upload-tip">支持 MP4, AVI, MOV 格式</div>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item v-else-if="formData.type === '音频'" label="音频文件">
        <el-upload
          class="audio-uploader"
          :action="uploadUrl"
          :show-file-list="false"
          :on-success="handleAudioSuccess"
          :before-upload="beforeAudioUpload"
          accept="audio/*"
        >
          <div v-if="formData.audioUrl" class="audio-preview">
            <audio :src="formData.audioUrl" controls style="width: 300px;"></audio>
            <div class="file-name">{{ formData.audioName }}</div>
          </div>
          <div v-else class="upload-area">
            <el-icon><Microphone /></el-icon>
            <div class="upload-text">上传音频</div>
            <div class="upload-tip">支持 MP3, WAV, AAC 格式</div>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="文章内容" prop="content" required>
        <el-input 
          v-model="formData.content" 
          type="textarea"
          :rows="8"
          placeholder="请输入文章内容（支持HTML格式）"
        />
      </el-form-item>
    </el-form>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        保存草稿
      </el-button>
      <el-button 
        type="success" 
        @click="handlePublish"
        :loading="publishing"
      >
        直接发布
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="ArticleForm">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, VideoPlay, Microphone } from '@element-plus/icons-vue'
import { addWen, uploadFile, updateWen } from '../api/auth.js'

interface Props {
  articleData?: any
}

interface ArticleData {
  title: string
  type: string
  channel: string
  status: string
  keywords: string
  summary: string
  content: string
  cover: string
}

const props = withDefaults(defineProps<Props>(), {
  articleData: null
})

const emit = defineEmits(['submit', 'cancel'])

// 响应式数据
const formRef = ref<any>()
const submitting = ref<boolean>(false)
const publishing = ref<boolean>(false)
const uploadUrl = 'http://localhost:3008/wen/upload'

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  channel: '',
  status: '草稿',
  keywords: '',
  summary: '',
  content: '',
  cover: '',
  videoUrl: '',
  videoName: '',
  audioUrl: '',
  audioName: ''
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 20, message: '标题长度应在1-20个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择文章类型', trigger: 'change' }
  ],
  channel: [
    { required: true, message: '请选择发布频道', trigger: 'change' }
  ],
  summary: [
    { max: 200, message: '简介不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 计算是否为编辑模式
const isEditMode = computed(() => {
  return props.articleData && props.articleData._id
})

// 监听props变化，设置表单数据
watch(() => props.articleData, (newData) => {
  if (newData && newData._id) {
    // 编辑模式：填充数据
    Object.keys(formData).forEach(key => {
      if (newData[key] !== undefined) {
        formData[key] = newData[key]
      }
    })
  } else {
    // 新增模式：重置表单
    Object.keys(formData).forEach(key => {
      if (key === 'status') {
        formData[key] = '草稿'
      } else {
        formData[key] = ''
      }
    })
  }
}, { immediate: true })

// 封面上传成功回调
const handleCoverSuccess = (response: any) => {
  if (response.code === 200) {
    formData.cover = response.url
    ElMessage.success('封面上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 图片上传前检查
const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 视频上传前检查
const beforeVideoUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/')
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('视频大小不能超过 50MB!')
    return false
  }
  return true
}

// 音频上传前检查
const beforeAudioUpload = (file: File) => {
  const isAudio = file.type.startsWith('audio/')
  const isLt20M = file.size / 1024 / 1024 < 20

  if (!isAudio) {
    ElMessage.error('只能上传音频文件!')
    return false
  }
  if (!isLt20M) {
    ElMessage.error('音频大小不能超过 20MB!')
    return false
  }
  return true
}

// 视频上传成功回调
const handleVideoSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    formData.videoUrl = response.url
    formData.videoName = file.name
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 音频上传成功回调
const handleAudioSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    formData.audioUrl = response.url
    formData.audioName = file.name
    ElMessage.success('音频上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
}

// 提交表单（支持新增和编辑）
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    let response
    if (isEditMode.value) {
      // 编辑模式：调用更新接口
      response = await updateWen(props.articleData._id, formData)
    } else {
      // 新增模式：调用创建接口
      response = await addWen(formData)
    }
    
    const result = response.data
    
    if (result.code === 200) {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
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

// 直接发布（设置状态为已发布）
const handlePublish = async () => {
  try {
    await formRef.value.validate()
    
    publishing.value = true
    
    // 设置状态为已发布
    const publishData = { ...formData, status: '已发布' }
    
    let response
    if (isEditMode.value) {
      // 编辑模式：调用更新接口
      response = await updateWen(props.articleData._id, publishData)
    } else {
      // 新增模式：调用创建接口
      response = await addWen(publishData)
    }
    
    const result = response.data
    
    if (result.code === 200) {
      ElMessage.success('发布成功')
      emit('submit')
    } else {
      ElMessage.error(result.msg || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.article-form {
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

.cover-uploader {
  display: flex;
  justify-content: center;
}

:deep(.cover-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.cover-uploader .el-upload:hover) {
  border-color: #409eff;
}

.cover-uploader-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8c939d;
}

.cover-uploader-icon .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.cover-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}

/* 视频上传样式 */
.video-uploader {
  display: flex;
  justify-content: center;
}

:deep(.video-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.video-uploader .el-upload:hover) {
  border-color: #409eff;
}

/* 音频上传样式 */
.audio-uploader {
  display: flex;
  justify-content: center;
}

:deep(.audio-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 300px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.audio-uploader .el-upload:hover) {
  border-color: #409eff;
}

/* 通用上传区域样式 */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 10px;
}

.upload-area .el-icon {
  font-size: 32px;
  margin-bottom: 10px;
  color: #409eff;
}

.upload-text {
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 500;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 文件预览样式 */
.video-preview, .audio-preview {
  text-align: center;
}

.file-name {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  word-break: break-all;
}
</style> 