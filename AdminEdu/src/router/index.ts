// 创建路由对象
import { createRouter, createWebHashHistory, type RouteLocationNormalizedGeneric, type RouteRecordRaw } from "vue-router";
import { useUserStore } from '../stores/user'
import type { RouteConfig } from '../types/interfaces/route'

// 菜单路由
export const menuRoutes: RouteConfig[] = [
  {
    name: 'dashboard',
    path: 'dashboard',
    component: () => import('../pages/dashboard.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '仪表盘',
      menuIcon: 'dashboard',
      isLogin: true,
    }
  },
  {
    name: 'student',
    path: 'student',
    component: () => import('../pages/Student.vue'),
    meta: {
      roleName: ['teacher'],
      menuTitle: '学生管理',
      menuIcon: 'user',
      isLogin: true,
    }
  },
  {
    name: 'course',
    path: 'course',
    component: () => import('../pages/Course.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '课程管理',
      menuIcon: 'book',
      isLogin: true,
    },
    children: [
      {
        name: 'courseList',
        path: 'list',
        component: () => import('../pages/course/List.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '课程列表',
          menuIcon: 'list',
          isLogin: true,
        }
      },
      {
        name: 'courseDetail',
        path: 'detail/:id',
        component: () => import('../pages/course/Detail.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '课程详情',
          menuIcon: 'detail',
          isLogin: true,
          hidden: true // 不在菜单中显示
        }
      }
    ]
  },
  {
    name: 'homework',
    path: 'homework',
    component: () => import('../pages/Homework.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '作业管理',
      menuIcon: 'file',
      isLogin: true,
    },
    children: [
      {
        name: 'homeworkList',
        path: 'list',
        component: () => import('../pages/homework/List.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '作业列表',
          menuIcon: 'list',
          isLogin: true,
        }
      },
      {
        name: 'homeworkDetail',
        path: 'detail/:id',
        component: () => import('../pages/homework/Detail.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '作业详情',
          menuIcon: 'detail',
          isLogin: true,
        }
      },
      {
        name: 'homeworkSubmit',
        path: 'submit/:id',
        component: () => import('../pages/homework/Submit.vue'),
        meta: {
          roleName: ['student'],
          menuTitle: '提交作业',
          menuIcon: 'submit',
          isLogin: true,
          // hidden: true // 不在菜单中显示
        }
      }
    ]
  },
  {
    name: 'grade',
    path: 'grade',
    component: () => import('../pages/Grade.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '成绩管理',
      menuIcon: 'chart',
      isLogin: true,
    }
  },
  {
    name: 'property',
    path: 'property',
    component: () => import('../pages/property/index.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '物业管理',
      menuIcon: 'chart',
      isLogin: true,
    },
    children: [
      {
        name: 'propertyHome',
        path: 'propertyHome',
        component: () => import('../pages/property/Home.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '物业总览',
          menuIcon: 'chart',
          isLogin: true,
        }
      },
      
      {
        name: 'propertyAd',
        path: 'propertyAd',
        component: () => import('../pages/property/People-Ad.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客管理',
          menuIcon: 'chart',
          isLogin: true,
        }
      },
      {
        name: 'propertyGo',
        path: 'propertyGo',
        component: () => import('../pages/property/People-go.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客进出管理',
          menuIcon: 'chart',
          isLogin: true,
        }
      },
      {
        name: 'propertyPeople',
        path: 'propertyPeople',
        component: () => import('../pages/property/People.vue'),
        meta: {
          roleName: ['teacher', 'student'],
          menuTitle: '访客信息登记',
          menuIcon: 'chart',
          isLogin: true,
        }
      }
      
    ]
  },
  {
    name: 'visitorChart3D',
    path: 'visitorChart3D',
    component: () => import('../pages/property/VisitorChart3D.vue'),
    meta: {
      roleName: ['teacher', 'student'],
      menuTitle: '数据可视',
      menuIcon: 'chart',
      isLogin: true,
    }
  }
]

// 路由表
const router = createRouter({
  history: createWebHashHistory(),//路由模式 
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('../pages/Login.vue')
    },
    {
      name: '/',
      path: '/',
      component: () => import('@/components/V1.vue')
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
  return router.hasRoute(to.name as string);
}


// 判断用户访问的路由，是否是自己有权限访问的路由
const isOwnRouter = (to: RouteLocationNormalizedGeneric) => {
  const routes = getOwnRouters();
  // 递归检查路由权限，拼接完整路径
  const checkRoutePermission = (routes: RouteConfig[], parentPath = '/index'): boolean => {
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
  if (userData.username && to.path.startsWith('/index')) {
    // 获取用户有权限访问的路由配置
    const ownRoutes = getOwnRouters();

    // 检查这些路由是否都已经添加到路由系统中
    const hasRoutes = ownRoutes.every(route => router.hasRoute(route.name as string));

    if (!hasRoutes) {
      // 清除所有动态添加的路由
      router.getRoutes().forEach(route => {
        if (route.name && route.name !== 'index' && route.name !== 'login') {
          router.removeRoute(route.name);
        }
      });

      // 递归添加路由及其子路由
      const addRoutes = (routes: RouteConfig[]) => {
        routes.forEach(route => {
          if (!router.hasRoute(route.name as string)) {
            const routeConfig: RouteRecordRaw = {
              name: route.name,
              path: route.path,
              component: route.component,
              meta: route.meta,
              children: []
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
            router.addRoute('index', routeConfig);
          }
        });
      };

      addRoutes(ownRoutes);
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