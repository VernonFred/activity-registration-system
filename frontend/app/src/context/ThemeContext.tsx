/**
 * 主题上下文 - 三态模式：system / light / dark
 * system 模式跟随系统主题实时切换
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import Taro from '@tarojs/taro'

type Theme = 'light' | 'dark'
type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  mode: ThemeMode
  setMode: (m: ThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
  followSystem: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const MODE_STORAGE_KEY = 'app_theme_mode'

function getSystemTheme(): Theme {
  try {
    const info = Taro.getSystemInfoSync()
    return (info as any).theme === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = Taro.getStorageSync(MODE_STORAGE_KEY) as ThemeMode
      return saved || 'system'
    } catch {
      return 'system'
    }
  })

  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)

  useEffect(() => {
    try {
      Taro.setStorageSync(MODE_STORAGE_KEY, mode)
    } catch (e) {
      console.error('保存主题模式失败:', e)
    }
  }, [mode])

  useEffect(() => {
    const handler = (res: { theme: string }) => {
      setSystemTheme(res.theme === 'dark' ? 'dark' : 'light')
    }
    try { Taro.onThemeChange(handler) } catch { /* H5 fallback */ }
    return () => {
      try { Taro.offThemeChange(handler) } catch { /* ignore */ }
    }
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
  }, [])

  const theme: Theme = mode === 'system' ? systemTheme : mode
  const isDark = theme === 'dark'
  const followSystem = mode === 'system'

  const toggleTheme = useCallback(() => {
    setModeState(prev => {
      if (prev === 'system') return 'light'
      return prev === 'light' ? 'dark' : 'light'
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme, isDark, followSystem }}>
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
