<template>
  <el-menu :default-active="activeMenu" class="el-menu-vertical" :collapse="isCollapse" @select="handleSelect"
    background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
    <!-- 处理没有子路由的菜单项 -->
    <el-menu-item v-for="route in menuItemsWithoutChildren" :key="route.path" :index="getMenuIndex(route)">
      <el-icon>
        <component :is="getIcon(route.meta?.menuIcon || 'dashboard')" />
      </el-icon>
      <template #title>{{ route.meta?.menuTitle || '未命名菜单' }}</template>
    </el-menu-item>

    <!-- 处理有子路由的菜单项 -->
    <el-sub-menu v-for="route in menuItemsWithChildren" :key="route.path" :index="getMenuIndex(route)">
      <template #title>
        <el-icon>
          <component :is="getIcon(route.meta?.menuIcon || 'dashboard')" />
        </el-icon>
        <span>{{ route.meta?.menuTitle || '未命名菜单' }}</span>
      </template>

      <el-menu-item v-for="child in visibleChildren(route)" :key="child.path"
        :index="getChildMenuIndex(route, child)">
        <el-icon>
          <component :is="getIcon(child.meta?.menuIcon || 'dashboard')" />
        </el-icon>
        <template #title>{{ child.meta?.menuTitle || '未命名菜单' }}</template>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Menu'
})
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { menuRoutes } from '../router'
import type { RouteConfig } from '../types/interfaces/route'
import {
  HomeFilled,
  User,
  Reading,
  Document,
  TrendCharts,
  List,
  View,
  Upload
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 控制菜单折叠
const isCollapse = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 获取当前模块名称
const getCurrentModule = computed(() => {
  const path = route.path
  if (path.includes('/Operation')) return 'Operation'
  if (path.includes('/Estate')) return 'Estate'
  if (path.includes('/VisualData')) return 'VisualData'
  if (path.includes('/Configuration')) return 'Configuration'
  return 'home'
})

// 检查路由是否有效
const isValidRoute = (route: any): route is RouteConfig => {
  return route &&
    typeof route === 'object' &&
    'meta' in route &&
    'roleName' in route.meta
}

// 获取用户有权限的菜单路由 - 根据当前模块过滤
const filteredMenuRoutes = computed(() => {
  const userRoles = userStore.roleName || []
  const currentModule = getCurrentModule.value
  
  const routes = menuRoutes.filter(isValidRoute)
  
  // 首先根据模块过滤
  const moduleRoutes = routes.filter(route => 
    route.meta.parentModule === currentModule
  )
  
  // 然后根据权限过滤，同时排除隐藏的菜单项
  const finalRoutes = moduleRoutes.filter(route =>
    route.meta.roleName.some(role => userRoles.includes(role)) &&
    !route.meta.hideInMenu
  )
  return finalRoutes
})

// 分离没有子路由的菜单项
const menuItemsWithoutChildren = computed(() => {
  return filteredMenuRoutes.value.filter(route =>
    !route.children || route.children.length === 0
  )
})

// 分离有子路由的菜单项
const menuItemsWithChildren = computed(() => {
  return filteredMenuRoutes.value.filter(route =>
    route.children && route.children.length > 0
  )
})

// 获取可见的子菜单项
const visibleChildren = (route: RouteConfig) => {
  if (!route.children) return []
  return route.children.filter(child =>
    isValidRoute(child) && !child.meta.hidden && !child.meta.hideInMenu
  )
}

// 生成菜单项的index - 构建完整路径
const getMenuIndex = (route: RouteConfig) => {
  const currentModule = getCurrentModule.value
  return `/home/${currentModule}/${route.path}`
}

// 生成子菜单项的index
const getChildMenuIndex = (parentRoute: RouteConfig, childRoute: RouteConfig) => {
  const currentModule = getCurrentModule.value
  return `/home/${currentModule}/${parentRoute.path}/${childRoute.path}`
}

// 处理菜单选择
const handleSelect = (index: string) => {
  router.push(index)
}

// 获取图标组件
const getIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'user': User,
    'book': Reading,
    'file': Document,
    'chart': TrendCharts,
    'list': List,
    'detail': View,
    'submit': Upload,
    'dashboard': HomeFilled
  }
  return iconMap[iconName] || HomeFilled
}
</script>

<style scoped>
.el-menu-vertical {
  height: 100%;
  border-right: none;
  transition: width 0.3s ease-in-out;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
}

:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 8px;
  width: 24px;
  height: 24px;
  color: #bfcbd9;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #409eff;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #409eff;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title .el-icon) {
  color: #409eff;
}

/* 确保子菜单有动画效果 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-sub-menu .el-menu) {
  background-color: #1f2d3d;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: #1f2d3d !important;
  min-height: 46px;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #001528 !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #fff;
}

/* 子菜单展开动画 */
:deep(.el-sub-menu .el-menu) {
  transition: all 0.3s ease;
}

:deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  transition: transform 0.3s ease;
}

:deep(.el-sub-menu.is-opened .el-sub-menu__title .el-sub-menu__icon-arrow) {
  transform: rotateZ(180deg);
}
</style>