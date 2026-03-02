import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import Taro from '@tarojs/taro'
import zhCN from './locales/zh-CN'
import en from './locales/en'

const LANGUAGE_STORAGE_KEY = 'app_language'

export function getSavedLanguage(): string {
  try {
    return Taro.getStorageSync(LANGUAGE_STORAGE_KEY) || 'zh-CN'
  } catch {
    return 'zh-CN'
  }
}

export function saveLanguage(lng: string) {
  try {
    Taro.setStorageSync(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    /* ignore */
  }
}

i18next.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en }
  },
  lng: getSavedLanguage(),
  fallbackLng: 'zh-CN',
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
})

i18next.on('languageChanged', (lng) => {
  saveLanguage(lng)
})

export default i18next
