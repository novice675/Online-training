<template>
  <div class="operation-overview">
    <!-- 页面头部 -->
    <OverviewHeader
            :loading="refreshing"
      @refresh="refreshAllData"
    />

    <!-- 关键指标卡片 -->
    <OverviewMetrics
      :data="overviewData"
      :loading="loading.overview"
    />

    <!-- 图表和列表区域 -->
    <div class="content-section">
      <div class="content-grid">
        <!-- 收入趋势图表 -->
        <OverviewRevenueChart
          :data="revenueData"
          :loading="loading.revenue"
          :time-range="revenueTimeRange"
          @time-range-change="handleRevenueTimeRangeChange"
        />

        <!-- 入住率分布 -->
        <OverviewOccupancyChart
          :total-houses="overviewData.totalHouses"
          :occupancy-rate="overviewData.occupancyRate"
          :loading="loading.occupancy"
        />

        <!-- 最近文章 -->
        <OverviewArticleList
          :articles="recentArticles"
          :loading="loading.articles"
          @view-all="viewAllArticles"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getOperationOverview,
  getRevenueStats,
  wenList,
} from "../../api/auth.js";

// 导入组件
import OverviewHeader from "../../components/OverviewHeader.vue";
import OverviewMetrics from "../../components/OverviewMetrics.vue";
import OverviewRevenueChart from "../../components/OverviewRevenueChart.vue";
import OverviewOccupancyChart from "../../components/OverviewOccupancyChart.vue";
import OverviewArticleList from "../../components/OverviewArticleList.vue";

const router = useRouter();

// 响应式数据
const loading = ref({
  overview: false,
  revenue: false,
  occupancy: false,
  articles: false,
});

const refreshing = ref(false);
const revenueTimeRange = ref("6months");

// 数据
const overviewData = ref({
  totalRevenue: 0,
  monthRevenue: 0,
  totalTenants: 0,
  occupancyRate: 0,
  totalArticles: 0,
  monthArticles: 0,
  totalBuildings: 0,
  totalHouses: 0,
});

const recentArticles = ref<any[]>([]);
const revenueData = ref<any[]>([]);

// 获取运营总览数据
const fetchOverviewData = async () => {
  try {
    loading.value.overview = true;
    const response = await getOperationOverview();
    overviewData.value = response.data.data;
  } catch (error) {
    console.error("获取运营数据失败:", error);
  } finally {
    loading.value.overview = false;
  }
};

// 获取收入趋势数据
const fetchRevenueData = async () => {
  try {
    loading.value.revenue = true;
    const response = await getRevenueStats(revenueTimeRange.value);
    revenueData.value = response.data.data;
  } catch (error) {
    console.error("获取收入数据失败:", error);
  } finally {
    loading.value.revenue = false;
  }
};

// 获取最近文章
const fetchRecentArticles = async () => {
  try {
    loading.value.articles = true;
    const response = await wenList({
      page: 1,
      size: 5,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    if (response.data && response.data.data) {
      recentArticles.value = Array.isArray(response.data.data)
        ? response.data.data.slice(0, 5)
        : response.data.data.list?.slice(0, 5) || [];
    }
  } catch (error) {
    console.error("获取最近文章失败:", error);
  } finally {
    loading.value.articles = false;
  }
};

// 处理收入时间范围变化
const handleRevenueTimeRangeChange = (value: string) => {
  revenueTimeRange.value = value;
  fetchRevenueData();
};

// 刷新所有数据
const refreshAllData = async () => {
  refreshing.value = true;
  try {
    await Promise.all([
      fetchOverviewData(),
      fetchRevenueData(),
      fetchRecentArticles(),
    ]);
  } catch (error) {
    console.error("数据刷新失败:", error);
  } finally {
    refreshing.value = false;
  }
};

// 工具函数

const viewAllArticles = () => {
  router.push("/home/Operation/OperationMenu/zhang");
};

// 生命周期
onMounted(async () => {
  await refreshAllData();
});
</script>

<style scoped>
.operation-overview {
  padding: 20px;
  background: transparent;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.content-section {
  margin-top: 24px;
  margin-bottom: 40px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .operation-overview {
    padding: 12px;
    height: auto;
    min-height: 100vh;
  }
}
</style> 