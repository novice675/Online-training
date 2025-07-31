<template>
    <div>
        <div class="container">
            <div class="menu" :class="{ 'collapse': isCollapse }">
                <Menu />
            </div>
            <div class="content">
                <div class="content-body">
                    <RouterView v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </RouterView>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Menu from '@/components/Menu.vue'

const isCollapse = ref(false)

const toggleMenu = () => {
    isCollapse.value = !isCollapse.value
}
</script>

<style scoped>
.container {
    display: flex;
    width: 100vw;
    height: 100vh;
    background-color: #f0f2f5;
    overflow: hidden;
}

.menu {
    width: 240px;
    background-color: #304156;
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
    transition: all 0.3s ease-in-out;
    z-index: 1000;
    position: relative;
    overflow-x: hidden;
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
}



.collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: #606266;
    transition: all 0.3s ease-in-out;
    flex-shrink: 0;
}

.collapse-btn:hover {
    color: #409eff;
    transform: scale(1.1);
}

.content-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f0f2f5;
    position: relative;
    z-index: 1;
    height: calc(100vh - 60px);
}

/* 自定义滚动条样式 */
.content-body::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.content-body::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
}

.content-body::-webkit-scrollbar-track {
    background: #f5f7fa;
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

:deep(.el-breadcrumb__inner) {
    color: #606266;
    font-weight: normal;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #303133;
    font-weight: bold;
}
</style>