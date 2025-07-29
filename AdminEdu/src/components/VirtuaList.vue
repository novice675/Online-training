<template>
    <div ref="container" class="container" :style="{
        overflowY: 'auto',
        height: `${containerHeight}px`,
        position: 'relative'
    }" @scroll="handleScroll">
        <!-- 用真实总高度撑开滚动条 -->
        <div :style="{ height: `${totalHeight}px` }"></div>
        <!-- 可视区域，通过 transform 偏移 -->
        <div ref="vlist" :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            transform: `translateY(${offset}px)`
        }">
            <ul class="virtual-list">
                <li v-for="(item, i) in dataList" :key="item.id" :ref="el => setItemRef(el, startIndex + i - buffer)"
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
import { defineComponent } from 'vue'
export default defineComponent({
    name: 'VirtuaList'
})
</script>

<script lang="ts" setup>
import { computed, onMounted, ref, nextTick, watch, onUpdated } from 'vue'
import _ from 'lodash'
import type { ComponentPublicInstance } from 'vue'

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

const container = ref<HTMLDivElement | null>(null)
const containerHeight = ref(0)
const startIndex = ref(0)
const endIndex = ref(0)
const offset = ref(0)

// 1. 记录每个子项的高度和偏移量
const itemHeights = ref<number[]>([])
const offsets = ref<number[]>([])

// 2. 渲染每个子项时，动态测量高度
const itemRefs = ref<HTMLElement[]>([])

const setItemRef = (el: Element | ComponentPublicInstance | null, idx: number) => {
    // 只处理原生 DOM 元素
    if (el instanceof Element) {
        itemRefs.value[idx] = el as HTMLElement
    }
}

// 3. 计算 offsets
const updateOffsets = () => {
    offsets.value = [0]
    for (let i = 0; i < itemHeights.value.length; i++) {
        offsets.value[i + 1] = offsets.value[i] + (itemHeights.value[i] || 0)
    }
}

// 4. 测量所有可见子项高度
const measureHeights = () => {
    let changed = false
    for (let i = startIndex.value; i < endIndex.value; i++) {
        const el = itemRefs.value[i]
        if (el) {
            const h = el.offsetHeight
            if (itemHeights.value[i] !== h) {
                itemHeights.value[i] = h
                changed = true
            }
        }
    }
    if (changed) updateOffsets()
}

// 5. 计算 startIndex
const getStartIndex = (scrollTop: number) => {
    // 二分查找
    let low = 0, high = offsets.value.length - 1
    while (low < high) {
        const mid = Math.floor((low + high) / 2)
        if (offsets.value[mid] <= scrollTop) {
            low = mid + 1
        } else {
            high = mid
        }
    }
    return Math.max(0, low - 1)
}

// 6. 计算 endIndex
const getEndIndex = (start: number, scrollTop: number, viewHeight: number) => {
    let sum = offsets.value[start] || 0
    let i = start
    while (i < itemHeights.value.length && sum < scrollTop + viewHeight) {
        sum += itemHeights.value[i] || 0
        i++
    }
    return i
}

// 7. 处理滚动
const handleScroll = _.throttle(() => {
    if (!container.value) return
    const scrollTop = container.value.scrollTop
    startIndex.value = getStartIndex(scrollTop)
    endIndex.value = getEndIndex(startIndex.value, scrollTop, containerHeight.value)
    offset.value = offsets.value[startIndex.value] || 0
    nextTick(measureHeights)
}, 16)

// 8. 初始化
const initHeights = (len: number) => {
    itemHeights.value = Array(len).fill(60)
    itemRefs.value = Array(len)
    updateOffsets()
}

// 9. 监听数据变化和内容变化
onMounted(() => {
    if (container.value) {
        containerHeight.value = container.value.parentElement?.offsetHeight as number
    }
    initHeights(props.list.length)
    endIndex.value = getEndIndex(0, 0, containerHeight.value)
    nextTick(measureHeights)
})

watch(() => props.list.length, (newLen) => {
    initHeights(newLen)
    endIndex.value = getEndIndex(0, 0, containerHeight.value)
    nextTick(measureHeights)
})

onUpdated(() => {
    nextTick(measureHeights)
})

// 10. 计算可见数据
const buffer = 3 // 预渲染3个
const dataList = computed(() =>
    props.list.slice(
        Math.max(0, startIndex.value - buffer),
        Math.min(props.list.length, endIndex.value + buffer)
    )
)

// 11. 总高度
const totalHeight = computed(() => offsets.value[offsets.value.length - 1] || 0)

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