<template>
  <div class="people-page">
    <TableLayout
      title="访客信息登记"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 操作按钮区域 -->
      <template #actions>
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="warning" @click="handleBatchDelete" :disabled="multipleSelection.length === 0">
          批量删除
        </el-button>
      </template>

      <!-- 搜索区域 -->
      <template #search>
        <el-form :inline="true" :model="from" class="search-form">
          <el-form-item label="访客姓名：">
            <el-input v-model="from.name" placeholder="请输入访客姓名" clearable />
          </el-form-item>
          <el-form-item label="访客类型：">
            <el-select v-model="from.visitType" placeholder="请选择" clearable>
              <el-option label="企业" value="企业" />
              <el-option label="个人" value="个人" />
              <el-option label="政府" value="政府" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系方式：">
            <el-input v-model="from.contactWay" placeholder="请输入联系方式" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="show">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- 表格区域 -->
      <template #table>
        <el-table 
          :data="tableData" 
          border 
          stripe 
          style="width: 100%" 
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="访客姓名" align="center" />
          <el-table-column prop="contactWay" label="联系方式" align="center" />
          <el-table-column prop="visitType" label="访客类型" align="center" />
          <el-table-column prop="visitPlace" label="造访单位" align="center" />
          <el-table-column prop="visitTime" label="造访时间" align="center" />
          <el-table-column prop="carCode" label="车牌号" align="center" />
          <el-table-column prop="carType" label="车辆类型" align="center" />
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row, $index }">
              <el-button link type="primary" @click="handleView(row)">详情</el-button>
              <el-button link type="danger" @click="handleDelete(row, $index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </TableLayout>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="访客姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入访客姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系方式" prop="contactWay">
              <el-input v-model="form.contactWay" placeholder="请输入联系方式" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="访客类型" prop="visitType">
              <el-select v-model="form.visitType" placeholder="请选择访客类型" style="width: 100%">
                <el-option label="企业" value="企业" />
                <el-option label="个人" value="个人" />
                <el-option label="政府" value="政府" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="造访单位" prop="visitPlace">
              <el-input v-model="form.visitPlace" placeholder="请输入造访单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="造访时间" prop="visitTime">
              <el-date-picker
                v-model="form.visitTime"
                type="datetime"
                placeholder="选择日期时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车牌号" prop="carCode">
              <el-input v-model="form.carCode" placeholder="请输入车牌号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="carType">
              <el-select v-model="form.carType" placeholder="请选择车辆类型" style="width: 100%">
                <el-option label="轿车" value="轿车" />
                <el-option label="SUV" value="SUV" />
                <el-option label="面包车" value="面包车" />
                <el-option label="货车" value="货车" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TableLayout from '@/components/TableLayout.vue'

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const multipleSelection = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增访客')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const from = reactive({
  name: '',
  visitType: '',
  contactWay: ''
})

// 编辑表单
const form = reactive({
  name: '',
  contactWay: '',
  visitType: '',
  visitPlace: '',
  visitTime: '',
  carCode: '',
  carType: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入访客姓名', trigger: 'blur' }],
  contactWay: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  visitType: [{ required: true, message: '请选择访客类型', trigger: 'change' }],
  visitPlace: [{ required: true, message: '请输入造访单位', trigger: 'blur' }]
}

const formRef = ref()

// 模拟数据
const mockData = [
  {
    id: 1,
    name: '张三',
    contactWay: '13800138001',
    visitType: '企业',
    visitPlace: '科技公司',
    visitTime: '2024-01-15 09:30',
    carCode: '京A12345',
    carType: '轿车'
  },
  {
    id: 2,
    name: '李四',
    contactWay: '13800138002',
    visitType: '个人',
    visitPlace: '人事部',
    visitTime: '2024-01-15 10:15',
    carCode: '京B67890',
    carType: 'SUV'
  },
  {
    id: 3,
    name: '王五',
    contactWay: '13800138003',
    visitType: '政府',
    visitPlace: '财务部',
    visitTime: '2024-01-15 14:20',
    carCode: '',
    carType: ''
  }
]

// 方法定义
const show = () => {
  loading.value = true
  // 模拟API请求
  setTimeout(() => {
    const filteredData = mockData.filter(item => {
      return (!from.name || item.name.includes(from.name)) &&
             (!from.visitType || item.visitType === from.visitType) &&
             (!from.contactWay || item.contactWay.includes(from.contactWay))
    })
    
    tableData.value = filteredData
    total.value = filteredData.length
    loading.value = false
  }, 500)
}

const resetSearch = () => {
  Object.assign(from, {
    name: '',
    visitType: '',
    contactWay: ''
  })
  show()
}

const handleAdd = () => {
  dialogTitle.value = '新增访客'
  Object.assign(form, {
    name: '',
    contactWay: '',
    visitType: '',
    visitPlace: '',
    visitTime: '',
    carCode: '',
    carType: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info(`查看访客：${row.name}`)
}

const handleDelete = (row, index) => {
  ElMessageBox.confirm('确定删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.splice(index, 1)
    total.value = tableData.value.length
    ElMessage.success('删除成功')
  })
}

const handleBatchDelete = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请选择要删除的记录')
    return
  }
  
  ElMessageBox.confirm(`确定删除选中的 ${multipleSelection.value.length} 条记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟批量删除
    multipleSelection.value.forEach(item => {
      const index = tableData.value.findIndex(data => data.id === item.id)
      if (index > -1) {
        tableData.value.splice(index, 1)
      }
    })
    total.value = tableData.value.length
    multipleSelection.value = []
    ElMessage.success('批量删除成功')
  })
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 模拟提交
      const newRecord = { ...form, id: Date.now() }
      tableData.value.unshift(newRecord)
      total.value = tableData.value.length
      dialogVisible.value = false
      ElMessage.success('操作成功')
    }
  })
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  show()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  show()
}

// 生命周期
onMounted(() => {
  show()
})
</script>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-form-item) {
  margin-right: 20px;
  margin-bottom: 15px;
}
</style>