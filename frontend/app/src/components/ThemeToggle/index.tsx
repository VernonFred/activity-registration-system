/**
 * 主题切换按钮 - 照抄 Lovable ThemeToggle
 * 太阳/月亮图标切换
 */
import { View, Text } from '@tarojs/components'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <View className={`theme-toggle ${theme}`} onClick={toggleTheme}>
      <View className="toggle-icon">
        {theme === 'light' ? (
          // 太阳图标 - CSS 绘制
          <View className="sun-icon">
            <View className="sun-center" />
            <View className="sun-rays" />
          </View>
        ) : (
          // 月亮图标 - CSS 绘制
          <View className="moon-icon" />
        )}
      </View>
    </View>
  )
}

export default ThemeToggle


