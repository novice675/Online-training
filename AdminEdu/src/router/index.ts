// 创建路由对象
import { createRouter, createWebHashHistory, type RouteLocationNormalizedGeneric, type RouteRecordRaw } from "vue-router";
import { useUserStore } from '../stores/user'
import type { RouteConfig } from '../types/interfaces/route'

// 菜单路由
export const menuRoutes: RouteConfig[] = [
  // 物业管理菜单
  {
    name: 'Overview',
    path: 'Overview',
    component: () => import('@/pages/home/Estate/EstateMenu/EstateMenu.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '物业总览',
      menuIcon: 'dashboard',
      parentModule: 'Estate',
      isLogin: true,
    }
  },
  {
    name: 'Visitor',
    path: 'Visitor',
    component: () => import('@/pages/home/Estate/EstateMenu/Visitor/Visitor.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '访客管理',
      menuIcon: 'book',
      parentModule: 'Estate',
      isLogin: true,
    },
    children: [
      {
        name: 'courseList',
        path: 'list',
        component: () => import('@/pages/home/Estate/EstateMenu/Visitor/List.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客信息登记',
          menuIcon: 'list',
          parentModule: 'index',
          isLogin: true,
        }
      },
      {
        name: 'courseDetail',
        path: 'detail/:id',
        component: () => import('@/pages/home/Estate/EstateMenu/Visitor/Detail.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客进出记录',
          menuIcon: 'detail',
          parentModule: 'index',
          isLogin: true,
          hidden: true
        }
      }
    ]
  }
]

