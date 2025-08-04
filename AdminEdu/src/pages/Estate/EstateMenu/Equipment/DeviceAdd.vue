<template>
  <div class="device-add-page">
    <div class="page-header">
      <div class="title">
        <div class="title-bar"></div>
        <h2>新增设备</h2>
      </div>
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>物业管理</el-breadcrumb-item>
          <el-breadcrumb-item>设备管理</el-breadcrumb-item>
          <el-breadcrumb-item>新增设备</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="form-container">
      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-width="120px"
        class="device-form"
      >
        <div class="form-content">
          <!-- 左侧：设备基本信息 -->
          <div class="form-section">
            <div class="section-title">设备基本信息：</div>
            <div class="form-group">
              <el-form-item label="设备名称" prop="name" required>
                <el-input 
                  v-model="formData.name" 
                  placeholder="请输入设备名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="设备编号" prop="deviceNumber" required>
                <el-input 
                  v-model="formData.deviceNumber" 
                  placeholder="请输入设备编号"
                  maxlength="30"
                />
              </el-form-item>

              <el-form-item label="设备型号" prop="deviceModel" required>
                <el-select 
                  v-model="formData.deviceModel" 
                  placeholder="请选择设备型号"
                  style="width: 100%"
                >
                  <el-option
                    v-for="model in deviceModelOptions"
                    :key="model.value"
                    :label="model.label"
                    :value="model.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="运行时间" prop="operationTime">
                <el-date-picker
                  v-model="formData.operationTime"
                  type="date"
                  placeholder="请选择运行日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="运行状态" prop="status" required>
                <el-select 
                  v-model="formData.status" 
                  placeholder="请选择运行状态"
                  style="width: 100%"
                >
                  <el-option
                    v-for="status in statusOptions"
                    :key="status.value"
                    :label="status.label"
                    :value="status.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="跟进人" prop="followUpPerson">
                <el-input 
                  v-model="formData.followUpPerson" 
                  placeholder="请输入跟进人"
                  maxlength="20"
                />
              </el-form-item>

              <el-form-item label="联系方式" prop="contactInfo" required>
                <el-input 
                  v-model="formData.contactInfo" 
                  placeholder="请输入联系方式"
                  maxlength="20"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 右侧：设备详细信息 -->
          <div class="form-section">
            <div class="section-title">设备详细信息：</div>
            <div class="form-group">
              <el-form-item label="安装位置" prop="installLocation" required>
                <div class="location-selector">
                  <el-button 
                    type="primary" 
                    :icon="Location" 
                    @click="showMapDialog = true"
                  >
                    选择位置
                  </el-button>
                </div>
                <!-- 地图显示区域 -->
                <div class="map-container" v-if="formData.installLocation">
                  <div class="map-placeholder">
                    <el-icon><Location /></el-icon>
                    <span>{{ formData.installLocation }}</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="现场照片" prop="sitePhotos" required>
                <div class="upload-section">
                  <el-upload
                    ref="siteUploadRef"
                    :file-list="sitePhotoList"
                    :action="uploadAction"
                    :headers="uploadHeaders"
                    :before-upload="beforeSitePhotoUpload"
                    :on-success="handleSitePhotoSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleSitePhotoRemove"
                    list-type="picture-card"
                    :limit="5"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                    <template #tip>
                      <div class="upload-tip">上传现场照片，支持jpg/png格式，最多5张</div>
                    </template>
                  </el-upload>
                </div>
              </el-form-item>

              <el-form-item label="设备照片" prop="devicePhotos" required>
                <div class="upload-section">
                  <el-upload
                    ref="deviceUploadRef"
                    :file-list="devicePhotoList"
                    :action="uploadAction"
                    :headers="uploadHeaders"
                    :before-upload="beforeDevicePhotoUpload"
                    :on-success="handleDevicePhotoSuccess"
                    :on-error="handleUploadError"
                    :on-remove="handleDevicePhotoRemove"
                    list-type="picture-card"
                    :limit="5"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                    <template #tip>
                      <div class="upload-tip">上传设备照片，支持jpg/png格式，最多5张</div>
                    </template>
                  </el-upload>
                </div>
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button 
            type="primary" 
            @click="handleSave"
            :loading="saveLoading"
            size="large"
          >
            保存
          </el-button>
          <el-button 
            @click="handleCancel"
            size="large"
          >
            取消
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 地图选择对话框 -->
    <el-dialog
      v-model="showMapDialog"
      title="选择安装位置"
      width="800px"
      :before-close="handleMapDialogClose"
      @opened="handleMapDialogOpened"
    >
      <div class="map-dialog-content">
        <div class="map-view">
          <AMapSelector
            ref="amapSelectorRef"
            :api-key="amapApiKey"
            height="430px"
            @location-selected="handleLocationSelected"
            @location-changed="handleLocationChanged"
          />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMapDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmLocation">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location, Plus, Search } from '@element-plus/icons-vue'
import AMapSelector from '@/components/AMapSelector.vue'
import { MenjinList } from '../../api/auth.js'

interface FormData {
  name: string
  deviceNumber: string
  deviceModel: string
  operationTime: string
  status: string
  followUpPerson: string
  contactInfo: string
  installLocation: string
  sitePhotos: string[]
  devicePhotos: string[]
}

interface UploadFile {
  name: string
  url: string
  uid: number
}

const router = useRouter()
const formRef = ref()
const siteUploadRef = ref()
const deviceUploadRef = ref()
const amapSelectorRef = ref()

// 获取当前日期的函数
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 表单数据
const formData = reactive<FormData>({
  name: '',
  deviceNumber: '',
  deviceModel: '',
  operationTime: getCurrentDate(), // 默认为当前日期
  status: '正常',
  followUpPerson: '',
  contactInfo: '',
  installLocation: '',
  sitePhotos: [],
  devicePhotos: []
})

