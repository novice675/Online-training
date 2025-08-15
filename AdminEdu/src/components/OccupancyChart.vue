<template>
  <div class="chart-card" v-loading="loading">
    <div class="card-header">
      <h3>房间状态分布</h3>
    </div>
    <div class="chart-container">
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue';
import * as echarts from 'echarts';

interface Props {
  totalHouses: number;
  occupancyRate: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
});

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const chartData = computed(() => {
  const occupiedRooms = Math.round(
    (props.totalHouses * props.occupancyRate) / 100
  );
  const vacantRooms = props.totalHouses - occupiedRooms;
  
  return {
    occupiedRooms,
    vacantRooms
  };
});

const initChart = () => {
  if (!chartRef.value || props.totalHouses === 0) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "#8c98a4",
      },
    },
    series: [
      {
        name: "房间状态",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        data: [
          {
            value: chartData.value.occupiedRooms,
            name: "已租",
            itemStyle: { color: "#67c23a" },
          },
          { 
            value: chartData.value.vacantRooms, 
            name: "空闲", 
            itemStyle: { color: "#f56c6c" } 
          },
        ],
        label: {
          formatter: "{b}\n{d}%",
        },
      },
    ],
  };

  chartInstance.setOption(option);
};

const resize = () => {
  chartInstance?.resize();
};

watch(
  [() => props.totalHouses, () => props.occupancyRate],
  () => {
    nextTick(() => {
      initChart();
    });
  }
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

.chart-container {
  padding: 20px;
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style> 