// 路由表
const router = createRouter({
  history: createWebHashHistory(),//路由模式 
  routes: [
    {
      name: '/',
      path: '/',
      component: () => import('@/pages/Login.vue')
    },
    {
      name: 'home',
      path: '/home',
      component: () => import('@/pages/home/main.vue'),
      // redirect: '/home/situation',
      children: [
        {
          // 综合态势
          name: 'situation',
          path: 'situation',
          component: () => import('@/pages/home/Situation/Situation.vue'),
        },
        {
          // 运营管理
          name: 'Operation',
          path: 'Operation',
          // redirect: '/home/Operation/OperationMenu',
          component: () => import('@/pages/home/Operation/Operation.vue'),
          children: [
            {
              name: 'OperationMenu',
              path: 'OperationMenu',
              component: () => import('@/pages/home/Operation/OperationMenu/OperationMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            }
          ],
        },
        {
          // 物业管理
          name: 'Estate',
          path: 'Estate',
          // redirect: '/home/Estate/EstateMenu',
          component: () => import('@/pages/home/Estate/Estate.vue'),
          children: [
            {
              name: 'EstateMenu',
              path: 'EstateMenu',
              component: () => import('@/pages/home/Estate/EstateMenu/EstateMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            }
          ],
        },
        {
          // 可视数据
          name: 'VisualData',
          path: 'VisualData',
          // redirect: '/home/VisualData/VisualDataMenu',
          component: () => import('@/pages/home/VisualData/VisualData.vue'),
          children: [
            {
              name: 'VisualDataMenu',
              path: 'VisualDataMenu',
              component: () => import('@/pages/home/VisualData/VisualDataMenu/VisualDataMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            }
          ],
        },
        {
          // 配置中心
          name: 'Configuration',
          path: 'Configuration',
          // redirect: '/home/Configuration/ConfigurationMenu',
          component: () => import('@/pages/home/Configuration/Configuration.vue'),
          children: [
            {
              name: 'ConfigurationMenu',
              path: 'ConfigurationMenu',
              component: () => import('@/pages/home/Configuration/ConfigurationMenu/ConfigurationMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            }
          ],
        },
      ],
    },
    {
      name: 'index',
      path: '/index',
      redirect: '/index/dashboard',
      children: [],
      component: () => import('../pages/Index.vue'),
      meta: {  // 配置路由一些额外的信息
        isLogin: true
      }
    },
  ]
});

// // 获取用户登录后，有权限访问的路由
// const getOwnRouters = () => {
//   const userStore = useUserStore();
//   const userRoles = userStore.roleName || [];
//   // 递归过滤路由，包括子路由
//   const filterRoutes = (routes: RouteConfig[]): RouteConfig[] => {
//     return routes.filter(route => {
//       // 检查当前路由是否有权限
//       const hasPermission = route.meta.roleName.some(role => userRoles.includes(role));

//       // 如果有子路由，递归过滤子路由
//       if (route.children && route.children.length > 0) {
//         const filteredChildren = filterRoutes(route.children);
//         // 如果子路由有权限，保留父路由并只展示有权限的子路由
//         if (filteredChildren.length > 0) {
//           route.children = filteredChildren;
//           return true;
//         }
//       }
//       return hasPermission;
//     });
//   };
//   return filterRoutes(menuRoutes);
// }

// // 判断路由是否已经存在 返回布尔值
// const hasRouter = (to: RouteLocationNormalizedGeneric) => {
//   return router.hasRoute(to.name as string);
// }


// // 判断用户访问的路由，是否是自己有权限访问的路由
// const isOwnRouter = (to: RouteLocationNormalizedGeneric) => {
//   const routes = getOwnRouters();
//   // 递归检查路由权限，拼接完整路径
//   const checkRoutePermission = (routes: RouteConfig[], parentPath = '/index'): boolean => {
//     return routes.some(route => {
//       // 拼接当前路由的完整路径
//       const fullPath = parentPath.endsWith('/') ? parentPath + route.path : parentPath + '/' + route.path;
//       // 精确匹配
//       if (to.path === fullPath) {
//         return true;
//       }
//       // 检查子路由
//       if (route.children && route.children.length > 0) {
//         return checkRoutePermission(route.children, fullPath);
//       }
//       return false;
//     });
//   };

//   return checkRoutePermission(routes);
// };


// // 路由守卫
// router.beforeEach((to, _, next) => {
//   // 从 localStorage 中获取持久化的用户数据
//   const userData = JSON.parse(localStorage.getItem('user') || '{}');

//   // 限定除了登录页面之外，所有页面未登录不能访问
//   if (!userData.username && to.path !== '/login') {
//     next('/login');
//     return;
//   }

//   // 如果用户已登录，且访问的是受控路由区域
//   if (userData.username && to.path.startsWith('/home')) {
//     // 获取用户有权限访问的路由配置
//     const ownRoutes = getOwnRouters();

//     // 检查这些路由是否都已经添加到路由系统中
//     const hasRoutes = ownRoutes.every(route => router.hasRoute(route.name as string));

//     if (!hasRoutes) {
//       // 清除所有动态添加的路由
//       router.getRoutes().forEach(route => {
//         if (route.name && route.name !== 'index' && route.name !== 'home' && route.name !== 'login') {
//           router.removeRoute(route.name);
//         }
//       });

//       // 递归添加路由及其子路由
//       const addRoutes = (routes: RouteConfig[], parentName = 'index') => {
//         routes.forEach(route => {
//           if (!router.hasRoute(route.name as string)) {
//             const routeConfig: RouteRecordRaw = {
//               name: route.name,
//               path: route.path,
//               component: route.component,
//               meta: route.meta,
//               children: []
//             };

//             // 如果有子路由，递归添加
//             if (route.children && route.children.length > 0) {
//               routeConfig.children = route.children.map(child => {
//                 const childRoute = {
//                   name: child.name,
//                   path: child.path,
//                   component: child.component,
//                   meta: child.meta,
//                   children: child.children
//                 } as RouteRecordRaw;
//                 if (child.redirect) {
//                   childRoute.redirect = child.redirect;
//                 }
//                 return childRoute;
//               });
//             }
//             router.addRoute(parentName, routeConfig);
//           }
//         });
//       };
//       addRoutes(ownRoutes);
//       next({ ...to, replace: true });
//       return;
//     }
//   }

//   // 权限检查：如果系统中不存在这个路由，并且该路由是用户没有权限访问的路由，就进入404页面
//   if (!hasRouter(to) && !isOwnRouter(to)) {
//     // 如果目标路径已经是404页面，直接放行
//     if (to.path === '/404') {
//       next();
//       return;
//     }

//     // 确保404路由存在（只添加一次）
//     if (!router.hasRoute('404')) {
//       router.addRoute({
//         name: '404',
//         path: '/404',
//         component: () => import('../pages/404.vue')
//       });
//     }
//     // 跳转到404页面
//     next('/404');
//     return;
//   }

//   // 其他情况，用户正常访问路由
//   next();
// });

export default router