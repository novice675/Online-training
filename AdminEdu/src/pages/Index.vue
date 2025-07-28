<template>
    <div class="container">
        <div class="menu" :class="{ 'collapse': isCollapse }">
            <div class="menu-header">
                <el-icon class="logo-icon"><Monitor /></el-icon>
                <h2 v-show="!isCollapse">RBAC 系统</h2>
            </div>
            <Menu />
        </div>
        <div class="content">
            <div class="content-header">
                <div class="left">
                    <el-icon class="collapse-btn" @click="toggleMenu">
                        <Fold v-if="!isCollapse" />
                        <Expand v-else />
                    </el-icon>
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>当前页面</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="right">
                    <el-tooltip content="全屏" placement="bottom">
                        <el-icon class="action-icon" @click="toggleFullScreen">
                            <FullScreen />
                        </el-icon>
                    </el-tooltip>
                    <el-tooltip content="刷新" placement="bottom">
                        <el-icon class="action-icon" @click="refreshPage">
                            <Refresh />
                        </el-icon>
                    </el-tooltip>
                    <el-divider direction="vertical" />
                    <el-dropdown trigger="click">
                        <div class="user-dropdown">
                            <el-avatar :size="32" :src="userAvatar" />
                            <span class="username">{{ username }}</span>
                            <el-icon><CaretBottom /></el-icon>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <el-icon><User /></el-icon>个人信息
                                </el-dropdown-item>
                                <el-dropdown-item>
                                    <el-icon><Setting /></el-icon>修改密码
                                </el-dropdown-item>
                                <el-dropdown-item divided @click="handleLogout">
                                    <el-icon><SwitchButton /></el-icon>退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
            <div class="content-body">
                <RouterView v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </RouterView>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import Menu from '../components/Menu.vue'
import { useUserStore } from '../stores/user'
import { 
    Fold, 
    Expand, 
    FullScreen, 
    Refresh, 
    CaretBottom,
    User,
    Setting,
    SwitchButton,
    Monitor
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)
const username = ref('管理员')
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

const toggleMenu = () => {
    isCollapse.value = !isCollapse.value
}

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}

const refreshPage = () => {
    window.location.reload()
}

const handleLogout = () => {
    // 清除本地存储的用户数据
    localStorage.removeItem('user')
    // 清除用户状态
    userStore.$reset()
    // 显示退出成功提示
    ElMessage.success('退出登录成功')
    // 跳转到登录页
    router.push('/login')
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

.menu-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease-in-out;
    white-space: nowrap;
    overflow: hidden;
}

.logo-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #409eff;
    transition: all 0.3s ease-in-out;
    flex-shrink: 0;
}

.menu.collapse .logo-icon {
    margin-right: 0;
}

.menu-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
    transition: all 0.3s ease-in-out;
    opacity: 1;
    transform: translateX(0);
}

.menu.collapse .menu-header h2 {
    opacity: 0;
    transform: translateX(-20px);
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
    position: relative;
    min-width: 0; /* 防止内容溢出 */
}

.content-header {
    height: 60px;
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    position: relative;
    z-index: 999;
}

.left {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0; /* 防止内容溢出 */
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

.right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
}

.action-icon {
    font-size: 18px;
    color: #606266;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.action-icon:hover {
    color: #409eff;
    transform: scale(1.1);
}

.user-dropdown {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0 8px;
    border-radius: 4px;
    transition: all 0.3s ease-in-out;
}

.user-dropdown:hover {
    background-color: #f5f7fa;
}

.username {
    margin: 0 8px;
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
}

.content-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #f0f2f5;
    position: relative;
    z-index: 1;
    height: calc(100vh - 60px); /* 减去header高度 */
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

/* Element Plus 图标样式 */
:deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
}

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

/* 确保虚拟列表容器正确显示 */
:deep(.el-scrollbar__wrap) {
    overflow-x: hidden !important;
}

:deep(.el-table__body-wrapper) {
    overflow-x: hidden !important;
}
</style>