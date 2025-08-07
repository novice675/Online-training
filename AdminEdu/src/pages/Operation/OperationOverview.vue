<template>
  <div class="operation-overview">
    <div class="header">
      <h2>运营总览</h2>
      <p>查看运营管理的整体概况、关键指标和数据统计</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#409eff">
            <Reading />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>165</h3>
          <p>文章总数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#67c23a">
            <ChatRound />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>842</h3>
          <p>评论总数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#e6a23c">
            <Document />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>28</h3>
          <p>合同签订</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#f56c6c">
            <User />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>156</h3>
          <p>租户总数</p>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="navigateTo('/home/Operation/ContentManagement/ArticlePublish')">
          <el-icon><EditPen /></el-icon>
          发布文章
        </el-button>
        <el-button type="success" size="large" @click="navigateTo('/home/Operation/InvestmentManagement/ContractManagement')">
          <el-icon><Document /></el-icon>
          合同管理
        </el-button>
        <el-button type="warning" size="large" @click="navigateTo('/home/Operation/TenantManagement/TenantInfo')">
          <el-icon><User /></el-icon>
          租户管理
        </el-button>
        <el-button size="large" @click="navigateTo('/home/Operation/ContentManagement/CommentManagement')">
          <el-icon><ChatRound /></el-icon>
          评论管理
        </el-button>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h3>最近活动</h3>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon">
            <el-icon color="#409eff"><Reading /></el-icon>
          </div>
          <div class="activity-content">
            <p><strong>新文章发布</strong></p>
            <p class="activity-desc">《校园管理系统使用指南》已发布</p>
            <span class="activity-time">2小时前</span>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon">
            <el-icon color="#67c23a"><Document /></el-icon>
          </div>
          <div class="activity-content">
            <p><strong>合同签订完成</strong></p>
            <p class="activity-desc">与ABC公司的租赁合同已签订</p>
            <span class="activity-time">5小时前</span>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon">
            <el-icon color="#e6a23c"><User /></el-icon>
          </div>
          <div class="activity-content">
            <p><strong>新租户入库</strong></p>
            <p class="activity-desc">科技创新有限公司已完成入库登记</p>
            <span class="activity-time">1天前</span>
          </div>
        </div>
      </div>
    </div>

    <div class="current-route-info">
      <el-alert
        title="当前页面：运营总览"
        type="success"
        :description="`当前访问路径: ${currentRoute}`"
        show-icon
        :closable="false">
      </el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Reading, ChatRound, Document, User, EditPen } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.operation-overview {
  padding: 20px;
  background-color: #f0f2f5;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
}

.header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-content h3 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-content p {
  margin: 5px 0 0 0;
  color: #606266;
  font-size: 14px;
}

/* 快速操作 */
.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.action-buttons .el-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

/* 最近活动 */
.recent-activities {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recent-activities h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background-color: #f5f7fa;
}

.activity-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 4px 0;
  color: #303133;
}

.activity-desc {
  color: #606266 !important;
  font-size: 14px;
}

.activity-time {
  color: #909399;
  font-size: 12px;
}

.current-route-info {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style> 