// 设备型号选项
const deviceModelOptions = [
  { label: 'ISS20200816', value: 'ISS20200816' },
  { label: 'ISS20200817', value: 'ISS20200817' },
  { label: 'ISS20200818', value: 'ISS20200818' },
  { label: 'ISS20200819', value: 'ISS20200819' },
  { label: 'ISS20200820', value: 'ISS20200820' }
]

// 运行状态选项
const statusOptions = [
  { label: '正常', value: '正常' },
  { label: '离线', value: '离线' },
  { label: '报警', value: '报警' },
  { label: '禁用', value: '禁用' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入设备名称', trigger: 'blur' },
    { min: 2, max: 50, message: '设备名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  deviceNumber: [
    { required: true, message: '请输入设备编号', trigger: 'blur' },
    { min: 5, max: 30, message: '设备编号长度在 5 到 30 个字符', trigger: 'blur' }
  ],
  deviceModel: [
    { required: true, message: '请选择设备型号', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择运行状态', trigger: 'change' }
  ],
  contactInfo: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  installLocation: [
    { required: true, message: '请选择安装位置', trigger: 'blur' }
  ],
  sitePhotos: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (sitePhotoList.value.length === 0) {
          callback(new Error('请上传现场照片'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  devicePhotos: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (devicePhotoList.value.length === 0) {
          callback(new Error('请上传设备照片'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 上传相关
const uploadAction = ref('/api/upload') // 上传接口地址
const uploadHeaders = ref({
  'Authorization': 'Bearer ' + localStorage.getItem('token')
})

const sitePhotoList = ref<UploadFile[]>([])
const devicePhotoList = ref<UploadFile[]>([])

// 地图相关
const showMapDialog = ref(false)
const searchLocation = ref('')
const amapApiKey = ref('17414d5ecce78099b6c60524da3ffa68') // 高德地图API Key

// 状态
const saveLoading = ref(false)

// 生成默认设备编号，格式：年份+月+日+编号，如：20250803001
const generateDeviceNumber = async () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  
  try {
    // 获取现有设备数量
    const response = await MenjinList()
    const currentCount = response.data?.data?.length || 0
    // 新设备序号为现有数量+1
    const sequence = currentCount + 1
    const sequenceStr = String(sequence).padStart(3, '0')
    return `${year}${month}${day}${sequenceStr}`
  } catch (error) {
    console.error('获取设备数量失败:', error)
    // 如果API调用失败，使用默认编号001
    return `${year}${month}${day}001`
  }
}

// 初始化设备编号（异步）
const initDeviceNumber = async () => {
  formData.deviceNumber = await generateDeviceNumber()
}

// 文件上传处理
const beforeSitePhotoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const beforeDevicePhotoUpload = (file: File) => {
  return beforeSitePhotoUpload(file)
}

const handleSitePhotoSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    formData.sitePhotos.push(response.data.url)
    ElMessage.success('现场照片上传成功')
  } else {
    ElMessage.error('现场照片上传失败')
  }
}

const handleDevicePhotoSuccess = (response: any, file: any) => {
  if (response.code === 200) {
    formData.devicePhotos.push(response.data.url)
    ElMessage.success('设备照片上传成功')
  } else {
    ElMessage.error('设备照片上传失败')
  }
}

const handleUploadError = (error: any) => {
  ElMessage.error('文件上传失败，请重试')
}

const handleSitePhotoRemove = (file: any) => {
  const index = formData.sitePhotos.indexOf(file.url)
  if (index > -1) {
    formData.sitePhotos.splice(index, 1)
  }
}

const handleDevicePhotoRemove = (file: any) => {
  const index = formData.devicePhotos.indexOf(file.url)
  if (index > -1) {
    formData.devicePhotos.splice(index, 1)
  }
}

// 地图相关处理
const handleLocationSelected = (location: any) => {
  formData.installLocation = location.formattedAddress
  showMapDialog.value = false
  ElMessage.success('位置选择成功')
}

const handleLocationChanged = (location: any) => {
  formData.installLocation = location.formattedAddress
}

const confirmLocation = () => {
  const result = amapSelectorRef.value?.confirmLocation()
  if (result) {
    const location = amapSelectorRef.value?.getCurrentLocation()
    if (location) {
      formData.installLocation = location.formattedAddress
      showMapDialog.value = false
      ElMessage.success('位置选择成功')
    }
  }
}

const handleMapDialogClose = () => {
  showMapDialog.value = false
}

const handleMapDialogOpened = () => {
  // 对话框打开后刷新地图显示
  setTimeout(() => {
    amapSelectorRef.value?.refreshMap()
  }, 300)
}

// 保存处理
const handleSave = async () => {
  try {
    await formRef.value?.validate()
    saveLoading.value = true
    
    // 模拟保存API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage.success('设备保存成功')
    router.push('/property/menjin') // 跳转到门禁管理页面
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saveLoading.value = false
  }
}

// 取消处理
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消吗？未保存的数据将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    router.back()
  }).catch(() => {
    // 用户取消
  })
}

// 页面初始化
onMounted(() => {
  initDeviceNumber()
})
</script>

<style scoped>
.device-add-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.page-header {
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

.form-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.form-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.form-section {
  min-height: 500px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.form-group {
  padding: 0 10px;
}

.location-selector {
  display: flex;
  align-items: center;
}

.map-container {
  margin-top: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.map-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-section {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 地图对话框样式 */
.map-dialog-content {
  height: 500px;
}

.map-view {
  height: 450px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .device-add-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Element Plus 组件样式调整 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

:deep(.el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}

:deep(.el-dialog__body) {
  padding: 20px 20px 0;
}
</style> 