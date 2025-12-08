import { PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import { ThemeProvider } from './context/ThemeContext'
import './app.scss'

function App({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <View className="app-root">{children}</View>
    </ThemeProvider>
  )
}

export default App
