import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Main.css'
import SocketStatus from '../components/SocketStatus'

export default function Main() {
  const navigate = useNavigate()

  const handleMenuClick = (menuType: string) => {
    switch (menuType) {
      case 'chat':
        navigate('/autochat')
        break
      case 'publish':
        navigate('/publish-news')
        break
      case 'audit':
        navigate('/audit-messages')
        break
      default:
        console.log(`点击了 ${menuType}`)
    }
  }

  return (
    <div className="personal-center">
      {/* Socket连接状态 */}
      <SocketStatus showDetails={true} />
      
      {/* 头部区域 */}
      <div className="header-section">
        <div className="profile-info">
          <div className="profile-picture">
            <img src="/images/1.png" alt="用户头像" />
          </div>
          <div className="user-info">
            <h2 className="user-name">勿忘心安</h2>
            <div className="contact-info">
              <span className="phone-icon">📞</span>
              <span className="phone-number">18767161731</span>
            </div>
          </div>
        </div>
        <div className="message-icon">
          <span>✉️</span>
        </div>
      </div>

      {/* 统计信息区域 */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">68</div>
          <div className="stat-label">收藏</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">88</div>
          <div className="stat-label">关注</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98</div>
          <div className="stat-label">粉丝</div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="menu-list">
        <div className="menu-item">
          <div className="menu-icon">👤</div>
          <div className="menu-text">我的访客</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item">
          <div className="menu-icon">🔄</div>
          <div className="menu-text">我的关注</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item">
          <div className="menu-icon">🏢</div>
          <div className="menu-text">我的企业</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item">
          <div className="menu-icon">🚗</div>
          <div className="menu-text">我的车辆</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item">
          <div className="menu-icon">⚡</div>
          <div className="menu-text">我的能耗</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item" onClick={() => handleMenuClick('chat')}>
          <div className="menu-icon">🤖</div>
          <div className="menu-text">智能客服</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item" onClick={() => handleMenuClick('publish')}>
          <div className="menu-icon">📝</div>
          <div className="menu-text">发布新闻</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
        <div className="menu-item" onClick={() => handleMenuClick('audit')}>
          <div className="menu-icon">📋</div>
          <div className="menu-text">审核消息</div>
          <div className="menu-arrow">{'>'}</div>
        </div>
      </div>
    </div>
  )
}
