<template>
  <div class="course-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>课程详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="课程ID">{{ courseDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ courseDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="授课教师">{{ courseDetail.teacher }}</el-descriptions-item>
        <el-descriptions-item label="上课时间">{{ courseDetail.schedule }}</el-descriptions-item>
        <el-descriptions-item label="上课地点">{{ courseDetail.location }}</el-descriptions-item>
        <el-descriptions-item label="课程简介">{{ courseDetail.description }}</el-descriptions-item>
      </el-descriptions>

      <div class="student-list">
        <h3>选课学生</h3>
        <el-table :data="courseDetail.students" style="width: 100%">
          <el-table-column prop="id" label="学号" width="120" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="class" label="班级" />
          <el-table-column prop="score" label="成绩" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 模拟课程详情数据
const courseDetail = ref({
  id: 0,
  name: '',
  teacher: '',
  schedule: '',
  location: '',
  description: '',
  students: []
})

// 获取课程ID
const courseId = route.params.id

// 获取课程详情
const getCourseDetail = () => {
  // TODO: 调用API获取课程详情
  // 模拟数据
  courseDetail.value = {
    id: Number(courseId),
    name: '高等数学',
    teacher: '张老师',
    schedule: '周一 1-2节',
    location: '教学楼A101',
    description: '本课程主要讲授微积分、线性代数等基础知识',
    students: [
      { id: '2021001', name: '张三', class: '计算机2101', score: 85 },
      { id: '2021002', name: '李四', class: '计算机2101', score: 92 }
    ]
  }
}

// 返回列表
const goBack = () => {
  router.push('/index/course/list')
}

onMounted(() => {
  getCourseDetail()
})
</script>

<style scoped>
.course-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  width: 100%;
}

.student-list {
  margin-top: 20px;
}

h3 {
  margin-bottom: 15px;
}
</style> 