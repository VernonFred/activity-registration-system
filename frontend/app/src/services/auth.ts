import Taro from '@tarojs/taro'
import api from './http'

export const adminLogin = async (username: string, password: string) => {
  const { data } = await api.post('/auth/login', { username, password })
  Taro.setStorageSync('access_token', data.access_token)
  return data
}

export const fetchAdminProfile = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const wechatLogin = async (code: string, profile?: Record<string, unknown>) => {
  const { data } = await api.post('/auth/wechat-login', { code, profile })
  Taro.setStorageSync('access_token', data.access_token)
  return data
}

export const fetchCurrentUser = async () => {
  const { data } = await api.get('/auth/user/me')
  return data
}
