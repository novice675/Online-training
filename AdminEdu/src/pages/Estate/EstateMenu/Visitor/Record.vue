<template>
    <div class="visitor-record-container">
        <!-- 标题栏 -->
        <div class="header-area">
            <div class="title">
                <div class="title-bar"></div>
                <h2>访客进出记录</h2>
            </div>
            <div class="action-buttons">
                <el-button type="primary">导出</el-button>
                <el-button type="warning" :disabled="multipleSelection.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-area">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="访客姓名：">
                    <el-input v-model="searchForm.name" placeholder="请输入访客姓名" clearable />
                </el-form-item>
                <el-form-item label="联系方式：">
                    <el-input v-model="searchForm.contactWay" placeholder="请输入联系方式" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
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
                <el-table-column prop="name" label="访客姓名" align="center" />
                <el-table-column prop="contactWay" label="联系方式" align="center" />
                <el-table-column prop="visitType" label="造访类型" align="center" />
                <el-table-column prop="visitPlace" label="造访单位" align="center" />
                <el-table-column prop="visitTime" label="造访时间" align="center" />
                <el-table-column prop="direction" label="进出方向" align="center">
                    <template #default="{ row }">
                        <span :class="row.direction === '进场' ? 'in-direction' : 'out-direction'">
                            {{ row.direction }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="endTime" label="造访结束时间" align="center" />
                <el-table-column label="操作" width="100" align="center">
                    <template #default="{ row }">
                        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 分页区域 -->
        <div class="pagination-area">
            <div class="pagination-info">
                共 {{ total }} 条
            </div>
            <el-pagination
                v-model="currentPage"
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]"
                layout="sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
            <div class="pagination-goto">
                到第
                <el-input v-model="goToPage" class="page-input" />
                页
                <el-button size="small" @click="handleGoToPage">确定</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
    name: '',
    contactWay: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const multipleSelection = ref<any[]>([])
const goToPage = ref<number | string>('')

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
                visitTime: '2022-01-23',
                direction: '出场',
                endTime: '2022-01-23'
            },
            {
                id: '2',
                name: '李君虎',
                contactWay: '13208432854',
                visitType: '企业',
                visitPlace: '北京久软科技有限公司',
                visitTime: '2022-01-23',
                direction: '出场',
                endTime: '2022-01-23'
            },
            {
                id: '3',
                name: '李非非',
                contactWay: '18767256412',
                visitType: '企业',
                visitPlace: '北京皇居东西科技有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            },
            {
                id: '4',
                name: '张倩倩',
                contactWay: '13208432854',
                visitType: '企业',
                visitPlace: '北京皇居东西科技有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            },
            {
                id: '5',
                name: '洛佳',
                contactWay: '18767256412',
                visitType: '企业',
                visitPlace: '北京皇居东西科技有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            },
            {
                id: '6',
                name: '徐林',
                contactWay: '13208432854',
                visitType: '企业',
                visitPlace: '北京蚂云科技有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            },
            {
                id: '7',
                name: '张辉',
                contactWay: '18767256412',
                visitType: '企业',
                visitPlace: '北京蚂云科技有限公司',
                visitTime: '2022-01-23',
                direction: '出场',
                endTime: '2022-01-23'
            },
            {
                id: '8',
                name: '胡乐来',
                contactWay: '13208432854',
                visitType: '企业',
                visitPlace: '北京蚂云科技有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            },
            {
                id: '9',
                name: '缪贤身',
                contactWay: '18767256412',
                visitType: '企业',
                visitPlace: '北京弘毅投资管理有限公司',
                visitTime: '2022-01-23',
                direction: '出场',
                endTime: '2022-01-23'
            },
            {
                id: '10',
                name: '陆灵玉',
                contactWay: '13208432854',
                visitType: '企业',
                visitPlace: '北京弘毅投资管理有限公司',
                visitTime: '2022-01-23',
                direction: '进场',
                endTime: '2022-01-23'
            }
        ]
        loading.value = false
    }, 500)
}

// 表格多选
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
}

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1
    fetchData()
}

// 重置搜索
const resetSearch = () => {
    searchForm.name = ''
    searchForm.contactWay = ''
    handleSearch()
}

// 删除记录
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

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    fetchData()
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchData()
}

// 跳转到指定页
const handleGoToPage = () => {
    if (!goToPage.value) return
    
    const page = Number(goToPage.value)
    if (isNaN(page) || page < 1 || page > Math.ceil(total.value / pageSize.value)) {
        ElMessage.warning('请输入有效的页码')
        return
    }
    
    currentPage.value = page
    fetchData()
}
</script>

<style scoped>
.visitor-record-container {
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
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}

.pagination-goto {
    display: flex;
    align-items: center;
}

.page-input {
    width: 50px;
    margin: 0 5px;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
}

:deep(.el-form-item) {
    margin-right: 20px;
}

.in-direction {
    color: #67c23a;
}

.out-direction {
    color: #f56c6c;
}
</style>