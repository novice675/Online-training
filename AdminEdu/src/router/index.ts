// 创建路由对象
import { createRouter, createWebHashHistory, type RouteLocationNormalizedGeneric, type RouteRecordRaw } from "vue-router";
import { useUserStore } from '@/stores/user'
import type { RouteConfig } from '../types/interfaces/route'

// 菜单路由 - 按模块分类
export const menuRoutes: RouteConfig[] = [
  // 运营管理菜单
  {
    name: 'OperationOverview',
    path: 'OperationOverview',
    component: () => import('@/pages/Operation/OperationOverview.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '运营总览',
      menuIcon: 'dashboard',
      parentModule: 'Operation',
      isLogin: true,
    }
  },
  {
    name: 'ContentManagement',
    path: 'ContentManagement',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '内容管理',
      menuIcon: 'book',
      parentModule: 'Operation',
      isLogin: true,
    },
    children: [
      {
        name: 'zhang',
        path: 'zhang',
        component: () => import('@/pages/Operation/OperationMenu/zhang.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '文章发布管理',
          menuIcon: 'list',
          parentModule: 'Operation',
          isLogin: true,
                }
      },
      {
        name: 'ping',
        path: 'ping',
        component: () => import('@/pages/Operation/OperationMenu/ping.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '内容评论管理',
          menuIcon: 'list',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
      ]
  },
  // 招商管理菜单
  {
    name: 'InvestmentManagement',
    path: 'InvestmentManagement',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '招商管理',
      menuIcon: 'user-group',
      parentModule: 'Operation',
      isLogin: true,
    },
    children: [
      {
        name: 'keHu',
        path: 'keHu',
        component: () => import('@/pages/Operation/zhaoShang/keHu.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '客户管理',
          menuIcon: 'user',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
      {
        name: 'heTong',
        path: 'heTong',
        component: () => import('@/pages/Operation/zhaoShang/heTong.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '合同管理',
          menuIcon: 'document-text',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
      {
        name: 'hetongDetail',
        path: 'hetongDetail',
        component: () => import('@/pages/Operation/zhaoShang/xiang.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '合同详情',
          menuIcon: 'document-text',
          parentModule: 'Operation',
          isLogin: true,
          hideInMenu: true // 隐藏在菜单中，不显示为独立菜单项
        }
      },
    ]
  },
  // 租户管理菜单
  {
    name: 'TenantManagement',
    path: 'TenantManagement',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '租户管理',
      menuIcon: 'building',
      parentModule: 'Operation',
      isLogin: true,
    },
    children: [
      {
        name: 'ZuHuXinXi',
        path: 'ZuHuXinXi',
        component: () => import('@/pages/Operation/ZuHu/ZuHuXinXi.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '租户信息管理',
          menuIcon: 'office-building',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
      {
        name: 'ZuHuDetail',
        path: 'ZuHuXinXi/detail/:id',
        component: () => import('@/pages/Operation/ZuHu/xiang.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '租户详情',
          menuIcon: 'document',
          parentModule: 'Operation',
          isLogin: true,
          hideInMenu: true // 隐藏在菜单中，只能通过跳转访问
        }
      },
      {
        name: 'ZuHuPeople',
        path: 'ZuHuPeople',
        component: () => import('@/pages/Operation/ZuHu/ZuHuPeople.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '租户人员管理',
          menuIcon: 'user-group',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
    ]
  },
  // 资产管理菜单

  // 文章详情页面（不在菜单中显示）
  {
    name: 'xiang',
    path: 'xiang/:id',
    component: () => import('@/pages/Operation/OperationMenu/xiang.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '文章详情',
      menuIcon: 'document',
      parentModule: 'Operation',
      isLogin: true,
      hideInMenu: true
    }
  },
  // 文章评论详情页面（不在菜单中显示）
  {
    name: 'pingXiang',
    path: 'pingXiang',
    component: () => import('@/pages/Operation/OperationMenu/pingXiang.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '文章评论详情',
      menuIcon: 'document',
      parentModule: 'Operation',
      isLogin: true,
      hideInMenu: true
    }
  },
  // 物业管理菜单
  {
    name: 'Overview',
    path: 'Overview',
    component: () => import('@/pages/Estate/EstateMenu/EstateMenu.vue'),
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
        component: () => import('@/pages/Estate/EstateMenu/Visitor/Info.vue'),
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
        component: () => import('@/pages/Estate/EstateMenu/Visitor/Record.vue'),
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
        component: () => import('@/pages/Estate/EstateMenu/Vehicle/CarInfo.vue'),
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
        component: () => import('@/pages/Estate/EstateMenu/Vehicle/CarRecord.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '车辆进出记录',
          menuIcon: 'list',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
    ]
  },
  // 智能设备管理菜单
  {
    name: 'SmartDevice',
    path: 'SmartDevice',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '设备管理',
      menuIcon: 'cog',
      parentModule: 'Estate',
      isLogin: true,
    },
    children: [
      {
        name: 'DeviceOverview',
        path: 'DeviceOverview',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/DeviceOverview.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '设备总览',
          menuIcon: 'view-grid',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'SecurityMonitor',
        path: 'SecurityMonitor',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/SecurityMonitor.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '安防监控管理',
          menuIcon: 'video-camera',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'AccessControl',
        path: 'AccessControl',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/AccessControl.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '门禁管理',
          menuIcon: 'lock-closed',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'ElevatorControl',
        path: 'ElevatorControl',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/ElevatorControl.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '电梯控制',
          menuIcon: 'arrow-up',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'LightingSystem',
        path: 'LightingSystem',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/LightingSystem.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '智能照明',
          menuIcon: 'light-bulb',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'AirCondition',
        path: 'AirCondition',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/AirCondition.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '空调系统',
          menuIcon: 'wind',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'FireSafety',
        path: 'FireSafety',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/FireSafety.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '消防安全',
          menuIcon: 'fire',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'WaterSystem',
        path: 'WaterSystem',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/WaterSystem.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '给排水系统',
          menuIcon: 'beaker',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
      {
        name: 'PowerManagement',
        path: 'PowerManagement',
        component: () => import('@/pages/Estate/EstateMenu/SmartDevice/PowerManagement.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '电力管理',
          menuIcon: 'lightning-bolt',
          parentModule: 'Estate',
          isLogin: true,
        }
      },
    ]
  },
  // 账单管理菜单
  {
    name: 'BillManagement',
    path: 'BillManagement',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '账单管理',
      menuIcon: 'document-text',
      parentModule: 'Operation',
      isLogin: true,
    },
    children: [
      {
        name: 'TenantBill',
        path: 'TenantBill',
        component: () => import('@/pages/Operation/ZhangDan/ZuHuZhangDan.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '租户账单管理',
          menuIcon: 'user-group',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
    ]
  },
  // 资产管理菜单
  {
    name: 'ZiChan',
    path: 'ZiChan',
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '资产管理',
      menuIcon: 'office-building',
      parentModule: 'Operation',
      isLogin: true,
    },
    children: [
      {
        name: 'ZiChanLouYu',
        path: 'LouYu',
        component: () => import('@/pages/Operation/ZiChan/LouYu.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '楼宇信息管理',
          menuIcon: 'office-building',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
      {
        name: 'ZiChanZiYuan',
        path: 'ZiYuan',
        component: () => import('@/pages/Operation/ZiChan/ZiYuan.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '房间资源管理',
          menuIcon: 'box',
          parentModule: 'Operation',
          isLogin: true,
        }
      },
    ]
  },
  // 数据可视管理菜单
  {
    name: 'DataAnalysis',
    path: 'DataAnalysis',
    component: () => import('@/pages/VisualData/VisualDataMenu/VisualDataMenu.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '数据分析',
      menuIcon: 'chart',
      parentModule: 'VisualData',
      isLogin: true,
    }
  },
  {
    name: 'baobiao',
    path: 'baobiao',
    component: () => import('@/pages/VisualData/VisualDataMenu/baobiao.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '报表中心',
      menuIcon: 'file',
      parentModule: 'VisualData',
      isLogin: true,
    }
  },
  // 配置中心菜单
  {
    name: 'SystemConfig',
    path: 'SystemConfig',
    component: () => import('@/pages/Configuration/ConfigurationMenu/ConfigurationMenu.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '系统配置',
      menuIcon: 'dashboard',
      parentModule: 'Configuration',
      isLogin: true,
    }
  },
  {
    name: 'user',
    path: 'user',
    component: () => import('@/pages/Configuration/ConfigurationMenu/user.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '用户配置',
      menuIcon: 'user',
      parentModule: 'Configuration',
      isLogin: true,
    }
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
      component: () => import('@/pages/main.vue'),
      redirect: '/home/situation',
      children: [
        {
          // 综合态势
          name: 'situation',
          path: 'situation',
          component: () => import('@/pages/Situation/Situation.vue')
        },
        {
          // 运营管理
          name: 'Operation',
          path: 'Operation',
          component: () => import('@/pages/Operation/Operation.vue'),
          children: [
            {
              path: '',
              name: "OperationDefault",
              redirect: 'OperationOverview'
            },
          ],
        },
        { 
          // 物业管理
          name: 'Estate',
          path: 'Estate',
          component: () => import('@/pages/Estate/Estate.vue'),
          // redirect: '/home/Estate/EstateMenu',
          children: [
            {
              path: '',
              name: "EstateDefault",
              redirect: 'Overview'
            },
            {
              name: 'EstateMenu',
              path: 'EstateMenu',
              component: () => import('@/pages/Estate/EstateMenu/EstateMenu.vue'),
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
          component: () => import('@/pages/VisualData/VisualData.vue'),
          // redirect: '/home/VisualData/VisualDataMenu',
          children: [
            {
              path: '',
              name: "VisualDataDefault",
              redirect: 'DataAnalysis'
            },
            {
              name: 'VisualDataMenu',
              path: 'VisualDataMenu',
              component: () => import('@/pages/VisualData/VisualDataMenu/VisualDataMenu.vue'),
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
          component: () => import('@/pages/Configuration/Configuration.vue'),
          // redirect: '/home/Configuration/ConfigurationMenu',
          children: [
            {
              path: '',
              name: "ConfigurationDefault",
              redirect: 'SystemConfig'
            },
            {
              name: 'ConfigurationMenu',
              path: 'ConfigurationMenu',
              component: () => import('@/pages/Configuration/ConfigurationMenu/ConfigurationMenu.vue'),
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
const parentNameMap: Record<string, string> = {
  '/home/Operation': 'Operation',
  '/home/Estate': 'Estate',
  '/home/VisualData': 'VisualData',
  '/home/Configuration': 'Configuration'
};

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
    '/home/Operation', '/home/Operation/OperationOverview', '/home/Operation/OperationMenu',
    '/home/Estate', '/home/Estate/Overview', '/home/Estate/EstateMenu',
    '/home/VisualData', '/home/VisualData/DataAnalysis', '/home/VisualData/VisualDataMenu',
    '/home/Configuration', '/home/Configuration/SystemConfig', '/home/Configuration/ConfigurationMenu'
  ];

  // 特别处理：允许所有主模块路径（包括重定向目标）
  const moduleBasePaths = [
    '/home/Operation',
    '/home/Estate',
    '/home/VisualData',
    '/home/Configuration'
  ];

  if (moduleBasePaths.some(path => to.path.startsWith(path))) {
    return true;
  }

  if (mainRoutes.includes(to.path)) {
    return true;
  }

  const routes = getOwnRouters();

  // 递归检查路由权限
  const checkRoutePermission = (routes: RouteConfig[], basePath = '/home'): boolean => {
    return routes.some(route => {
      // 根据路由的parentModule构建基础路径
      const moduleBasePath = `/home/${route.meta?.parentModule || 'home'}`;
      const fullPath = `${moduleBasePath}/${route.path}`;

      // 精确匹配当前路由
      if (to.path === fullPath) {
        return true;
      }

      // 检查子路由
      if (route.children && route.children.length > 0) {
        return route.children.some(child => {
          const childPath = `${fullPath}/${child.path}`;
          return to.path === childPath;
        });
      }

      return false;
    });
  };

  return checkRoutePermission(routes);
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

  // 如果用户已登录，且访问的是受控路由区域
  if (userData.username && to.path.startsWith('/home')) {
    // 获取用户有权限访问的路由配置
    const ownRoutes = getOwnRouters();
    // 检查这些路由是否都已经添加到路由系统中
    const hasRoutes = ownRoutes.every(route => router.hasRoute(route.name as string));
    if (!hasRoutes) {
      // 清除所有动态添加的路由
      const staticRouteNames = ['home', 'login', 'situation', 'Operation', 'Estate', 'VisualData', 'Configuration', 'OperationDefault', 'EstateDefault', 'VisualDataDefault', 'ConfigurationDefault'];
      router.getRoutes().forEach(route => {
        if (route.name && !staticRouteNames.includes(route.name as string)) {
          router.removeRoute(route.name);
        }
      });
      
      // 添加动态路由的函数
      const addRoutes = (routes: RouteConfig[]) => {
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
              routeConfig.children = route.children.map(child => ({
                name: child.name,
                path: child.path,
                component: child.component,
                meta: child.meta,
                children: child.children,
                redirect: child.redirect
              } as RouteRecordRaw));
            }

            // 根据路由的parentModule属性确定父路由名称
            const parentName = (route.meta && typeof route.meta.parentModule === 'string')
              ? route.meta.parentModule
              : 'home';
            
            router.addRoute(parentName, routeConfig);
          }
        });
      };
      
      addRoutes(ownRoutes);
      next({ ...to, replace: true });
      return;
    }
  }

  // 权限检查：如果系统中不存在这个路由，并且该路由是用户没有权限访问的路由，就进入404页面
  const routerExists = hasRouter(to);
  const hasPermission = isOwnRouter(to);

  if (!routerExists && !hasPermission) {
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
        component: () => import('@/pages/404.vue')
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