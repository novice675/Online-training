<template>
  <div class="metric-card" :class="type">
    <div class="metric-header">
      <div class="metric-icon">
        <component :is="icon" />
      </div>
      <div class="metric-info">
        <h3>{{ title }}</h3>
        <p class="metric-value">{{ formattedValue }}</p>
        <div
          v-if="change"
          class="metric-change"
          :class="{ positive: change.isPositive, negative: !change.isPositive }"
        >
          <el-icon><TrendCharts /></el-icon>
          <span>{{ change.text }}</span>
        </div>
        <div v-if="detail" class="metric-detail">
          <span>{{ detail }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendCharts } from '@element-plus/icons-vue';

interface Change {
  text: string;
  isPositive: boolean;
}

interface Props {
  title: string;
  value: number | string;
  type: 'revenue' | 'tenants' | 'occupancy' | 'articles' | 'buildings';
  icon: any;
  change?: Change;
  detail?: string;
  formatAsCurrency?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  formatAsCurrency: false
});

const formattedValue = computed(() => {
  if (props.formatAsCurrency && typeof props.value === 'number') {
    return `¥${formatCurrency(props.value)}`;
  }
  if (props.type === 'occupancy') {
    return `${props.value}%`;
  }
  return props.value;
});

const formatCurrency = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + "万";
  }
  return amount?.toLocaleString() || "0";
};
</script>

<style scoped>
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

.metric-change.negative {
  color: #f56c6c;
}

.metric-detail {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .metric-card {
    padding: 20px;
  }

  .metric-value {
    font-size: 24px;
  }
}
</style> 