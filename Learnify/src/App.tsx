import { NavBar, TabBar } from 'antd-mobile'
import {
  AppOutline,
  MessageOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import './App.css'

// 自定义加号按钮样式
const AddButton = () => (
  <div
    style={{
      width: '48px',
      height: '48px',
      backgroundColor: '#A0C4FF',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '32px',
      color: '#fff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      // lineHeight:'20px'
      transform:'translateY(-12px)'
    }}
  >
    <span style={{transform:'translateY(-4px)'}}>+</span>
  </div>
)

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location

  // 设置当前激活的标签页
  const setRouteActive = (value: string) => {
    // 中间加号不跳转
    if (value === 'add') return
    navigate(value)
  }

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
        <TabBar.Item 
          key="/"
          icon={<AppOutline />}
          title="首页" 
        />
        <TabBar.Item 
          key="/serve"
          icon={<UnorderedListOutline />}
          title="服务" 
        />
        <TabBar.Item 
          key="add"
          icon={<AddButton />}
          title=""
          onClick={() => {
            console.log('点击加号')
          }}
          // style={{marginBottom:'25px'}}
        />
        <TabBar.Item 
          key="/organization"
          icon={<MessageOutline />}
          title="组织" 
        />
        <TabBar.Item 
          key="/me"
          icon={<UserOutline />}
          title="我" 
        />
      </TabBar>
    </div>
  )
}

export default App
