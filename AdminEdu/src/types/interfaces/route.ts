import type { RouteRecordRaw } from 'vue-router'

// 路由元信息类型
export interface RouteMeta {
  roleName: string[]           // 角色权限
  menuTitle: string           // 菜单标题
  menuIcon: string            // 菜单图标
  isLogin: boolean            // 是否需要登录
  hidden?: boolean            // 是否在菜单中隐藏
  hideInMenu?: boolean        // 是否在菜单中隐藏（新增）
  menuPermission?: string     // 菜单权限标识
  buttonPermissions?: string[] // 按钮权限标识列表
  parentModule?: string       // 父模块名称
}

// 路由配置类型
export type RouteConfig = RouteRecordRaw & {
  meta: RouteMeta,
  children?: RouteConfig[]
}