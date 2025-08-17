<template>
  <div class="louyu-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2>楼宇信息管理</h2>
      <div class="header-actions">

        <el-button type="warning" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <label>楼宇名称：</label>
        <el-input 
          v-model="searchForm.name" 
          placeholder="请输入楼宇名称" 
          style="width: 200px;"
          clearable
        />
      </div>
      <div class="search-actions">
        <el-button type="success" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
        </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table 
        :data="buildingList" 
        style="width: 100%" 
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="楼宇名称" min-width="120" />
        <el-table-column prop="address" label="楼宇地址" min-width="150">
          <template #default="scope">
            {{ scope.row.address || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="层数" min-width="80">
          <template #default="scope">
            {{ scope.row.aboveGroundFloors || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="物业费 (元/平/月)" min-width="120">
          <template #default="scope">
            {{ (scope.row.propertyFee || 0).toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column label="建筑面积 (m²)" min-width="120">
          <template #default="scope">
            {{ (scope.row.buildingArea || 0).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="在管面积" min-width="100">
          <template #default="scope">
            {{ (scope.row.managedArea || 0).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
      </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          :current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditMode ? '编辑楼宇' : '新增楼宇'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="buildingFormRef" 
        :model="buildingForm" 
        :rules="buildingRules" 
        label-width="100px"
      >
              <el-form-item label="楼宇名称" prop="name">
                <el-input v-model="buildingForm.name" placeholder="请输入楼宇名称" />
              </el-form-item>
        <el-form-item label="楼宇地址" prop="address">
          <el-input v-model="buildingForm.address" placeholder="请输入楼宇地址" />
        </el-form-item>
        <el-form-item label="地上楼层" prop="aboveGroundFloors">
          <el-input-number 
            v-model="buildingForm.aboveGroundFloors" 
            :min="1" 
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="地下楼层" prop="undergroundFloors">
          <el-input-number 
            v-model="buildingForm.undergroundFloors" 
            :min="0" 
            :max="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="总层数" prop="floors">
          <el-input-number 
            v-model="buildingForm.floors" 
            :min="1" 
            style="width: 100%"
            disabled
          />
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            自动计算：地上层数 + 地下层数 = {{ (buildingForm.aboveGroundFloors || 0) + (buildingForm.undergroundFloors || 0) }}
          </div>
        </el-form-item>
        <el-form-item label="建筑面积" prop="buildingArea">
          <el-input-number 
            v-model="buildingForm.buildingArea" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="地上面积" prop="aboveGroundArea">
                <el-input-number 
            v-model="buildingForm.aboveGroundArea" 
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
        <el-form-item label="地下面积" prop="undergroundArea">
                <el-input-number 
            v-model="buildingForm.undergroundArea" 
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="在管面积" prop="managedArea">
                <el-input-number 
                  v-model="buildingForm.managedArea" 
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
        <el-form-item label="物业费" prop="propertyFee">
                <el-input-number 
            v-model="buildingForm.propertyFee" 
                  :min="0"
            :precision="2"
                  style="width: 100%"
                />
              </el-form-item>
          <el-form-item label="楼宇描述" prop="description">
            <el-input 
              v-model="buildingForm.description" 
              type="textarea" 
              :rows="3"
              placeholder="请输入楼宇描述" 
            />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEditMode ? '更新' : '保存' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getBuildingList, 
  getBuildingDetail, 
  addBuilding, 
  updateBuilding, 
  deleteBuilding 
} from '../../../api/auth.js'

const buildingFormRef = ref()
const buildingList = ref([])
const selectedRows = ref([])
const dialogVisible = ref(false)
const isEditMode = ref(false)
const currentId = ref('')
const submitLoading = ref(false)
const tableLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: ''
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const buildingForm = reactive({
  name: '',
  address: '',
  description: '',
  aboveGroundFloors: 1,
  undergroundFloors: 0,
  buildingArea: 0,
  aboveGroundArea: 0,
  undergroundArea: 0,
  managedArea: 0,
  propertyFee: 0,
  floors: 0 // 总层数字段
})

// 表单验证规则
const buildingRules = {
  name: [{ required: true, message: '请输入楼宇名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入楼宇地址', trigger: 'blur' }],
  aboveGroundFloors: [
    { required: true, message: '请输入地上楼层数', trigger: 'blur' },
    { type: 'number', min: 1, message: '地上楼层数至少为1层', trigger: 'blur' }
  ],
  undergroundFloors: [
    { type: 'number', min: 0, message: '地下楼层数不能为负数', trigger: 'blur' }
  ],
  buildingArea: [
    { required: true, message: '请输入建筑面积', trigger: 'blur' },
    { type: 'number', min: 0, message: '建筑面积不能为负数', trigger: 'blur' }
  ],
  aboveGroundArea: [
    { required: true, message: '请输入地上面积', trigger: 'blur' },
    { type: 'number', min: 0, message: '地上面积不能为负数', trigger: 'blur' }
  ],
  undergroundArea: [
    { required: true, message: '请输入地下面积', trigger: 'blur' },
    { type: 'number', min: 0, message: '地下面积不能为负数', trigger: 'blur' }
  ],
  managedArea: [
    { required: true, message: '请输入在管面积', trigger: 'blur' },
    { type: 'number', min: 0, message: '在管面积不能为负数', trigger: 'blur' }
  ],
  propertyFee: [
    { required: true, message: '请输入物业费', trigger: 'blur' },
    { type: 'number', min: 0, message: '物业费不能为负数', trigger: 'blur' }
  ]
}

// 监听地上和地下楼层数变化，自动计算总层数
watch([
  () => buildingForm.aboveGroundFloors,
  () => buildingForm.undergroundFloors
], ([aboveFloors, underFloors]) => {
  buildingForm.floors = (aboveFloors || 0) + (underFloors || 0)
}, { immediate: true })

// 获取楼宇列表
const fetchBuildingList = async () => {
  try {
    tableLoading.value = true
    const response = await getBuildingList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchForm.name
    })
    if (response.data.code === 200) {
      buildingList.value = response.data.data
      pagination.total = response.data.total || response.data.data.length
    }
  } catch (error) {
    ElMessage.error('获取楼宇列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
        fetchBuildingList()
      }

// 重置搜索
const handleReset = () => {
  searchForm.name = ''
  pagination.currentPage = 1
        fetchBuildingList()
      }

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchBuildingList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchBuildingList()
}

// 新增楼宇
const handleAdd = () => {
  resetForm()
  isEditMode.value = false
  dialogVisible.value = true
}

// 编辑楼宇
const handleEdit = async (row: any) => {
  try {
    const response = await getBuildingDetail(row._id)
    if (response.data.code === 200) {
      Object.assign(buildingForm, response.data.data)
      isEditMode.value = true
      currentId.value = row._id
      dialogVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取楼宇详情失败')
  }
}

// 删除楼宇
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除楼宇"${row.name}"吗？删除后将无法恢复！`, 
      '删除确认', 
      {
        confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
      }
    )
    
    const response = await deleteBuilding(row._id)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchBuildingList()
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${selectedRows.value.length}个楼宇吗？删除后将无法恢复！`, 
      '批量删除确认', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里可以实现批量删除的API调用
    for (const row of selectedRows.value) {
      await deleteBuilding(row._id)
    }
    
    ElMessage.success('批量删除成功')
    fetchBuildingList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
}
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await buildingFormRef.value.validate()
    submitLoading.value = true
    
    if (isEditMode.value) {
      const response = await updateBuilding(currentId.value, buildingForm)
      if (response.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchBuildingList()
      } else {
        ElMessage.error(response.data.msg || '更新失败')
      }
    } else {
      const response = await addBuilding(buildingForm)
      if (response.data.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchBuildingList()
      } else {
        ElMessage.error(response.data.msg || '添加失败')
      }
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  buildingFormRef.value?.resetFields()
  Object.assign(buildingForm, {
    name: '',
    address: '',
    description: '',
    aboveGroundFloors: 1,
    undergroundFloors: 0,
    buildingArea: 0,
    aboveGroundArea: 0,
    undergroundArea: 0,
    managedArea: 0,
    propertyFee: 0,
    floors: 0 // 重置总层数
  })
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
  isEditMode.value = false
  currentId.value = ''
}

onMounted(() => {
  fetchBuildingList()
})
</script>

<style scoped>
.louyu-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  background: white;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-item label {
  color: #666;
  white-space: nowrap;
}

.search-actions {
  display: flex;
  gap: 10px;
}

.table-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-table) {
  border-radius: 4px 4px 0 0;
}

:deep(.el-table th) {
  background: #fafafa;
  color: #666;
  font-weight: 500;
}

:deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-button--text) {
  padding: 0;
  margin-right: 10px;
}

:deep(.el-button--text:last-child) {
  margin-right: 0;
}
</style>
