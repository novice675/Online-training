import type { RouteRecordRaw } from 'vue-router'

// 路由元信息类型
export interface RouteMeta {
  roleName: string[]
  menuTitle: string
  menuIcon: string
  isLogin: boolean,
  hidden?: boolean
}

// 路由配置类型
export type RouteConfig = RouteRecordRaw & {
  meta: RouteMeta,
  children?: RouteConfig[]
} 