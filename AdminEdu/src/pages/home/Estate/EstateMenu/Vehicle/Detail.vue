<template>
    <div class="homework-detail">
        <div class="header">
            <h2>作业详情</h2>
            <div class="actions">
                <el-button type="primary" @click="handleSubmit" v-if="isStudent">
                    <el-icon><Upload /></el-icon>提交作业
                </el-button>
                <el-button type="success" @click="handleGrade" v-if="isTeacher">
                    <el-icon><Check /></el-icon>批改作业
                </el-button>
            </div>
        </div>

        <div class="content">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="作业标题">{{ homework.title }}</el-descriptions-item>
                <el-descriptions-item label="发布教师">{{ homework.teacher }}</el-descriptions-item>
                <el-descriptions-item label="发布时间">{{ homework.publishTime }}</el-descriptions-item>
                <el-descriptions-item label="截止时间">{{ homework.deadline }}</el-descriptions-item>
                <el-descriptions-item label="作业状态">
                    <el-tag :type="homework.status === '已提交' ? 'success' : 'warning'">
                        {{ homework.status }}
                    </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="得分" v-if="homework.score">
                    {{ homework.score }}
                </el-descriptions-item>
            </el-descriptions>

            <div class="description">
                <h3>作业要求</h3>
                <div class="text">{{ homework.description }}</div>
            </div>

            <div class="submission" v-if="homework.submission">
                <h3>提交内容</h3>
                <div class="text">{{ homework.submission }}</div>
                <div class="submit-time">提交时间：{{ homework.submitTime }}</div>
            </div>

            <div class="feedback" v-if="homework.feedback">
                <h3>教师评语</h3>
                <div class="text">{{ homework.feedback }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Upload, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const homeworkId = route.params.id;

// 模拟用户角色
const isStudent = ref(true);
const isTeacher = ref(false);

// 模拟作业数据
const homework = ref({
    title: 'Vue3 组件开发实践',
    teacher: '张老师',
    publishTime: '2024-03-15 10:00:00',
    deadline: '2024-03-20 23:59:59',
    status: '已提交',
    score: 95,
    description: `请完成以下任务：
1. 使用 Vue3 组合式 API 开发一个自定义组件
2. 实现组件的 props 和 emits 定义
3. 添加必要的类型声明
4. 编写组件文档
5. 提供使用示例`,
    submission: `我已经完成了作业，主要实现了以下功能：
1. 使用 setup 语法糖
2. 使用 TypeScript 进行类型定义
3. 实现了组件的双向绑定
4. 添加了必要的注释和文档`,
    submitTime: '2024-03-19 15:30:00',
    feedback: '完成得很好，代码结构清晰，类型定义准确。建议可以添加更多的错误处理和边界情况考虑。'
});

// 处理函数
const handleSubmit = () => {
    ElMessage.info('提交作业功能待实现');
};

const handleGrade = () => {
    ElMessage.info('批改作业功能待实现');
};
</script>

<style scoped>
.homework-detail {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    color: #303133;
}

.actions {
    display: flex;
    gap: 10px;
}

.content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.description,
.submission,
.feedback {
    margin-top: 20px;
}

h3 {
    color: #303133;
    margin-bottom: 10px;
}

.text {
    white-space: pre-line;
    line-height: 1.6;
    color: #606266;
}

.submit-time {
    margin-top: 10px;
    color: #909399;
    font-size: 14px;
}

:deep(.el-button) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
</style>