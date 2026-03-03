import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme as antdThemeUtil } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import { lightTheme, darkTheme } from './styles/antdTheme'
import { useTheme, ThemeContext } from './hooks/useTheme'
import './styles/tokens.css'
import './styles/index.css'

function ThemeRoot() {
  const themeState = useTheme()
  const antdConfig = themeState.isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={themeState}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          ...antdConfig,
          algorithm: themeState.isDark
            ? antdThemeUtil.darkAlgorithm
            : antdThemeUtil.defaultAlgorithm,
        }}
      >
        <App />
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeRoot />
  </React.StrictMode>
)
