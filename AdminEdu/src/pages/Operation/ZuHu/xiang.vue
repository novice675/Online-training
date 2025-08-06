<template>
  <div class="zuhu-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button type="primary" @click="goBack" :icon="ArrowLeft">返回</el-button>
        <h2>租户详情</h2>
      </div>
      <div class="header-right">
        <el-button type="success" @click="handleEdit">编辑</el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 详情内容 -->
    <div v-else-if="zuhuData" class="detail-content">
      <!-- 租户基本信息 -->
      <el-card class="info-card" header="租户基本信息">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>租户状态：</label>
              <el-tag :type="getStatusType(zuhuData.status)">{{ zuhuData.status }}</el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDate(zuhuData.created_at) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDate(zuhuData.updated_at) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 企业基本信息 -->
      <el-card class="info-card" header="关联企业信息" v-if="zuhuData.company">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>企业名称：</label>
              <span>{{ zuhuData.company.name || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>企业类型：</label>
              <span>{{ zuhuData.company.type || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>所在楼宇：</label>
              <span>{{ zuhuData.company.inaddress || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>房间号：</label>
              <span>{{ zuhuData.company.house || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="info-item">
              <label>企业地址：</label>
              <span>{{ zuhuData.company.outaddress || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <!-- 企业Logo -->
        <el-row :gutter="20" v-if="zuhuData.company.logo">
          <el-col :span="12">
            <div class="image-item">
              <label>企业Logo：</label>
              <div class="image-preview">
                <el-image 
                  :src="zuhuData.company.logo" 
                  fit="contain"
                  style="width: 200px; height: 150px;"
                  :preview-src-list="[zuhuData.company.logo]"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 负责人信息 -->
      <el-card class="info-card" header="负责人信息" v-if="zuhuData.employee">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ zuhuData.employee.name || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>性别：</label>
              <span>{{ zuhuData.employee.sex || '暂无' }}</span>
          </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>手机号：</label>
              <span>{{ zuhuData.employee.phone || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ zuhuData.employee.email || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>身份证号：</label>
              <span>{{ zuhuData.employee.sfz || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>微信号：</label>
              <span>{{ zuhuData.employee.weixin || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>职位：</label>
              <span>{{ zuhuData.employee.role || '暂无' }}</span>
          </div>
          </el-col>
        </el-row>
        <!-- 员工头像 -->
        <el-row :gutter="20" v-if="zuhuData.employee.picture">
          <el-col :span="12">
            <div class="image-item">
              <label>员工头像：</label>
              <div class="image-preview">
                <el-image 
                  :src="zuhuData.employee.picture" 
                  fit="contain"
                  style="width: 150px; height: 150px; border-radius: 50%;"
                  :preview-src-list="[zuhuData.employee.picture]"
                />
          </div>
        </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 未分配负责人提示 -->
      <el-card class="info-card" header="负责人信息" v-else>
        <el-empty description="暂未分配负责人" />
      </el-card>

      <!-- 关联合同信息 -->
      <el-card class="info-card" header="关联合同信息" v-if="zuhuData.contract">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>合同编号：</label>
              <span>{{ zuhuData.contract.he_bian || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>合同名称：</label>
              <span>{{ zuhuData.contract.name || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>合同楼宇：</label>
              <span>{{ zuhuData.contract.louyu || '暂无' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="info-item">
              <label>合同房间：</label>
              <span>{{ zuhuData.contract.fangjian || '暂无' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>开始时间：</label>
              <span>{{ formatDate(zuhuData.contract.startDate) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>结束时间：</label>
              <span>{{ formatDate(zuhuData.contract.endDate) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 未关联合同提示 -->
      <el-card class="info-card" header="关联合同信息" v-else>
        <el-empty description="暂未关联合同" />
      </el-card>
    </div>

    <!-- 数据不存在 -->
    <div v-else class="no-data">
      <el-empty description="租户信息不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { zuhuDetail, deleteZuhu } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const zuhuData = ref<any>(null)

// 获取租户详情
const fetchZuhuDetail = async () => {
  loading.value = true
  try {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('租户ID不存在')
    goBack()
    return
  }

    const response = await zuhuDetail(id)
    if (response.data.code === 200) {
      zuhuData.value = response.data.data
    } else {
      ElMessage.error(response.data.message || '获取租户详情失败')
      goBack()
    }
  } catch (error: any) {
    console.error('获取租户详情失败:', error)
    ElMessage.error('获取租户详情失败：' + (error.response?.data?.message || error.message))
    goBack()
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 编辑租户
const handleEdit = () => {
  if (!zuhuData.value?._id) {
    ElMessage.error('租户ID不存在，无法编辑')
    return
  }
  
  router.push({
    name: 'ZuHuXinXi',
    query: { edit: zuhuData.value._id }
  })
}

// 删除租户
const handleDelete = async () => {
  if (!zuhuData.value?._id) {
    ElMessage.error('租户ID不存在，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个租户吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await deleteZuhu(zuhuData.value._id)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      goBack()
    } else {
      ElMessage.error(response.data.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除租户失败:', error)
      ElMessage.error('删除失败：' + (error.response?.data?.message || error.message))
    }
  }
}

// 工具函数
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    '正常': 'success',
    '暂停': 'warning',
    '终止': 'danger'
  }
  return typeMap[status] || 'info'
}

// 生命周期
onMounted(() => {
  fetchZuhuDetail()
})
</script>

<style scoped>
.zuhu-detail-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 40px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 10px;
}

.loading-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.info-card :deep(.el-card__header) {
  background: #f8f9fa;
  font-weight: 600;
  color: #303133;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
  margin-right: 10px;
}

.info-item span {
  color: #303133;
  flex: 1;
}

.image-item {
  margin-bottom: 15px;
}

.image-item label {
  font-weight: 500;
  color: #606266;
  display: block;
  margin-bottom: 10px;
}

.image-preview {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.no-data {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

:deep(.el-tag) {
  font-size: 12px;
}

:deep(.el-empty) {
  padding: 20px 0;
}
</style>
