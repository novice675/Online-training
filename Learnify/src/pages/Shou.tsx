import { useState } from 'react'
import { Tabs } from 'antd-mobile'
import Recommend from './tabs/Recommend'
import Policy from './tabs/Policy'
import Circle from './tabs/Circle'
import Enterprise from './tabs/Enterprise'

export default function Shou() {
  const [activeTab, setActiveTab] = useState('recommend')

  // 顶部标签页
  const tabs = [
    {
      key: 'recommend',
      title: '推荐',
      content: <Recommend />
    },
    {
      key: 'policy',
      title: '政策',
      content: <Policy />
    },
    {
      key: 'circle',
      title: '圈子',
      content: <Circle />
    },
    {
      key: 'enterprise',
      title: '企业',
      content: <Enterprise />
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
