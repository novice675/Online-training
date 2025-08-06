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
                <el-button type="warning" :disabled="multipleSelection.length === 0"
                    @click="handleBatchDelete">批量删除</el-button>
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-area">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <div class="search-inputs">
                    <el-form-item label="访客姓名：">
                        <el-input v-model="searchForm.name" placeholder="请输入访客姓名" clearable />
                    </el-form-item>
                    <el-form-item label="联系方式：">
                        <el-input v-model="searchForm.phone" placeholder="请输入联系方式" clearable />
                    </el-form-item>
                </div>
                <div class="search-buttons">
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">查询</el-button>
                        <el-button @click="resetSearch">重置</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>

        <!-- 表格区域 -->
        <div class="table-area">
            <el-table :data="tableData" border stripe style="width: 100%" v-loading="loading"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="访客姓名" align="center" width="120" />
                <el-table-column prop="phone" label="联系方式" align="center" width="130" />
                <el-table-column prop="visitType" label="造访类型" align="center" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.visitType === '企业' ? 'success' : row.visitType === '公寓' ? 'warning' : 'info'">
                            {{ row.visitType || '企业' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="companyName" label="造访单位" align="center" min-width="150" />
                <el-table-column prop="time" label="造访时间" align="center" width="160">
                    <template #default="{ row }">
                        <span>{{ formatDateTime(row.time) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="direction" label="进出方向" align="center" width="90">
                    <template #default>
                        <span class="in-direction">
                            进场
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="time" label="造访结束时间" align="center" width="160">
                    <template #default="{ row }">
                        <span>{{ formatDateTime(row.time) }}</span>
                    </template>
                </el-table-column>
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
                共 {{ total }} 条记录，当前第 {{ currentPage }} 页
            </div>
            <el-pagination v-model="currentPage" :current-page="currentPage" :page-size="pageSize"
                :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" background />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from "axios"

// 搜索表单
const searchForm = reactive({
    name: '',
    phone: ''
})

// 表格数据
const tableData = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const multipleSelection = ref<any[]>([])

// 生命周期钩子
onMounted(() => {
    fetchData()
})

// 格式化日期时间
const formatDateTime = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-CN')
}

// 获取表格数据 - 使用与Info.vue相同的接口
const fetchData = async () => {
    loading.value = true
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            name: searchForm.name,
            phone: searchForm.phone
        }

        // 使用与Info.vue相同的接口地址
        const response = await axios.get('/WYQ/visitor/list', { params })

        if (response.data.code === 200) {
            tableData.value = response.data.data.list
            total.value = response.data.data.total
        } else {
            ElMessage.error(response.data.msg || '获取数据失败')
        }
    } catch (error) {
        ElMessage.error('获取数据失败')
    } finally {
        loading.value = false
    }
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
    searchForm.phone = ''
    handleSearch()
}

// 删除记录
const handleDelete = async (row: any) => {
    ElMessageBox.confirm('确认删除该访客记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const response = await axios.delete(`/WYQ/visitor/delete/${row._id}`)

            if (response.data.code === 200) {
                ElMessage.success('删除成功')
                fetchData()
            } else {
                ElMessage.error(response.data.msg || '删除失败')
            }
        } catch (error) {
            ElMessage.error('删除失败')
        }
    }).catch(() => { })
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
    }).then(async () => {
        try {
            const ids = multipleSelection.value.map(item => item._id)
            const response = await axios.delete('/WYQ/visitor/batchDelete', {
                data: { ids }
            })

            if (response.data.code === 200) {
                ElMessage.success('批量删除成功')
                fetchData()
            } else {
                ElMessage.error(response.data.msg || '批量删除失败')
            }
        } catch (error) {
            ElMessage.error('批量删除失败')
        }
    }).catch(() => { })
}

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
    fetchData()
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    fetchData()
}
</script>

<style scoped>
.visitor-record-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.header-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-shrink: 0;
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
    flex-shrink: 0;
}

.table-area {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.table-area :deep(.el-table) {
    flex: 1;
}

.pagination-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 15px 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
}

.pagination-info {
    font-size: 14px;
    color: #666;
}

.pagination-goto {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #666;
}

.page-input {
    width: 50px;
    margin: 0 5px;
}

.search-form {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
}

.search-inputs {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
}

.search-buttons {
    display: flex;
    flex-shrink: 0;
}

.in-direction {
    color: #67c23a;
    font-weight: 500;
}

.out-direction {
    color: #f56c6c;
    font-weight: 500;
}

:deep(.el-form-item) {
    margin-right: 20px;
}

:deep(.el-pagination) {
    --el-pagination-font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .visitor-record-container {
        padding: 15px;
    }

    .pagination-area {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .pagination-goto {
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .visitor-record-container {
        padding: 10px;
    }

    .header-area {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .search-area,
    .table-area,
    .pagination-area {
        padding: 15px;
    }

    .search-form {
        flex-direction: column;
        gap: 15px;
    }

    .search-inputs {
        width: 100%;
    }

    .search-buttons {
        justify-content: flex-end;
        width: 100%;
    }
}
</style>
