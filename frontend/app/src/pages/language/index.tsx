import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import './index.scss'

const LANGUAGES = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' }
] as const

export default function LanguageSettings() {
  const { i18n, t } = useTranslation()
  const { theme } = useTheme()
  const [topPad, setTopPad] = useState(54)

  useEffect(() => {
    try {
      const sys = Taro.getSystemInfoSync()
      setTopPad((sys.statusBarHeight || 44) + 10)
    } catch { /* fallback */ }
  }, [])

  const currentLang = i18n.language

  const handleSwitch = (code: string) => {
    if (code === currentLang) return
    i18n.changeLanguage(code)
    Taro.showToast({ title: t('languageSettings.switchSuccess'), icon: 'success', duration: 1500 })
  }

  return (
    <View className={`lang-page ${theme}`}>
      <View className="lang-header" style={{ paddingTop: `${topPad}px` }}>
        <View className="lang-back" onClick={() => Taro.navigateBack()}>
          <View className="lang-back-circle">
            <View className="lang-back-arrow" />
          </View>
        </View>
        <Text className="lang-title">{t('languageSettings.pageTitle')}</Text>
      </View>

      <View className="lang-card">
        <Text className="lang-section-label">{t('languageSettings.currentLang')}</Text>
        <View className="lang-divider" />

        {LANGUAGES.map((lang, idx) => (
          <View key={lang.code}>
            <View className="lang-row" onClick={() => handleSwitch(lang.code)}>
              <Text className="lang-label">{lang.label}</Text>
              <View className={`lang-check ${currentLang === lang.code ? 'active' : ''}`}>
                {currentLang === lang.code && <View className="lang-check-icon" />}
              </View>
            </View>
            {idx < LANGUAGES.length - 1 && <View className="lang-divider" />}
          </View>
        ))}
      </View>
    </View>
  )
}
