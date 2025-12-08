import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  iconDefault: string
  iconActive: string
}

interface CustomTabBarState {
  selected: number
}

const tabList: TabItem[] = [
  {
    pagePath: '/pages/index/index',
    text: '主页',
    iconDefault: '🏠',
    iconActive: '🏠'
  },
  {
    pagePath: '/pages/activities/index',
    text: '报名',
    iconDefault: '✏️',
    iconActive: '✏️'
  },
  {
    pagePath: '/pages/profile/index',
    text: '我的',
    iconDefault: '👤',
    iconActive: '👤'
  },
  {
    pagePath: '/pages/ai-assistant/index',
    text: '会议助手',
    iconDefault: '🤖',
    iconActive: '🤖'
  }
]

export default class CustomTabBar extends Component<{}, CustomTabBarState> {
  state = {
    selected: 0
  }

  switchTab = (index: number, url: string) => {
    this.setState({ selected: index })
    Taro.switchTab({ url })
  }

  render() {
    const { selected } = this.state

    return (
      <View className="custom-tab-bar">
        <View className="tab-bar-inner">
          {tabList.map((item, index) => {
            const isActive = selected === index
            const isAI = index === 3 // AI助手特殊样式
            
            return (
              <View
                key={index}
                className={`tab-item ${isActive ? 'active' : ''} ${isAI ? 'ai-tab' : ''}`}
                onClick={() => this.switchTab(index, item.pagePath)}
              >
                <View className={`tab-icon-wrapper ${isActive ? 'active' : ''}`}>
                  <Text className="tab-icon">
                    {isActive ? item.iconActive : item.iconDefault}
                  </Text>
                </View>
                <Text className={`tab-text ${isActive ? 'active' : ''}`}>
                  {item.text}
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}

