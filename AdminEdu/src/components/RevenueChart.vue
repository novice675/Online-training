<template>
  <div class="chart-card" v-loading="loading">
    <div class="card-header">
      <h3>收入趋势</h3>
      <div class="header-actions">
        <el-select
          v-model="timeRange"
          @change="handleTimeRangeChange"
          size="small"
        >
          <el-option label="最近6个月" value="6months" />
          <el-option label="最近1年" value="1year" />
        </el-select>
      </div>
    </div>
    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';

interface RevenueData {
  month: string;
  amount: number;
}

interface Props {
  data: RevenueData[];
  loading?: boolean;
  defaultTimeRange?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  defaultTimeRange: '6months'
});

const emit = defineEmits<{
  timeRangeChange: [value: string];
}>();

const chartRef = ref<HTMLElement>();
const timeRange = ref(props.defaultTimeRange);
let chartInstance: echarts.ECharts | null = null;

const formatCurrency = (amount: number): string => {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(1) + "万";
  }
  return amount?.toLocaleString() || "0";
};

const initChart = () => {
  if (!chartRef.value || !props.data.length) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        return `${params[0].name}<br/>收入: ¥${formatCurrency(
          params[0].value
        )}`;
      },
    },
    xAxis: {
      type: "category",
      data: props.data.map((item: any) => item.month),
      axisLine: {
        lineStyle: { color: "#e0e6ed" },
      },
      axisLabel: {
        color: "#8c98a4",
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: { color: "#e0e6ed" },
      },
      axisLabel: {
        color: "#8c98a4",
        formatter: (value: number) => `¥${(value / 10000).toFixed(0)}万`,
      },
      splitLine: {
        lineStyle: { color: "#f5f7fa" },
      },
    },
    series: [
      {
        data: props.data.map((item: any) => item.amount),
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#409eff",
          width: 3,
        },
        itemStyle: {
          color: "#409eff",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: "rgba(64, 158, 255, 0.3)",
              },
              {
                offset: 1,
                color: "rgba(64, 158, 255, 0.05)",
              },
            ],
          },
        },
      },
    ],
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
  };

  chartInstance.setOption(option);
};

const handleTimeRangeChange = (value: string) => {
  emit('timeRangeChange', value);
};

const resize = () => {
  chartInstance?.resize();
};

watch(
  () => props.data,
  () => {
    nextTick(() => {
      initChart();
    });
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', resize);
});

defineExpose({
  resize
});
</script>

<style scoped>
.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.chart-container {
  padding: 20px;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 