import React from 'react';
import Shou from '../pages/Shou';
import Serve from '../pages/Serve';
import Organize from '../pages/Organize';
import Main from '../pages/Main';

// 定义路由类型
interface RouteConfig {
  path: string;
  element: React.ReactNode;
}

// 定义路由配置
const routes: RouteConfig[] = [
  {
    path: '/',
    element: <Shou />,
  },
  {
    path: '/service',
    element: <Serve />,
  },
  {
    path: '/organization',
    element: <Organize />,
  },
  {
    path: '/me',
    element: <Main />,
  },
];

export default routes;
export type { RouteConfig };