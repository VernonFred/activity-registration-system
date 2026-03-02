import axios from 'axios'
import Taro from '@tarojs/taro'
import i18n from '../i18n'

const baseURL =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.TARO_APP_API_BASE || process.env.API_BASE_URL)) ||
  'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 15000
})

// 兼容旧服务层的 named import：import { http } from './http'
export const http = api

api.interceptors.request.use((config) => {
  const token = Taro.getStorageSync('access_token')
  config.headers = {
    ...config.headers,
    'Accept-Language': i18n.language || 'zh-CN',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.detail || i18n.t('common.networkError')
    Taro.showToast({ title: message, icon: 'none' })
    return Promise.reject(error)
  }
)

export default api
