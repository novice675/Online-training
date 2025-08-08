<template>
  <div class="ziyuan-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2>房间信息管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="warning" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <label>房间号：</label>
        <el-input 
          v-model="searchForm.number" 
          placeholder="请输入房间号" 
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
        :data="roomList" 
        style="width: 100%" 
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="number" label="房间号" min-width="100" />
        <el-table-column label="楼宇名称" min-width="120">
          <template #default="scope">
            {{ scope.row.buildingId?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="楼层" min-width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.floor > 0" type="success">
              {{ scope.row.floor }}层
            </el-tag>
            <el-tag v-else type="warning">
              地下{{ Math.abs(scope.row.floor) }}层
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="面积(㎡)" min-width="100">
          <template #default="scope">
            {{ scope.row.area || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rent" label="租金(元/月)" min-width="120">
          <template #default="scope">
            {{ scope.row.rent || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80">
          <template #default="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.status)"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row._id)">删除</el-button>
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
      :title="isEditMode ? '编辑房间' : '新增房间'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="houseFormRef" 
        :model="houseForm" 
        :rules="houseRules" 
        label-width="100px"
      >
        <el-form-item label="所属楼宇" prop="buildingId">
          <el-select 
            v-model="houseForm.buildingId" 
            placeholder="请选择楼宇"
            style="width: 100%"
            @change="handleBuildingChange"
          >
            <el-option
              v-for="building in buildingList"
              :key="building._id"
              :label="building.name"
              :value="building._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-select 
            v-model="houseForm.floor" 
            placeholder="请选择楼层"
            style="width: 100%"
            :disabled="!houseForm.buildingId"
          >
            <el-option
              v-for="floor in availableFloors"
              :key="floor.value"
              :label="floor.label"
              :value="floor.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号" prop="number">
          <el-input v-model="houseForm.number" placeholder="请输入房间号" />
        </el-form-item>
        <el-form-item label="面积(㎡)" prop="area">
          <el-input-number 
            v-model="houseForm.area" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计价面积(㎡)" prop="pricingArea">
          <el-input-number 
            v-model="houseForm.pricingArea" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="租金(元/月)" prop="rent">
          <el-input-number 
            v-model="houseForm.rent" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="物业费(元/月)" prop="propertyFee">
          <el-input-number 
            v-model="houseForm.propertyFee" 
            :min="0" 
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="房间状态" prop="status">
          <el-select v-model="houseForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="空闲" value="空闲" />
            <el-option label="已租" value="已租" />
            <el-option label="维修" value="维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间描述" prop="description">
          <el-input 
            v-model="houseForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入房间描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getBuildingList,
  getHouseList, 
  addHouse, 
  updateHouse, 
  deleteHouse,
  getBuildingFloors
} from '../../../api/auth.js'

const houseFormRef = ref()
const roomList = ref([])
const buildingList = ref([])
const buildingOptions = ref([])
const selectedRows = ref([])
const tableLoading = ref(false)
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editingId = ref('')
const submitLoading = ref(false)
const availableFloors = ref([])

  // 搜索表单
  const searchForm = reactive({
    number: ''
  })

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 房间表单数据
const houseForm = reactive({
  buildingId: '',
  floor: null,
        number: '',
      area: 0,
      pricingArea: 0,
      rent: 0,
      propertyFee: 0,
      status: '空闲',
      description: ''
})

// 房间表单验证规则
const houseRules = {
  buildingId: [{ required: true, message: '请选择楼宇', trigger: 'change' }],
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
      number: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
    area: [{ required: true, message: '请输入房间面积', trigger: 'blur' }],
    pricingArea: [{ required: true, message: '请输入计价面积', trigger: 'blur' }],
    rent: [{ required: true, message: '请输入租金', trigger: 'blur' }],
    propertyFee: [{ required: true, message: '请输入物业费', trigger: 'blur' }],
    status: [{ required: true, message: '请选择房间状态', trigger: 'change' }]
}



// 获取楼层标签类型
const getFloorTagType = (floor: number) => {
  if (floor > 0) return 'success'
  if (floor < 0) return 'info'
  return ''
}

// 获取楼层文本
const getFloorText = (floor: number) => {
  if (floor > 0) return `${floor}层`
  if (floor < 0) return `地下${Math.abs(floor)}层`
  return '-'
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case '空闲': return 'success'
    case '已租': return 'danger'
    case '维修': return 'warning'
    default: return ''
  }
}

// 获取楼宇列表
const fetchBuildingList = async () => {
  try {
    const response = await getBuildingList()
    if (response.data.code === 200) {
      buildingList.value = response.data.data
      buildingOptions.value = response.data.data.map((item: any) => ({
        _id: item._id,
        name: item.name
      }))
    }
  } catch (error) {
    ElMessage.error('获取楼宇列表失败')
  }
}

// 获取房间列表
const fetchHouseList = async () => {
  try {
    tableLoading.value = true
          const response = await getHouseList({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        number: searchForm.number
      })
    if (response.data.code === 200) {
      roomList.value = response.data.data
      pagination.total = response.data.total || response.data.data.length
    }
  } catch (error) {
    ElMessage.error('获取房间列表失败')
  } finally {
    tableLoading.value = false
  }
}

// 获取楼层信息
const fetchBuildingFloors = async (buildingId: string) => {
  try {
    const response = await getBuildingFloors(buildingId)
    if (response.data.code === 200) {
      return response.data.data.floors || []
    }
  } catch (error) {
    console.error('获取楼层信息失败:', error)
  }
  return []
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchHouseList()
}

// 重置搜索
const handleReset = () => {
  searchForm.number = ''
  pagination.currentPage = 1
  fetchHouseList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.currentPage = 1
  fetchHouseList()
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchHouseList()
}

// 新增房间
const handleAdd = () => {
  resetForm()
  isEditMode.value = false
  dialogVisible.value = true
}

// 编辑房间
const handleEdit = async (row: any) => {
  try {
    Object.assign(houseForm, {
      buildingId: row.buildingId?._id || '',
      floor: row.floor,
              number: row.number,
        area: row.area,
        pricingArea: row.pricingArea,
        rent: row.rent,
        propertyFee: row.propertyFee,
        status: row.status,
        description: row.description
    })
    
    // 获取楼层信息
    if (houseForm.buildingId) {
      availableFloors.value = await fetchBuildingFloors(houseForm.buildingId)
    }
    
    isEditMode.value = true
    editingId.value = row._id
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取房间详情失败')
  }
}

// 删除房间
const handleDelete = async (rowId: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除房间吗？删除后将无法恢复！`, 
      '删除确认', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteHouse(rowId)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchHouseList()
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
      `确定要删除选中的${selectedRows.value.length}个房间吗？删除后将无法恢复！`, 
      '批量删除确认', 
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    for (const row of selectedRows.value) {
      await deleteHouse(row._id)
    }
    
    ElMessage.success('批量删除成功')
    fetchHouseList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 楼宇变化处理
const handleBuildingChange = async (buildingId: string) => {
  houseForm.floor = null
  if (buildingId) {
    availableFloors.value = await fetchBuildingFloors(buildingId)
  } else {
    availableFloors.value = []
  }
}

// 提交表单
const handleSave = async () => {
  try {
    await houseFormRef.value.validate()
    submitLoading.value = true
    
    if (isEditMode.value) {
      const response = await updateHouse(editingId.value, houseForm)
      if (response.data.code === 200) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchHouseList()
      } else {
        ElMessage.error(response.data.msg || '更新失败')
      }
    } else {
      const response = await addHouse(houseForm)
      if (response.data.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchHouseList()
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
  houseFormRef.value?.resetFields()
  Object.assign(houseForm, {
    buildingId: '',
    floor: null,
    number: '',
    area: 0,
    pricingArea: 0,
    rent: 0,
    propertyFee: 0,
    status: '空闲',
    description: ''
  })
  availableFloors.value = []
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
  isEditMode.value = false
  editingId.value = ''
}

onMounted(() => {
  fetchBuildingList()
  fetchHouseList()
})
</script>

<style scoped>
.ziyuan-container {
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
  flex-wrap: wrap;
  gap: 15px;
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
