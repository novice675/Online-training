<template>
  <div class="zuhu-people-container">
    <div class="page-header">
      <h2>租户人员管理</h2>
      <div class="header-actions">
        <el-button type="primary">新增人员</el-button>
        <el-button type="warning">批量导入</el-button>
      </div>
    </div>

    <div class="content-wrapper">
      <el-card class="info-card">
        <div class="placeholder-content">
          <div class="placeholder-icon">
            <el-icon size="80" color="#409EFF">
              <User />
            </el-icon>
          </div>
          <h3>租户人员管理模块</h3>
          <p class="description">
            该模块用于管理各租户企业的员工信息，包括员工档案、权限管理、进出记录等功能。
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><DocumentAdd /></el-icon>
              <span>员工信息登记</span>
            </div>
            <div class="feature-item">
              <el-icon><Key /></el-icon>
              <span>门禁权限管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Clock /></el-icon>
              <span>考勤记录统计</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>人员流动分析</span>
            </div>
          </div>
          <div class="coming-soon">
            <el-tag type="warning" size="large">功能开发中，敬请期待...</el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { User, DocumentAdd, Key, Clock, DataAnalysis } from '@element-plus/icons-vue'
</script>

<style scoped>
.zuhu-people-container {
  padding: 20px;
  background: #f5f5f5;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.info-card {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.placeholder-content {
  padding: 40px 20px;
}

.placeholder-icon {
  margin-bottom: 24px;
}

.placeholder-content h3 {
  color: #333;
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: 600;
}

.description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.feature-item .el-icon {
  color: #409EFF;
  font-size: 18px;
}

.coming-soon {
  margin-top: 24px;
}

:deep(.el-card__body) {
  padding: 0;
}
</style>
