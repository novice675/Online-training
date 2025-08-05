<template>
  <div class="equipment-management">
    <div class="header">
      <h2>设备管理</h2>
      <p>管理物业相关的各类设备信息，包括门禁设备、监控设备等</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#409eff">
            <Monitor />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>125</h3>
          <p>设备总数</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#67c23a">
            <Check />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>118</h3>
          <p>正常运行</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#e6a23c">
            <Warning />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>5</h3>
          <p>需要维护</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <el-icon size="40" color="#f56c6c">
            <Close />
          </el-icon>
        </div>
        <div class="stat-content">
          <h3>2</h3>
          <p>故障离线</p>
        </div>
      </div>
    </div>

    <!-- 设备管理功能 -->
    <div class="equipment-functions">
      <h3>设备管理功能</h3>
      <div class="function-cards">
        <div class="function-card">
          <div class="card-icon">
            <el-icon size="50" color="#409eff">
              <Key />
            </el-icon>
          </div>
          <h4>门禁管理</h4>
          <p>管理各个区域的门禁设备，包括权限配置、进出记录等</p>
          <div class="card-actions">
            <el-button type="primary" @click="navigateTo('/home/Estate/Equipment/Menjin')">
              进入管理
            </el-button>
          </div>
        </div>

        <div class="function-card">
          <div class="card-icon">
            <el-icon size="50" color="#67c23a">
              <Plus />
            </el-icon>
          </div>
          <h4>设备添加</h4>
          <p>添加新的设备信息，配置设备参数和位置信息</p>
          <div class="card-actions">
            <el-button type="success" @click="navigateTo('/home/Estate/Equipment/DeviceAdd')">
              添加设备
            </el-button>
          </div>
        </div>

        <div class="function-card">
          <div class="card-icon">
            <el-icon size="50" color="#e6a23c">
              <Setting />
            </el-icon>
          </div>
          <h4>设备维护</h4>
          <p>设备保养记录、故障报修、维护计划管理</p>
          <div class="card-actions">
            <el-button type="warning">
              维护管理
            </el-button>
          </div>
        </div>

        <div class="function-card">
          <div class="card-icon">
            <el-icon size="50" color="#909399">
              <DataAnalysis />
            </el-icon>
          </div>
          <h4>设备监控</h4>
          <p>实时监控设备运行状态，查看设备使用统计</p>
          <div class="card-actions">
            <el-button>
              监控中心
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近操作记录 -->
    <div class="recent-operations">
      <h3>最近操作记录</h3>
      <div class="operation-list">
        <div class="operation-item">
          <div class="operation-icon">
            <el-icon color="#409eff"><Plus /></el-icon>
          </div>
          <div class="operation-content">
            <p><strong>添加新设备</strong></p>
            <p class="operation-desc">在A栋1楼新增门禁设备 MJ-001</p>
            <span class="operation-time">30分钟前</span>
          </div>
        </div>

        <div class="operation-item">
          <div class="operation-icon">
            <el-icon color="#67c23a"><Setting /></el-icon>
          </div>
          <div class="operation-content">
            <p><strong>设备维护完成</strong></p>
            <p class="operation-desc">监控设备 SP-015 定期维护已完成</p>
            <span class="operation-time">2小时前</span>
          </div>
        </div>

        <div class="operation-item">
          <div class="operation-icon">
            <el-icon color="#e6a23c"><Warning /></el-icon>
          </div>
          <div class="operation-content">
            <p><strong>设备故障报告</strong></p>
            <p class="operation-desc">B栋电梯设备 DT-003 出现故障警报</p>
            <span class="operation-time">5小时前</span>
          </div>
        </div>
      </div>
    </div>

    <div class="current-route-info">
      <el-alert
        title="当前页面：设备管理"
        type="info"
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
import { 
  Monitor, 
  Check, 
  Warning, 
  Close, 
  Key, 
  Plus, 
  Setting, 
  DataAnalysis 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.equipment-management {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%);
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

/* 功能卡片 */
.equipment-functions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.equipment-functions h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.function-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.function-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.function-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.card-icon {
  margin-bottom: 15px;
}

.function-card h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.function-card p {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.card-actions {
  margin-top: 15px;
}

/* 操作记录 */
.recent-operations {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recent-operations h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.operation-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.operation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.operation-item:hover {
  background-color: #f5f7fa;
}

.operation-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.operation-content {
  flex: 1;
}

.operation-content p {
  margin: 0 0 4px 0;
  color: #303133;
}

.operation-desc {
  color: #606266 !important;
  font-size: 14px;
}

.operation-time {
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
  
  .function-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style> 