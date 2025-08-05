<template>
  <div class="xiang-container">
    <div class="page-header">
      <h2>项目管理</h2>
      <div class="header-actions">
        <el-button type="primary">新增项目</el-button>
        <el-button type="success">项目统计</el-button>
      </div>
    </div>

    <div class="content-wrapper">
      <el-card class="info-card">
        <div class="placeholder-content">
          <div class="placeholder-icon">
            <el-icon size="80" color="#67C23A">
              <Folder />
            </el-icon>
          </div>
          <h3>项目管理模块</h3>
          <p class="description">
            该模块用于管理租户企业的各类项目，包括项目立项、进度跟踪、资源分配、成果管理等功能。
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Plus /></el-icon>
              <span>项目立项管理</span>
            </div>
            <div class="feature-item">
              <el-icon><TrendCharts /></el-icon>
              <span>进度跟踪监控</span>
            </div>
            <div class="feature-item">
              <el-icon><Grid /></el-icon>
              <span>资源分配协调</span>
            </div>
            <div class="feature-item">
              <el-icon><Trophy /></el-icon>
              <span>成果展示管理</span>
            </div>
          </div>
          <div class="coming-soon">
            <el-tag type="success" size="large">功能规划中，即将上线...</el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import { Folder, Plus, TrendCharts, Grid, Trophy } from '@element-plus/icons-vue'
</script>

<style scoped>
.xiang-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 40px);
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
  max-width: 700px;
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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #e1f5fe;
}

.feature-item .el-icon {
  color: #67C23A;
  font-size: 18px;
}

.coming-soon {
  margin-top: 24px;
}

:deep(.el-card__body) {
  padding: 0;
}
</style>
