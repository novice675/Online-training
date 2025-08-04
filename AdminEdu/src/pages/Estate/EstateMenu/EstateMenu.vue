
<style scoped>
/* 添加全局样式 */
a-layout {
  padding: 24px;
}

/* 数据概览卡片样式 */
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.card-content h1 {
  margin: 0;
  font-size: 24px;
}

.card-content a {
  color: #1890ff;
  text-decoration: none;
}

/* 设备分类占比饼图样式 */
#devicePieChart {
  width: 100%;
  height: 300px;
}

/* 物业缴费柱状图样式 */
#propertyFeeBarChart {
  width: 100%;
  height: 300px;
}

/* 设备报错原因分析表格样式 */
.device-reason-table {
  width: 100%;
}

.device-reason-table .ant-table-thead > tr > th,
.device-reason-table .ant-table-tbody > tr > td {
  text-align: center;
}

/* 设备报错次数统计折线图样式 */
#errorCountLineChart {
  width: 100%;
  height: 300px;
}
</style>

<template>
  <div class="estate-dashboard">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-content">
          <h3>正常运行设备 (台)</h3>
          <div class="stat-number">1,354</div>
          <div class="stat-trend">查看 ></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <h3>年度累计缴费 (元)</h3>
          <div class="stat-number">638,945.43</div>
          <div class="stat-trend">查看 ></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <h3>今日进出人数 (人)</h3>
          <div class="stat-number">5,388</div>
          <div class="stat-trend">查看 ></div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-content">
          <h3>今日进出车辆 (辆)</h3>
          <div class="stat-number">469</div>
          <div class="stat-trend">查看 ></div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 左侧图表 -->
      <div class="left-charts">
        <!-- 设备分类占比 -->
        <div class="chart-card">
          <h4>设备分类占比</h4>
          <div class="pie-chart" ref="pieChart"></div>
        </div>
        
        <!-- 设备管理情况分析 -->
        <div class="chart-card">
          <h4>设备管理情况分析</h4>
          <div class="bar-chart" ref="barChart"></div>
        </div>
      </div>

      <!-- 右侧图表 -->
      <div class="right-charts">
        <!-- 物业缴费 -->
        <div class="chart-card">
          <h4>物业缴费</h4>
          <div class="tabs">
            <span class="tab active">物业缴费</span>
            <span class="tab">公共费用</span>
            <span class="tab">车辆费用</span>
            <span class="tab">水电费用</span>
          </div>
          <div class="column-chart" ref="columnChart"></div>
        </div>
        
        <!-- 设备管理次数统计 -->
        <div class="chart-card">
          <h4>设备管理次数统计</h4>
          <div class="area-chart" ref="areaChart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const pieChart = ref()
const barChart = ref()
const columnChart = ref()
const areaChart = ref()

onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

const initCharts = () => {
  // 饼图 - 设备分类占比
  const pieChartInstance = echarts.init(pieChart.value)
  pieChartInstance.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
      backgroundColor: 'rgba(0,0,0,0.8)',
      borderColor: '#409EFF',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    series: [{
      name: '设备分类',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: [
        { value: 400, name: '人脸识别', itemStyle: { color: '#409EFF' } },
        { value: 300, name: '车牌识别', itemStyle: { color: '#67C23A' } },
        { value: 250, name: '物联设备', itemStyle: { color: '#E6A23C' } },
        { value: 200, name: '监控设备', itemStyle: { color: '#F56C6C' } },
        { value: 204, name: '其他设备', itemStyle: { color: '#909399' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: function (idx) {
        return Math.random() * 200;
      }
    }]
  })

  // 柱状图 - 物业缴费
  const columnChartInstance = echarts.init(columnChart.value)
  columnChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        return `${params[0].name}<br/>缴费金额: ${params[0].value}万元`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      max: 1200,
      axisLabel: {
        formatter: '{value}万'
      }
    },
    series: [{
      data: [200, 400, 800, 1000, 800, 400, 200, 200, 800, 400, 200, 200],
      type: 'bar',
      itemStyle: {
        color: '#409EFF',
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: '#66b1ff'
        }
      },
      animationDelay: function (idx) {
        return idx * 100;
      }
    }]
  })

  // 横向条形图 - 设备管理情况分析
  const barChartInstance = echarts.init(barChart.value)
  barChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        return `${params[0].name}<br/>完成度: ${params[0].value}%`
      }
    },
    grid: {
      left: '20%',
      right: '10%',
      top: '10%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: ['光伏发电', '立体车库', '白蚁防治', '工厂用电', '工厂维修'],
      axisLabel: {
        fontSize: 11
      }
    },
    series: [{
      data: [
        { value: 40, itemStyle: { color: '#E6A23C' } },
        { value: 48, itemStyle: { color: '#E6A23C' } },
        { value: 55, itemStyle: { color: '#E6A23C' } },
        { value: 88, itemStyle: { color: '#9C27B0' } },
        { value: 96, itemStyle: { color: '#9C27B0' } }
      ],
      type: 'bar',
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      animationDelay: function (idx) {
        return idx * 200;
      }
    }]
  })

  // 面积图 - 设备管理次数统计
  const areaChartInstance = echarts.init(areaChart.value)
  areaChartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: function(params) {
        return `${params[0].name}<br/>管理次数: ${params[0].value}次`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: {
        fontSize: 11
      }
    },
    yAxis: {
      type: 'value',
      max: 800,
      axisLabel: {
        formatter: '{value}次'
      }
    },
    series: [{
      data: [200, 300, 400, 500, 350, 450, 500, 550, 500, 450, 400, 350],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#409EFF',
        width: 3
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(64, 158, 255, 0.8)'
          }, {
            offset: 1, color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      },
      emphasis: {
        itemStyle: {
          color: '#66b1ff',
          shadowBlur: 10,
          shadowColor: 'rgba(64, 158, 255, 0.5)'
        }
      },
      animationDelay: function (idx) {
        return idx * 50;
      }
    }]
  })

  // 添加点击事件
  pieChartInstance.on('click', function (params) {
    console.log('饼图点击:', params.name, params.value)
    // 可以添加跳转到详细页面的逻辑
  })

  columnChartInstance.on('click', function (params) {
    console.log('柱状图点击:', params.name, params.value)
  })

  barChartInstance.on('click', function (params) {
    console.log('条形图点击:', params.name, params.value)
  })

  areaChartInstance.on('click', function (params) {
    console.log('面积图点击:', params.name, params.value)
  })

  // 监听窗口大小变化，重新调整图表大小
  window.addEventListener('resize', () => {
    pieChartInstance.resize()
    columnChartInstance.resize()
    barChartInstance.resize()
    areaChartInstance.resize()
  })
}
</script>

<style scoped>
.estate-dashboard {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content h3 {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-trend {
  color: #409EFF;
  font-size: 11px;
  cursor: pointer;
}

.charts-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 200px);
}

.left-charts, .right-charts {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-height: 0;
}

.chart-card h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #333;
}

.pie-chart, .bar-chart, .column-chart, .area-chart {
  height: calc(100% - 40px);
  min-height: 250px;
}

.tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.tab {
  padding: 6px 12px;
  cursor: pointer;
  color: #666;
  border-bottom: 2px solid transparent;
  font-size: 12px;
}

.tab.active {
  color: #409EFF;
  border-bottom-color: #409EFF;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .left-charts, .right-charts {
    height: auto;
  }
  
  .chart-card {
    min-height: 300px;
  }
  
  .pie-chart, .bar-chart, .column-chart, .area-chart {
    height: 250px;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .estate-dashboard {
    padding: 10px;
  }
}
</style>
