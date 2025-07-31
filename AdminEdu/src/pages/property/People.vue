<template>
    <div class="people-container">
        <!-- 顶部标题和按钮区域 -->
        <div class="header-area">
            <div class="title">
                <div class="title-bar"></div>
                <h2>访客信息登记</h2>
            </div>
            <div class="action-buttons">
                <el-button type="primary" @click="handleAdd">新增</el-button>
                <el-button type="warning" @click="handleBatchDelete" :disabled="multipleSelection.length === 0">批量删除</el-button>
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-area">
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
        </div>

        <!-- 表格区域 -->
        <div class="table-area">
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
                <el-table-column prop="visitType" label="造访类型" align="center" />
                <el-table-column prop="visitPlace" label="造访单位" align="center" />
                <el-table-column prop="hasCar" label="是否驾车" align="center">
                    <template #default="{ row }">
                        {{ row.hasCar === '是' ? '是' : '否' }}
                    </template>
                </el-table-column>
                <el-table-column prop="carNumber" label="车牌号码" align="center" />
                <el-table-column prop="visitEndTime" label="造访结束时间" align="center" />
                <el-table-column label="操作" width="150" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" @click="handleDetail(row)">详情</el-button>
                        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="pagination-area">
            <el-pagination
                v-model="currentPage"
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- 访客信息对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '新增访客' : '编辑访客'"
            width="600px"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="visitorForm"
                :rules="rules"
                label-width="100px"
                label-position="right"
            >
                <el-form-item label="访客姓名" prop="name">
                    <el-input v-model="visitorForm.name" placeholder="请输入访客姓名" />
                </el-form-item>
                <el-form-item label="联系方式" prop="contactWay">
                    <el-input v-model="visitorForm.contactWay" placeholder="请输入联系方式" />
                </el-form-item>
                <el-form-item label="造访类型" prop="visitType">
                    <el-select v-model="visitorForm.visitType" placeholder="请选择造访类型">
                        <el-option label="企业" value="企业" />
                        <el-option label="个人" value="个人" />
                        <el-option label="政府" value="政府" />
                    </el-select>
                </el-form-item>
                <el-form-item label="造访单位" prop="visitPlace">
                    <el-input v-model="visitorForm.visitPlace" placeholder="请输入造访单位" />
                </el-form-item>
                <el-form-item label="是否驾车" prop="hasCar">
                    <el-radio-group v-model="visitorForm.hasCar">
                        <el-radio label="是">是</el-radio>
                        <el-radio label="否">否</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="车牌号码" prop="carNumber" v-if="visitorForm.hasCar === '是'">
                    <el-input v-model="visitorForm.carNumber" placeholder="请输入车牌号码" />
                </el-form-item>
                <el-form-item label="造访开始时间" prop="visitStartTime">
                    <el-date-picker
                        v-model="visitorForm.visitStartTime"
                        type="datetime"
                        placeholder="选择造访开始时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </el-form-item>
                <el-form-item label="造访结束时间" prop="visitEndTime">
                    <el-date-picker
                        v-model="visitorForm.visitEndTime"
                        type="datetime"
                        placeholder="选择造访结束时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'

// 搜索表单
const from = reactive({
    name: '',
    contactWay: '',
    visitType: '',
    visitDate: [] as string[]
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(0)
const multipleSelection = ref<any[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const visitorForm = reactive({
    id: '',
    name: '',
    contactWay: '',
    visitType: '企业',
    visitPlace: '',
    hasCar: '否',
    carNumber: '',
    visitStartTime: '',
    visitEndTime: ''
})

// 表单验证规则
const rules = {
    name: [{ required: true, message: '请输入访客姓名', trigger: 'blur' }],
    contactWay: [
        { required: true, message: '请输入联系方式', trigger: 'blur' }
    ],
    visitType: [{ required: true, message: '请选择造访类型', trigger: 'change' }],
    visitPlace: [{ required: true, message: '请输入造访单位', trigger: 'blur' }],
    hasCar: [{ required: true, message: '请选择是否驾车', trigger: 'change' }],
    carNumber: [{ required: visitorForm.hasCar === '是', message: '请输入车牌号码', trigger: 'blur' }],
    visitStartTime: [{ required: true, message: '请选择造访开始时间', trigger: 'change' }],
    visitEndTime: [{ required: true, message: '请选择造访结束时间', trigger: 'change' }]
}

// 生命周期钩子
onMounted(() => {
    fetchData()
})

// 获取表格数据
const fetchData = () => {
    loading.value = true
    // 模拟异步请求
    setTimeout(() => {
        // 这里应该是实际的API调用
        tableData.value = [
            {
                id: '1',
                name: '张旭',
                contactWay: '18767256412',
                visitType: '企业',
                visitPlace: '北京久软科技有限公司',
                hasCar: '是',
                carNumber: '陕G12345',
                visitStartTime: '2022-01-23 09:00:00',
                visitEndTime: '2022-01-23 18:00:00'
            },
            {
                id: '2',
                name: '李明',
                contactWay: '13912345678',
                visitType: '个人',
                visitPlace: '财务部',
                hasCar: '否',
                carNumber: '',
                visitStartTime: '2022-01-24 10:30:00',
                visitEndTime: '2022-01-24 11:30:00'
            },
            {
                id: '3',
                name: '王芳',
                contactWay: '15887654321',
                visitType: '政府',
                visitPlace: '人力资源部',
                hasCar: '是',
                carNumber: '京A88888',
                visitStartTime: '2022-01-25 14:00:00',
                visitEndTime: '2022-01-25 16:00:00'
            }
        ]
        total.value = 3
        loading.value = false
    }, 500)
}

// 表格多选
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
}

// 搜索处理
const show = () => {
    currentPage.value = 1
    fetchData()
}

// 重置搜索
const resetSearch = () => {
    from.name = ''
    from.contactWay = ''
    from.visitType = ''
    from.visitDate = []
    show()
}

// 新增访客
const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
    // 重置表单
    Object.assign(visitorForm, {
        id: '',
        name: '',
        contactWay: '',
        visitType: '企业',
        visitPlace: '',
        hasCar: '否',
        carNumber: '',
        visitStartTime: '',
        visitEndTime: ''
    })
}

// 查看详情
const handleDetail = (row: any) => {
    dialogType.value = 'edit'
    dialogVisible.value = true
    // 填充表单
    Object.assign(visitorForm, { ...row })
}

// 删除访客
const handleDelete = (row: any) => {
    ElMessageBox.confirm('确认删除该访客记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 这里应该是实际的删除API调用
        ElMessage.success('删除成功')
        fetchData()
    }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请至少选择一条记录')
        return
    }
    
    ElMessageBox.confirm(`确认删除选中的 ${multipleSelection.value.length} 条记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 这里应该是实际的批量删除API调用
        ElMessage.success('批量删除成功')
        fetchData()
    }).catch(() => {})
}

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate((valid) => {
        if (valid) {
            // 这里应该是实际的API调用
            if (dialogType.value === 'add') {
                ElMessage.success('新增成功')
            } else {
                ElMessage.success('编辑成功')
            }
            dialogVisible.value = false
            fetchData()
        }
    })
}

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchData()
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchData()
}
</script>

<style scoped>
.people-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px);
}

.header-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
}

.search-area {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.table-area {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.pagination-area {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
}

:deep(.el-form-item) {
    margin-right: 20px;
}

:deep(.el-date-editor--daterange) {
    width: 260px;
}
</style>