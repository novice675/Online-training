<template>
  <div class="homework-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>作业列表</span>
          <el-button type="primary" @click="handleAdd">布置作业</el-button>
        </div>
      </template>
      
      <el-table :data="homeworkList" style="width: 100%">
        <el-table-column prop="id" label="作业ID" width="100" />
        <el-table-column prop="title" label="作业标题" />
        <el-table-column prop="course" label="所属课程" />
        <el-table-column prop="deadline" label="截止时间" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
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

// 模拟作业数据
const homeworkList = ref([
  {
    id: 1,
    title: '第一章习题',
    course: '高等数学',
    deadline: '2024-03-20 23:59',
    status: '进行中'
  },
  {
    id: 2,
    title: '第二章作业',
    course: '大学英语',
    deadline: '2024-03-25 23:59',
    status: '未开始'
  }
])

// 获取状态标签类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '未开始': 'info',
    '进行中': 'warning',
    '已截止': 'danger',
    '已完成': 'success'
  }
  return statusMap[status] || 'info'
}

// 查看作业
const handleView = (row: any) => {
  // TODO: 实现查看作业功能
  console.log('查看作业', row)
}

// 添加作业
const handleAdd = () => {
  // TODO: 实现添加作业功能
  console.log('添加作业')
}

// 编辑作业
const handleEdit = (row: any) => {
  // TODO: 实现编辑作业功能
  console.log('编辑作业', row)
}

// 删除作业
const handleDelete = (row: any) => {
  // TODO: 实现删除作业功能
  console.log('删除作业', row)
}
</script>

<style scoped>
.homework-list {
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