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
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '访客管理',
      menuIcon: 'book',
      parentModule: 'Estate',
      isLogin: true,
    },
    children: [
      {
        name: 'Info',
        path: 'Info',
        component: () => import('@/pages/home/Estate/EstateMenu/Visitor/Info.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客信息登记',
          menuIcon: 'list',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'Record',
        path: 'Record',
        component: () => import('@/pages/home/Estate/EstateMenu/Visitor/Record.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客进出记录',
          menuIcon: 'list',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
    ]
  },
  {
    name: 'Vehicle',
    path: 'Vehicle',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '车辆管理',
      menuIcon: 'book',
      parentModule: 'Estate',
      isLogin: true,
    },
    children: [
      {
        name: 'CarInfo',
        path: 'CarInfo',
        component: () => import('@/pages/home/Estate/EstateMenu/Vehicle/CarInfo.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '车辆信息管理',
          menuIcon: 'list',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'CarRecord',
        path: 'CarRecord',
        component: () => import('@/pages/home/Estate/EstateMenu/Vehicle/CarRecord.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '车辆进出记录',
          menuIcon: 'list',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
    ]
  }
]

// 路由表
const router = createRouter({
  history: createWebHashHistory(),//路由模式 
  routes: [
    {
      name: '',
      path: '/',
      redirect: '/login'
    },
    {
      name: 'login',
      path: '/login',
      component: () => import('@/pages/Login.vue')
    },
    {
      name: 'home',
      path: '/home',
      component: () => import('@/pages/home/main.vue'),
      redirect: '/home/situation',
      children: [
        {
          // 综合态势
          name: 'situation',
          path: 'situation',
          component: () => import('@/pages/home/Situation/Situation.vue')
        },
        {
          // 运营管理
          name: 'Operation',
          path: 'Operation',
          component: () => import('@/pages/home/Operation/Operation.vue'),
          // redirect: '/home/Operation/OperationMenu',
          children: [
            {
              path: '',
              name: "OperationDefault",
              redirect: 'OperationMenu'
            },
            {
              name: 'OperationMenu',
              path: 'OperationMenu',
              component: () => import('@/pages/home/Operation/OperationMenu/OperationMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            },
          ],
        },
        {
          // 物业管理
          name: 'Estate',
          path: 'Estate',
          component: () => import('@/pages/home/Estate/Estate.vue'),
          // redirect: '/home/Estate/EstateMenu',
          children: [
            {
              path: '',
              name: "EstateDefault",
              redirect: 'EstateMenu'
            },
            {
              name: 'EstateMenu',
              path: 'EstateMenu',
              component: () => import('@/pages/home/Estate/EstateMenu/EstateMenu.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            },
            {
              name: 'Equipment',
              path: 'Equipment',
              component: () => import('@/pages/home/Estate/EstateMenu/Equipment/Equipment.vue'),
              children: [],
              meta: {  // 配置路由一些额外的信息
                isLogin: true
              },
            },
          ],
        },
        {
          // 可视数据
          name: 'VisualData',
          path: 'VisualData',
          component: () => import('@/pages/home/VisualData/VisualData.vue'),
          // redirect: '/home/VisualData/VisualDataMenu',
          children: [
            {
              path: '',
              name: "VisualDataDefault",
              redirect: 'VisualDataMenu'
            },
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
          component: () => import('@/pages/home/Configuration/Configuration.vue'),
          // redirect: '/home/Configuration/ConfigurationMenu',
          children: [
            {
              path: '',
              name: "ConfigurationDefault",
              redirect: 'ConfigurationMenu'
            },
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
    }
  ]
});

// 获取用户登录后，有权限访问的路由
const getOwnRouters = () => {
  const userStore = useUserStore();
  const userRoles = userStore.roleName || [];
  // 递归过滤路由，包括子路由
  const filterRoutes = (routes: RouteConfig[]): RouteConfig[] => {
    return routes.filter(route => {
      // 检查当前路由是否有权限
      const hasPermission = route.meta.roleName.some(role => userRoles.includes(role));
      // 如果有子路由，递归过滤子路由
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterRoutes(route.children);
        // 如果子路由有权限，保留父路由并只展示有权限的子路由
        if (filteredChildren.length > 0) {
          route.children = filteredChildren;
          return true;
        }
      }
      return hasPermission;
    });
  };
  return filterRoutes(menuRoutes);
}

// 判断路由是否已经存在 返回布尔值
const hasRouter = (to: RouteLocationNormalizedGeneric) => {
  // 检查是否是主路由配置中的路径
  const isMainRoute = router.getRoutes().some(route => {
    if (route.path === to.path) return true;
    // 检查重定向
    if (route.redirect && route.redirect === to.path) return true;
    return false;
  });

  return isMainRoute || router.hasRoute(to.name as string);
}

// 判断用户访问的路由，是否是自己有权限访问的路由
const isOwnRouter = (to: RouteLocationNormalizedGeneric) => {
  // 检查是否是主路由中的路径
  const mainRoutes = ['/', '/login', '/home', '/home/situation',
    '/home/Operation', '/home/Operation/OperationMenu',
    '/home/Estate', '/home/Estate/EstateMenu',
    '/home/VisualData', '/home/VisualData/VisualDataMenu',
    '/home/Configuration', '/home/Configuration/ConfigurationMenu'
  ];

  if (mainRoutes.includes(to.path)) {
    return true;
  }

  const routes = getOwnRouters();
  let parentPath = '/home';
  if (to.path.startsWith('/home/Operation')) parentPath = '/home/Operation';
  else if (to.path.startsWith('/home/Estate')) parentPath = '/home/Estate';
  else if (to.path.startsWith('/home/VisualData')) parentPath = '/home/VisualData';
  else if (to.path.startsWith('/home/Configuration')) parentPath = '/home/Configuration';

  // 递归检查路由权限，拼接完整路径
  const checkRoutePermission = (routes: RouteConfig[], parentPath: string): boolean => {
    return routes.some(route => {
      // 拼接当前路由的完整路径
      const fullPath = parentPath.endsWith('/') ? parentPath + route.path : parentPath + '/' + route.path;
      // 精确匹配
      if (to.path === fullPath) {
        return true;
      }
      // 检查子路由
      if (route.children && route.children.length > 0) {
        return checkRoutePermission(route.children, fullPath);
      }
      return false;
    });
  };

  return checkRoutePermission(routes, parentPath);
};


// 路由守卫
router.beforeEach((to, _, next) => {
  // 从 localStorage 中获取持久化的用户数据
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  // 限定除了登录页面之外，所有页面未登录不能访问
  if (!userData.username && to.path !== '/login') {
    next('/login');
    return;
  }

  const getParentName = (path: string) => {
    if (path.startsWith('/home/Operation')) return 'Operation';
    if (path.startsWith('/home/Estate')) return 'Estate';
    if (path.startsWith('/home/VisualData')) return 'VisualData';
    if (path.startsWith('/home/Configuration')) return 'Configuration';
    return 'home';
  };

  // 如果用户已登录，且访问的是受控路由区域
  if (userData.username && to.path.startsWith('/home')) {
    // 获取用户有权限访问的路由配置
    const ownRoutes = getOwnRouters();
    // 检查这些路由是否都已经添加到路由系统中
    const hasRoutes = ownRoutes.every(route => router.hasRoute(route.name as string));
    if (!hasRoutes) {
      // 清除所有动态添加的路由
      const staticRouteNames = ['home', 'login', 'situation', 'Operation', 'Estate', 'VisualData', 'Configuration'];
      router.getRoutes().forEach(route => {
        if (route.name && !staticRouteNames.includes(route.name as string)) {
          router.removeRoute(route.name);
        }
      });
      const mainRouteNames = ['home', 'Operation', 'Estate', 'VisualData', 'Configuration'];
      const addRoutes = (routes: RouteConfig[], parentName = 'home') => {
        routes.forEach(route => {
          if (!router.hasRoute(route.name as string)) {
            const routeConfig: RouteRecordRaw = {
              name: route.name,
              path: route.path,
              component: route.component,
              meta: route.meta,
              children: [],
              redirect: route.redirect
            };

            // 如果有子路由，递归添加
            if (route.children && route.children.length > 0) {
              routeConfig.children = route.children.map(child => {
                const childRoute = {
                  name: child.name,
                  path: child.path,
                  component: child.component,
                  meta: child.meta,
                  children: child.children
                } as RouteRecordRaw;
                if (child.redirect) {
                  childRoute.redirect = child.redirect;
                }
                return childRoute;
              });
            }
            router.addRoute(parentName, routeConfig);
          }
          // 只在主路由名下递归添加
          if (route.children && route.children.length > 0 && mainRouteNames.includes(route.name as string)) {
            addRoutes(route.children, route.name as string);
          }
        });
      };
      ownRoutes.forEach(route => {
        addRoutes([route], getParentName('/home/' + route.path));
      });
      next({ ...to, replace: true });
      return;
    }
  }

  // 权限检查：如果系统中不存在这个路由，并且该路由是用户没有权限访问的路由，就进入404页面
  if (!hasRouter(to) && !isOwnRouter(to)) {
    // 如果目标路径已经是404页面，直接放行
    if (to.path === '/404') {
      next();
      return;
    }
    // 确保404路由存在（只添加一次）
    if (!router.hasRoute('404')) {
      router.addRoute({
        name: '404',
        path: '/404',
        component: () => import('../pages/404.vue')
      });
    }
    // 跳转到404页面
    next('/404');
    return;
  }
  // 其他情况，用户正常访问路由
  next();
});

export default router