/**
 * 底部导航栏 - 支持浅色/深色主题
 * 3个主标签 + AI助手独立按钮
 */
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

// PNG 图标
import iconHome from '../../assets/icons/home.png'
import iconCalendarPlus from '../../assets/icons/calendar-plus.png'
import iconSettings from '../../assets/icons/settings.png'

interface CustomTabBarProps {
  current: number
}

const navItems = [
  { id: 'home', label: '主页', icon: iconHome, path: '/pages/index/index' },
  { id: 'register', label: '报名', icon: iconCalendarPlus, path: '/pages/activities/index' },
  { id: 'profile', label: '我的', icon: iconSettings, path: '/pages/profile/index' },
]

const CustomTabBar = ({ current }: CustomTabBarProps) => {
  const { theme } = useTheme()
  
  const handleTabClick = (index: number, path: string) => {
    if (index === current) return
    Taro.reLaunch({ url: path })
  }

  const handleAIClick = () => {
    Taro.navigateTo({ url: '/pages/ai-assistant/index' })
  }

  return (
    <View className={`bottom-nav theme-${theme}`}>
      <View className="nav-container">
        <View className="nav-glass">
          <View className="nav-items">
            {navItems.map((item, index) => {
              const isActive = current === index
              return (
                <View
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(index, item.path)}
                >
                  {isActive && <View className="active-bg" />}
                  <Image 
                    src={item.icon} 
                    className={`nav-icon ${isActive ? 'active' : ''}`} 
                    mode="aspectFit" 
                  />
                  <Text className={`nav-label ${isActive ? 'active' : ''}`}>{item.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View className="ai-btn" onClick={handleAIClick}>
          <Text className="ai-icon">AI</Text>
          <Text className="ai-label">助手</Text>
        </View>
      </View>
    </View>
  )
}

export default CustomTabBar
