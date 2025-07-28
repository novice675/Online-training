<template>
    <div class="student-container">
        <div class="action-bar">
            <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>添加学生
            </el-button>
            <el-button type="warning" @click="handleEdit">
                <el-icon><Edit /></el-icon>修改信息
            </el-button>
            <el-button type="danger" @click="handleDelete">
                <el-icon><Delete /></el-icon>删除学生
            </el-button>
        </div>

        <div class="content">
            <el-table :data="studentList" style="width: 100%" border>
                <el-table-column type="selection" width="55" />
                <el-table-column prop="id" label="学号" width="120" />
                <el-table-column prop="name" label="姓名" width="120" />
                <el-table-column prop="gender" label="性别" width="80" />
                <el-table-column prop="age" label="年龄" width="80" />
                <el-table-column prop="class" label="班级" width="120" />
                <el-table-column prop="phone" label="联系电话" width="150" />
                <el-table-column prop="email" label="邮箱" width="200" />
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === '在读' ? 'success' : 'info'">
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="150">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleView(row)">查看</el-button>
                        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 模拟数据
const generateStudentData = () => {
    return Array.from({ length: 100 }, (_, index) => ({
        id: `2024${String(index + 1).padStart(4, '0')}`,
        name: `学生${index + 1}`,
        gender: index % 2 === 0 ? '男' : '女',
        age: 18 + (index % 5),
        class: `计算机${Math.floor(index / 30) + 1}班`,
        phone: `1${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
        email: `student${index + 1}@example.com`,
        status: index % 10 === 0 ? '休学' : '在读'
    }));
};

const studentList = ref(generateStudentData());
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(100);

// 处理函数
const handleAdd = () => {
    ElMessage.info('添加学生功能待实现');
};

const handleEdit = (row?: any) => {
    ElMessage.info('修改学生信息功能待实现');
};

const handleDelete = () => {
    ElMessage.info('删除学生功能待实现');
};

const handleView = (row: any) => {
    ElMessage.info('查看学生详情功能待实现');
};

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    // 这里应该重新获取数据
};

const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    // 这里应该重新获取数据
};
</script>

<style scoped>
.student-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
}

.content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-button) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
</style> 