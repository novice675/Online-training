<template>
  <div class="zuhu-people-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>租户人员管理</h2>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入人员姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input
            v-model="searchForm.phone"
            placeholder="请输入手机号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="单位名称">
          <el-input
            v-model="searchForm.companyName"
            placeholder="请输入单位名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="人员类型">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择人员类型"
            clearable
            style="width: 150px"
          >
            <el-option label="员工" value="员工" />
            <el-option label="负责人" value="负责人" />
            <el-option label="临时人员" value="临时人员" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar
              :src="scope.row.picture"
              :size="40"
              icon="el-icon-user-solid"
              fit="cover"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="姓名" width="120" />
        
        <el-table-column label="性别" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.sex === '男' ? 'primary' : 'danger'" size="small">
              {{ scope.row.sex || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="手机号" width="130" />
        
        <el-table-column label="人员类型" width="100">
          <template #default="scope">
            <el-tag :type="getRoleTagType(scope.row.role)" size="small">
              {{ scope.row.role || '员工' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="单位信息" width="200">
          <template #default="scope">
            <div class="company-info">
              <div class="company-name">{{ scope.row.companyName || '未知单位' }}</div>
              <div v-if="scope.row.companyType" class="company-type">
                <el-tag size="small" type="info">{{ scope.row.companyType }}</el-tag>
          </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="所属位置" width="180">
          <template #default="scope">
            <div class="location-info">
              <div v-if="scope.row.inaddress">
                <el-icon><OfficeBuilding /></el-icon>
                {{ scope.row.inaddress }}
              </div>
              <div v-if="scope.row.house">
                <el-icon><House /></el-icon>
                {{ scope.row.house }}
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="联系方式" width="200">
          <template #default="scope">
            <div class="contact-info">
              <div v-if="scope.row.phone">
                <el-icon><Phone /></el-icon>
                {{ scope.row.phone }}
              </div>
              <div v-if="scope.row.email">
                <el-icon><Message /></el-icon>
                {{ scope.row.email }}
              </div>
              <div v-if="scope.row.weixin">
                <el-icon><ChatDotRound /></el-icon>
                {{ scope.row.weixin }}
            </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-popconfirm
              title="确定要删除这个人员吗？"
              @confirm="handleDelete(scope.row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
          </div>
    </el-card>

    <!-- 人员详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleDialogClose"
    >
      <div v-if="currentEmployee" class="employee-detail">
        <div class="detail-header">
          <el-avatar
            :src="currentEmployee.picture"
            :size="80"
            icon="el-icon-user-solid"
            fit="cover"
          />
          <div class="basic-info">
            <h3>{{ currentEmployee.name }}</h3>
            <p>{{ currentEmployee.role || '员工' }}</p>
            <p>{{ currentEmployee.companyName }}</p>
          </div>
        </div>
        
        <el-divider />
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentEmployee.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentEmployee.sex || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentEmployee.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ currentEmployee.sfz }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentEmployee.email || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="微信">{{ currentEmployee.weixin || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="人员类型">{{ currentEmployee.role || '员工' }}</el-descriptions-item>
          <el-descriptions-item label="单位名称">{{ currentEmployee.companyName }}</el-descriptions-item>
          <el-descriptions-item label="单位类型">{{ currentEmployee.companyType || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="所属楼宇">{{ currentEmployee.inaddress || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="房间号">{{ currentEmployee.house || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="单位地址">{{ currentEmployee.outaddress || '未知' }}</el-descriptions-item>
        </el-descriptions>
    </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Phone, Message, ChatDotRound, OfficeBuilding, House } from '@element-plus/icons-vue'
import { employeeList, deleteEmployee } from '@/api/auth'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const currentEmployee = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  companyName: '',
  role: ''
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取人员列表
const fetchEmployeeList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.size,
      ...searchForm
    }
    
    const response = await employeeList(params)
    
    if (response.data.code === 200) {
      tableData.value = response.data.data.list
      pagination.total = response.data.data.total
    } else {
      ElMessage.error('获取人员列表失败')
    }
  } catch (error) {
    console.error('获取人员列表失败:', error)
    ElMessage.error('获取人员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.page = 1
  fetchEmployeeList()
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    companyName: '',
    role: ''
  })
  pagination.page = 1
  fetchEmployeeList()
}

// 分页处理
const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchEmployeeList()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  fetchEmployeeList()
}

// 选择处理
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 获取角色标签类型
const getRoleTagType = (role: string) => {
  switch (role) {
    case '负责人':
      return 'warning'
    case '临时人员':
      return 'info'
    case '员工':
    default:
      return 'primary'
  }
}

// 查看人员详情
const handleView = (row: any) => {
  currentEmployee.value = row
  dialogTitle.value = '人员详情'
  dialogVisible.value = true
}



// 删除人员
const handleDelete = async (row: any) => {
  try {
    const response = await deleteEmployee(row._id)
    
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchEmployeeList() // 重新获取列表
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除员工失败:', error)
    ElMessage.error('删除失败')
  }
}



// 关闭弹窗
const handleDialogClose = () => {
  dialogVisible.value = false
  currentEmployee.value = null
}

// 组件挂载时获取数据
onMounted(() => {
  fetchEmployeeList()
})
</script>

<style scoped>
.zuhu-people-container {
  padding: 20px;
  background: #f5f5f5;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.contact-info > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-name {
  font-weight: 500;
  color: #333;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.location-info > div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.employee-detail .detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.employee-detail .detail-header .basic-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.employee-detail .detail-header .basic-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
