import { NavBar, TabBar } from 'antd-mobile'
import {
  AppOutline,
  MessageOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import './App.css'
import './styles/news.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location
  
  // 设置当前激活的标签页
  const setRouteActive = (value: string) => {
    navigate(value)
  }

  // 底部导航栏
  const tabBarItems = [
    {
      key: '/',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/service',
      title: '服务',
      icon: <UnorderedListOutline />,
    },
    {
      key: '/organization',
      title: '组织',
      icon: <MessageOutline />,
    },
    {
      key: '/me',
      title: '我',
      icon: <UserOutline />,
    },
  ]

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <NavBar 
        backArrow={false}
        left={<div className="avatar-placeholder"></div>}
      >
        智慧园区
      </NavBar>

      {/* 路由内容区域 */}
      <div className="content-container">
        <Outlet />
      </div>

      {/* 底部导航栏 */}
      <TabBar 
        activeKey={pathname} 
        onChange={value => setRouteActive(value)}
        className="bottom-tab-bar"
      >
        {tabBarItems.map(item => (
          <TabBar.Item 
            key={item.key}
            icon={item.icon}
            title={item.title} 
          />
        ))}
      </TabBar>
    </div>
  )
}

export default App
