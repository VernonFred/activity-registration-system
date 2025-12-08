import axios from 'axios'
import Taro from '@tarojs/taro'

const baseURL =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.TARO_APP_API_BASE || process.env.API_BASE_URL)) ||
  'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 15000
})

api.interceptors.request.use((config) => {
  const token = Taro.getStorageSync('access_token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.detail || '请求失败，请稍后重试'
    Taro.showToast({ title: message, icon: 'none' })
    return Promise.reject(error)
  }
)

export default api
