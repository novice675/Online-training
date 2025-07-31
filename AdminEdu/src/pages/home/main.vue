<template>
    <div>
        <header class="headerTop">
            <h1>智慧校园管理平台</h1>
            <el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" background-color="#082c61"
                text-color="#dddddd" active-text-color="#fff" :ellipsis="false" @select="handleSelect" router>
                <el-menu-item index="Situation">综合态势</el-menu-item>
                <el-menu-item index="Operation">运营管理</el-menu-item>
                <el-menu-item index="Estate">物业管理</el-menu-item>
                <el-menu-item index="VisualData">数据可视</el-menu-item>
                <el-menu-item index="Configuration">配置中心</el-menu-item>
            </el-menu>
            <el-dropdown trigger="click">
                <div class="user-dropdown">
                    <el-icon color="#fff" :size="30" class="menu-icon">
                        <Bell />
                    </el-icon>
                    <el-icon color="#fff" :size="30" class="menu-icon">
                        <User />
                    </el-icon>
                    <span class="username">{{ username }}</span>
                    <el-icon>
                        <CaretBottom />
                    </el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <el-icon>
                                <User />
                            </el-icon>个人信息
                        </el-dropdown-item>
                        <el-dropdown-item>
                            <el-icon>
                                <Setting />
                            </el-icon>修改密码
                        </el-dropdown-item>
                        <el-dropdown-item divided @click="handleLogout">
                            <el-icon>
                                <SwitchButton />
                            </el-icon>退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </header>

        <div class="campus-selector">
            <div class="selector-container">
                <div class="selector-left">
                    <span class="selector-label">选择校区:</span>
                    <el-select v-model="selectedCampus" placeholder="xxxx校区" class="campus-select" clearable>
                        <el-option label="北京校区" value="beijing" />
                        <el-option label="上海校区" value="shanghai" />
                        <el-option label="广州校区" value="guangzhou" />
                        <el-option label="深圳校区" value="shenzhen" />
                    </el-select>
                </div>
                <div class="selector-right">
                    <span class="time-display">{{ currentTime }}</span>
                </div>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
    CaretBottom,
    User,
    Setting,
    SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const username = ref('管理员')
const activeIndex2 = ref('/home/Situation')
const selectedCampus = ref('')
const currentTime = ref('')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleLogout = () => {
    localStorage.removeItem('user')
    userStore.$reset()
    ElMessage.success('退出登录成功')
    router.push('/login')
}

// 更新时间函数
const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
}

// 组件挂载时启动时间更新
onMounted(() => {
    updateTime()
    setInterval(updateTime, 1000)
})
</script>

<style scoped>
.headerTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 85px;
    background-color: #082c61;
}

.headerTop h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
    margin: 0 32px 0 0;
}

.el-menu--horizontal {
    --el-menu-horizontal-height: 85px;
    --menu-font-size: 20px;
    --menu-font-weight: 500;
    background: transparent;
    border-bottom: none;
}

/* 菜单项样式 */
.el-menu--horizontal>.el-menu-item:nth-child(1) {
    margin-right: auto;
}

.el-menu--horizontal .el-menu-item {
    font-size: var(--menu-font-size);
    font-weight: var(--menu-font-weight);
}

.menu-icon {
    margin-right: 6px;
    /* 或 margin-left，根据需要 */
    font-size: 18px;
    /* 可选，调整图标大小 */
    vertical-align: middle;
    /* 垂直居中 */
}

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

/* 校区选择器 - 原生Flexbox布局 */
.campus-selector {
    background: linear-gradient(135deg, #415c85 0%, #2c4a7a 100%);
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selector-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}

.selector-left {
    display: flex;
    align-items: center;
    gap: 15px;
    flex: 1;
}

.selector-label {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    white-space: nowrap;
}

.campus-select {
    width: 200px;
}

/* Element Plus 组件样式覆盖 */
:deep(.campus-select .el-input__wrapper) {
    background-color: #ffffff;
    border: none;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.campus-select .el-input__inner) {
    color: #333333;
    font-size: 14px;
}

:deep(.campus-select .el-input__inner::placeholder) {
    color: #999999;
}

.time-display {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    font-family: 'Courier New', monospace;
    white-space: nowrap;
}

/* 移动端响应式 */
@media (max-width: 768px) {
    .selector-container {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .selector-left {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .campus-select {
        width: 100%;
    }

    .time-display {
        text-align: center;
    }
}
</style>