import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TabBarProps {
  current: number
}

const tabList = [
  { path: '/pages/index/index', text: '主页', icon: '🏠' },
  { path: '/pages/activities/index', text: '报名', icon: '✏️' },
  { path: '/pages/profile/index', text: '我的', icon: '👤' },
  { path: '/pages/ai-assistant/index', text: '会议助手', icon: 'AI' }
]

const TabBar = ({ current }: TabBarProps) => {
  const handleSwitch = (index: number, path: string) => {
    if (index === current) return
    Taro.switchTab({ url: path })
  }

  return (
    <View className="glass-tab-bar">
      <View className="tab-bar-container">
        {tabList.map((item, index) => {
          const isActive = current === index
          const isAI = index === 3
          
          return (
            <View
              key={index}
              className={`tab-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSwitch(index, item.path)}
            >
              <View className={`icon-box ${isActive ? 'active' : ''} ${isAI ? 'ai-box' : ''}`}>
                {isAI ? (
                  <Text className="ai-text">AI</Text>
                ) : (
                  <Text className="icon-emoji">{item.icon}</Text>
                )}
              </View>
              <Text className={`tab-label ${isActive ? 'active' : ''}`}>{item.text}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default TabBar

