<template>
  <div class="metrics-section" v-loading="loading">
    <div class="metrics-grid">
      <!-- 总收入 -->
      <div class="metric-card revenue">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="metric-info">
            <h3>总收入</h3>
            <p class="metric-value">
              ¥{{ formatCurrency(data.totalRevenue) }}
            </p>
            <div
              class="metric-change positive"
              v-if="data.monthRevenue > 0"
            >
              <el-icon><TrendCharts /></el-icon>
              <span>本月 ¥{{ formatCurrency(data.monthRevenue) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 租户总数 -->
      <div class="metric-card tenants">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="metric-info">
            <h3>租户总数</h3>
            <p class="metric-value">{{ data.totalTenants }}</p>
          </div>
        </div>
      </div>

      <!-- 入住率 -->
      <div class="metric-card occupancy">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><House /></el-icon>
          </div>
          <div class="metric-info">
            <h3>入住率</h3>
            <p class="metric-value">{{ data.occupancyRate }}%</p>
            <div class="metric-detail">
              <span>{{ vacantRooms }} 间空闲</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章总数 -->
      <div class="metric-card articles">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="metric-info">
            <h3>文章总数</h3>
            <p class="metric-value">{{ data.totalArticles }}</p>
            <div class="metric-detail">
              <span>本月发布 {{ data.monthArticles }} 篇</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 楼宇总数 -->
      <div class="metric-card buildings">
        <div class="metric-header">
          <div class="metric-icon">
            <el-icon><HomeFilled /></el-icon>
          </div>
          <div class="metric-info">
            <h3>楼宇总数</h3>
            <p class="metric-value">{{ data.totalBuildings }}</p>
            <div class="metric-detail">
              <span>管理房间 {{ data.totalHouses }} 间</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Money,
  OfficeBuilding,
  House,
  Document,
  HomeFilled,
  TrendCharts,
} from '@element-plus/icons-vue';

interface OverviewData {
  totalRevenue: number;
  monthRevenue: number;
  totalTenants: number;
  occupancyRate: number;
  totalArticles: number;
  monthArticles: number;
  totalBuildings: number;
  totalHouses: number;
}

interface Props {
  data: OverviewData;
  loading?: boolean;
}

const props = defineProps<Props>();

const formatCurrency = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + "万";
  }
  return amount?.toLocaleString() || "0";
};

const vacantRooms = computed(() => {
  return Math.round(
    props.data.totalHouses -
      (props.data.totalHouses * props.data.occupancyRate) / 100
  );
});
</script>

<style scoped>
.metrics-section {
  margin-bottom: 24px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card.revenue {
  border-left-color: #f56c6c;
}

.metric-card.tenants {
  border-left-color: #409eff;
}

.metric-card.occupancy {
  border-left-color: #67c23a;
}

.metric-card.articles {
  border-left-color: #e6a23c;
}

.metric-card.buildings {
  border-left-color: #909399;
}

.metric-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.revenue .metric-icon {
  background: linear-gradient(135deg, #f56c6c, #ff8a8a);
}

.tenants .metric-icon {
  background: linear-gradient(135deg, #409eff, #66b6ff);
}

.occupancy .metric-icon {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.articles .metric-icon {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.buildings .metric-icon {
  background: linear-gradient(135deg, #909399, #a6a9ad);
}

.metric-info {
  flex: 1;
}

.metric-info h3 {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-detail {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .metric-card {
    padding: 20px;
  }

  .metric-value {
    font-size: 24px;
  }
}
</style> 