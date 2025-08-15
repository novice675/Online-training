<template>
    <div class="container">
        <div class="menu" :class="{ 'collapse': isCollapse }">
            <Menu />
        </div>
        <div class="content">
            <RouterView v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" />
                </transition>
            </RouterView>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Menu from '../../components/Menu.vue'
import { RouterView } from 'vue-router'
const isCollapse = ref(false)
</script>

<style scoped>
.container {
    display: flex;
    width: 100%;
    min-height: calc(100vh - 165px); /* 100vh - header(85px) - campus-selector(80px) */
    background-color: #f0f2f5;
    overflow: hidden;
}

.menu {
    width: 240px;
    height: 2000px ;/* 确保侧边栏有完整高度 */
    background-color: #304156;
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
    transition: all 0.3s ease-in-out;
    z-index: 1000;
    position: relative;
    overflow: hidden; /* 保持无滚动条，但使用正确的高度 */
}

.menu.collapse {
    width: 64px;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    position: relative;
    min-width: 0;
    height: 100%;
}

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* Element Plus 组件样式 */
:deep(.el-icon) {
    vertical-align: middle;
}

:deep(.el-scrollbar__wrap),
:deep(.el-table__body-wrapper) {
    overflow-x: hidden !important;
}
</style>