/**
 * 暗黑模式设置页面 — 对标 Sketch 设计稿
 * 三态：跟随系统 / 普通模式(light) / 暗黑模式(dark)
 */
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

export default function DarkModeSettings() {
  const { t } = useTranslation()
  const { mode, setMode, theme } = useTheme()
  const [topPad, setTopPad] = useState(54)

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch { /* fallback */ }
  }, [])

  const followSystem = mode === 'system'

  const handleFollowSystemToggle = () => {
    if (followSystem) {
      setMode(theme === 'dark' ? 'dark' : 'light')
    } else {
      setMode('system')
    }
  }

  return (
    <View className={`dm-page ${theme}`}>
      <View className="dm-header" style={{ paddingTop: `${topPad}px` }}>
        <View className="dm-back" onClick={() => Taro.navigateBack()}>
          <View className="dm-back-circle">
            <View className="dm-back-arrow" />
          </View>
        </View>
        <Text className="dm-title">{t('darkModeSettings.pageTitle')}</Text>
      </View>

      <View className="dm-card">
        {/* 跟随系统 */}
        <View className="dm-row">
          <Text className="dm-label">{t('darkModeSettings.followSystem')}</Text>
          <View
            className={`dm-toggle ${followSystem ? 'on' : 'off'}`}
            onClick={handleFollowSystemToggle}
          >
            <View className="dm-toggle-track">
              <View className="dm-toggle-thumb" />
            </View>
          </View>
        </View>

        <Text className="dm-hint">{t('darkModeSettings.followSystemHint')}</Text>

        <View className="dm-divider" />

        {/* 手动选择 */}
        <Text className="dm-section-label">{t('darkModeSettings.manualSelect')}</Text>

        <View className="dm-divider" />

        {/* 普通模式 */}
        <View className="dm-row">
          <Text className="dm-label">{t('darkModeSettings.lightMode')}</Text>
          <View
            className={`dm-toggle ${!followSystem && mode === 'light' ? 'on' : 'off'}`}
            onClick={() => { if (!followSystem) setMode('light') }}
          >
            <View className="dm-toggle-track">
              <View className="dm-toggle-thumb" />
            </View>
          </View>
        </View>

        <View className="dm-divider" />

        {/* 暗黑模式 */}
        <View className="dm-row">
          <Text className="dm-label">{t('darkModeSettings.darkMode')}</Text>
          <View
            className={`dm-toggle ${!followSystem && mode === 'dark' ? 'on' : 'off'}`}
            onClick={() => { if (!followSystem) setMode('dark') }}
          >
            <View className="dm-toggle-track">
              <View className="dm-toggle-thumb" />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
