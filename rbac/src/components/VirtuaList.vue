<template>
    <div ref="container" class="container" :style="{
        overflowY: 'auto',
        height: `${containerHeight}px`,
        position: 'relative'
    }" @scroll="handleScroll">
        <!-- 占位元素，用于撑开滚动条 -->
        <div :style="{ height: `${itemHeight * props.list.length}px` }"></div>
        <!-- 可视区域，通过 transform 偏移 -->
        <div ref="vlist" :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            transform: `translateY(${offset}px)`
        }">
            <ul class="virtual-list">
                <li v-for="(item) in dataList" :key="item.id"
                    :style="{ height: `${itemHeight}px` }"
                    class="list-item">
                    <div class="item-content">
                        <div class="item-main">
                            <span class="item-name">{{ item.name }}</span>
                            <span class="item-description">{{ item.description }}</span>
                        </div>
                        <div class="item-meta">
                            <el-tag :type="getStatusType(item.status)" size="small">
                                {{ item.status }}
                            </el-tag>
                            <span class="item-time">{{ item.createTime }}</span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
// 这个脚本块用于类型导出
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'VirtuaList'
})
</script>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import _ from 'lodash'

interface ListItem {
    id: number;
    name: string;
    description: string;
    status: string;
    createTime: string;
}

const props = defineProps<{
    list: ListItem[]
}>()

// 容器引用，用于获取容器高度和滚动位置
const container = ref<HTMLDivElement | null>(null)
// 虚拟列表容器引用
const vlist = ref<HTMLDivElement | null>(null)
// 容器高度
const containerHeight = ref(0)
// 列表项高度（固定值）
const itemHeight = 60 // 增加高度以适应更多内容
// 可视区域起始索引
const startIndex = ref(0)
// 可视区域结束索引
const endIndex = ref(0)
// 可视区域能显示的最大项数
const pageItems = ref(0)
// 列表偏移量
const offset = ref(0)

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
    switch (status) {
        case '活跃':
            return 'success';
        case '待处理':
            return 'warning';
        case '已完成':
            return 'info';
        default:
            return '';
    }
}

// 处理滚动事件，使用节流优化性能
const handleScroll = _.throttle(() => {
    if (!container.value) return

    const scrollTop = container.value.scrollTop
    const newStartIndex = Math.floor(scrollTop / itemHeight)

    // 限制 startIndex 在合理范围内
    startIndex.value = Math.max(0, newStartIndex)
    endIndex.value = Math.min(startIndex.value + pageItems.value, props.list.length)
    if (endIndex.value < props.list.length - 1) {
        endIndex.value += 1;
    }

    // 更新偏移量
    offset.value = startIndex.value * itemHeight
}, 16) // 使用 16ms（约 60fps）的节流时间

// 组件挂载时初始化
onMounted(() => {
    if (container.value) {
        // 获取容器高度
        containerHeight.value = container.value.parentElement?.offsetHeight as number
        // 计算可视区域能显示的最大项数
        pageItems.value = Math.ceil(containerHeight.value / itemHeight)
        endIndex.value = pageItems.value
    }
})

// 计算需要渲染的数据列表
const dataList = computed(() => props.list.slice(startIndex.value, endIndex.value + 1))

// 导出组件实例类型
defineExpose({
  container,
  vlist,
  containerHeight,
  itemHeight,
  startIndex,
  endIndex,
  pageItems,
  offset,
  dataList
})
</script>

<style scoped>
.container {
    background-color: #fff;
    border-radius: 4px;
}

.virtual-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.list-item {
    padding: 8px 16px;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.3s;
}

.list-item:hover {
    background-color: #f5f7fa;
}

.item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.item-main {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-name {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
}

.item-description {
    font-size: 12px;
    color: #909399;
}

.item-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.item-time {
    font-size: 12px;
    color: #909399;
}

/* 自定义滚动条样式 */
.container::-webkit-scrollbar {
    width: 6px;
}

.container::-webkit-scrollbar-thumb {
    background-color: #c0c4cc;
    border-radius: 3px;
}

.container::-webkit-scrollbar-track {
    background-color: #f5f7fa;
}
</style>