<template>
  <div class="course-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <el-button type="primary" @click="handleAdd">添加课程</el-button>
        </div>
      </template>
      
      <el-table :data="courseList" style="width: 100%">
        <el-table-column prop="id" label="课程ID" width="100" />
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="teacher" label="授课教师" />
        <el-table-column prop="schedule" label="上课时间" />
        <el-table-column prop="location" label="上课地点" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="handleView(scope.row)"
            >查看</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟课程数据
const courseList = ref([
  {
    id: 1,
    name: '高等数学',
    teacher: '张老师',
    schedule: '周一 1-2节',
    location: '教学楼A101'
  },
  {
    id: 2,
    name: '大学英语',
    teacher: '李老师',
    schedule: '周二 3-4节',
    location: '教学楼B203'
  }
])

// 查看课程详情
const handleView = (row: any) => {
  router.push(`/index/course/detail/${row.id}`)
}

// 添加课程
const handleAdd = () => {
  // TODO: 实现添加课程功能
  console.log('添加课程')
}

// 编辑课程
const handleEdit = (row: any) => {
  // TODO: 实现编辑课程功能
  console.log('编辑课程', row)
}

// 删除课程
const handleDelete = (row: any) => {
  // TODO: 实现删除课程功能
  console.log('删除课程', row)
}
</script>

<style scoped>
.course-list {
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
</style> 