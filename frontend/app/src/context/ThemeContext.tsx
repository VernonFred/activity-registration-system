/**
 * 主题上下文 - 照抄 Lovable ThemeProvider
 * 支持浅色/深色主题切换
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Taro from '@tarojs/taro'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'app_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = Taro.getStorageSync(THEME_STORAGE_KEY) as Theme
      return saved || 'dark' // 默认暗黑模式
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    try {
      Taro.setStorageSync(THEME_STORAGE_KEY, theme)
    } catch (e) {
      console.error('保存主题失败:', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext


