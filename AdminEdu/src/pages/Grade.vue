<template>
    <div class="grade-container">
        <div class="header">
        <h2>成绩管理</h2>
            <div class="actions">
                <el-button type="primary" @click="handleAdd">
                    <el-icon><Plus /></el-icon>添加成绩
                </el-button>
                <el-button type="success" @click="handleExport">
                    <el-icon><Download /></el-icon>导出成绩
                </el-button>
            </div>
        </div>

        <div class="search-bar">
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="学生姓名">
                    <el-input v-model="searchForm.studentName" placeholder="请输入学生姓名" clearable />
                </el-form-item>
                <el-form-item label="课程">
                    <el-select v-model="searchForm.course" placeholder="请选择课程" clearable>
                        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="成绩范围">
                    <el-input-number v-model="searchForm.minScore" :min="0" :max="100" placeholder="最低分" />
                    <span class="separator">-</span>
                    <el-input-number v-model="searchForm.maxScore" :min="0" :max="100" placeholder="最高分" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon><Refresh /></el-icon>重置
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table :data="tableData" border style="width: 100%" v-loading="loading">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="studentName" label="学生姓名" min-width="100" />
            <el-table-column prop="studentId" label="学号" min-width="120" />
            <el-table-column prop="course" label="课程" min-width="120" />
            <el-table-column prop="score" label="成绩" min-width="100">
                <template #default="{ row }">
                    <span :class="getScoreClass(row.score)">{{ row.score }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="examDate" label="考试日期" min-width="120" />
            <el-table-column prop="teacher" label="任课教师" min-width="100" />
            <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                    <el-button type="primary" link @click="handleEdit(row)">
                        <el-icon><Edit /></el-icon>编辑
                    </el-button>
                    <el-button type="danger" link @click="handleDelete(row)">
                        <el-icon><Delete /></el-icon>删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="pagination">
            <el-pagination
                :current-page="currentPage"
                :page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>

        <!-- 添加/编辑成绩对话框 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogType === 'add' ? '添加成绩' : '编辑成绩'"
            width="500px"
            destroy-on-close
        >
            <el-form
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="100px"
                class="grade-form"
            >
                <el-form-item label="学生姓名" prop="studentName">
                    <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
                </el-form-item>
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="form.studentId" placeholder="请输入学号" />
                </el-form-item>
                <el-form-item label="课程" prop="course">
                    <el-select v-model="form.course" placeholder="请选择课程" style="width: 100%">
                        <el-option v-for="item in courseOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="成绩" prop="score">
                    <el-input-number v-model="form.score" :min="0" :max="100" style="width: 100%" />
                </el-form-item>
                <el-form-item label="考试日期" prop="examDate">
                    <el-date-picker
                        v-model="form.examDate"
                        type="date"
                        placeholder="选择日期"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="任课教师" prop="teacher">
                    <el-input v-model="form.teacher" placeholder="请输入任课教师" />
                </el-form-item>
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

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

// 搜索表单
interface SearchForm {
    studentName: string;
    course: string;
    minScore: number | null;
    maxScore: number | null;
    [key: string]: string | number | null;
}

const searchForm = reactive<SearchForm>({
    studentName: '',
    course: '',
    minScore: null,
    maxScore: null
})

// 课程选项
const courseOptions = [
    { value: '', label: '全部' },
    { value: 'math', label: '数学' },
    { value: 'english', label: '英语' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' }
]

// 表格数据
const loading = ref(false)
const tableData = ref([
    {
        studentName: '张三',
        studentId: '2024001',
        course: '数学',
        score: 85,
        examDate: '2024-03-15',
        teacher: '李老师'
    },
    {
        studentName: '李四',
        studentId: '2024002',
        course: '英语',
        score: 92,
        examDate: '2024-03-15',
        teacher: '王老师'
    }
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()

// 表单数据
interface GradeForm {
    studentName: string;
    studentId: string;
    course: string;
    score: number | null;
    examDate: string;
    teacher: string;
    [key: string]: string | number | null;
}

const form = reactive<GradeForm>({
    studentName: '',
    studentId: '',
    course: '',
    score: null,
    examDate: '',
    teacher: ''
})

// 表单验证规则
const rules = {
    studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
    studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
    course: [{ required: true, message: '请选择课程', trigger: 'change' }],
    score: [{ required: true, message: '请输入成绩', trigger: 'blur' }],
    examDate: [{ required: true, message: '请选择考试日期', trigger: 'change' }],
    teacher: [{ required: true, message: '请输入任课教师', trigger: 'blur' }]
}

// 获取成绩样式
const getScoreClass = (score: number) => {
    if (score >= 90) return 'score-excellent'
    if (score >= 80) return 'score-good'
    if (score >= 60) return 'score-pass'
    return 'score-fail'
}

// 搜索
const handleSearch = () => {
    // 实现搜索逻辑
    console.log('搜索条件：', searchForm)
}

// 重置搜索
const resetSearch = () => {
    Object.keys(searchForm).forEach(key => {
        searchForm[key] = ''
    })
    handleSearch()
}

// 添加成绩
const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
    Object.keys(form).forEach(key => {
        form[key] = ''
    })
}

// 编辑成绩
const handleEdit = (row: any) => {
    dialogType.value = 'edit'
    dialogVisible.value = true
    Object.keys(form).forEach(key => {
        form[key] = row[key]
    })
}

// 删除成绩
const handleDelete = (row: any) => {
    ElMessageBox.confirm('确定要删除该成绩记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 实现删除逻辑
        ElMessage.success('删除成功')
    })
}

// 导出成绩
const handleExport = () => {
    // 实现导出逻辑
    ElMessage.success('导出成功')
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid: boolean) => {
        if (valid) {
            // 实现提交逻辑
            ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
            dialogVisible.value = false
        }
    })
}

// 分页处理
const handleSizeChange = (val: number) => {
    pageSize.value = val
    // 重新加载数据
}

const handleCurrentChange = (val: number) => {
    currentPage.value = val
    // 重新加载数据
}
</script>

<style scoped>
.grade-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 20px;
    color: #303133;
}

.actions {
    display: flex;
    gap: 10px;
}

.search-bar {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.separator {
    margin: 0 8px;
    color: #909399;
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.grade-form {
    padding: 20px 0;
}

/* 成绩样式 */
.score-excellent {
    color: #67c23a;
    font-weight: bold;
}

.score-good {
    color: #409eff;
    font-weight: bold;
}

.score-pass {
    color: #e6a23c;
    font-weight: bold;
}

.score-fail {
    color: #f56c6c;
    font-weight: bold;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .search-form {
        flex-direction: column;
    }

    .el-form-item {
        margin-right: 0;
        width: 100%;
    }
}
</style> 