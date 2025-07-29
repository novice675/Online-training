import React, { useState } from 'react'
import { Tabs } from 'antd-mobile'

export default function Shou() {
  const [activeTab, setActiveTab] = useState('recommend')

  // 顶部标签页
  const tabs = [
    {
      key: 'recommend',
      title: '推荐',
      content: (
        <div className="content-area">
          <div className="news-item">
            <h3>上海中福世福汇大酒店列为中风险地区。</h3>
            <div className="image-placeholder shanghai-img"></div>
            <div className="news-footer">
              <span>夏季</span>
              <span>2022-02-10</span>
              <span>1239</span>
            </div>
          </div>
          <div className="news-item">
            <h3>唐山市公安局路北分局局长马爱军等人接受审查调查</h3>
            <div className="news-footer">
              <span>夕阳</span>
              <span>2022-02-10</span>
              <span>1239</span>
            </div>
          </div>
          <div className="news-item">
            <h3>厦金大桥议题讨论升温，台民众呼吁民进党勿阻挡</h3>
            <div className="image-placeholder bridge-img"></div>
            <div className="news-footer">
              <span>夏季</span>
              <span>2022-02-10</span>
              <span>1239</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'policy',
      title: '政策',
      content: <div className="content-area">政策相关内容</div>
    },
    {
      key: 'circle',
      title: '圈子',
      content: <div className="content-area">圈子相关内容</div>
    },
    {
      key: 'enterprise',
      title: '企业',
      content: <div className="content-area">企业相关内容</div>
    },
  ]

  return (
    <div>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="main-tabs"
      >
        {tabs.map(tab => (
          <Tabs.Tab title={tab.title} key={tab.key}>
            {tab.content}
          </Tabs.Tab>
        ))}
      </Tabs>
    </div>
  )
}
