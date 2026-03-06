/**
 * 鉴权相关 API 服务
 * 创建时间: 2026年1月7日
 * 更新时间: 2026年1月8日
 */

import Taro from '@tarojs/taro'
import { http } from './http'
import { CONFIG } from '../config'
import type { DecryptPhoneResponse, LoginResponse, RefreshTokenResponse } from './auth-types'
import { clearToken, getAccessToken, getRefreshToken, isLoggedIn, saveToken, saveUserInfo } from './auth-storage'

const MOCK_LOGIN_RESPONSE: LoginResponse = {
  access_token: 'mock_access_token_' + Date.now(),
  refresh_token: 'mock_refresh_token_' + Date.now(),
  expires_in: 7200,
  user: {
    id: 1,
    name: '张三',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '13800138000',
  },
}

export const wechatLogin = async (code?: string, profile?: Record<string, unknown>): Promise<LoginResponse> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    saveToken(MOCK_LOGIN_RESPONSE.access_token, MOCK_LOGIN_RESPONSE.refresh_token)
    saveUserInfo(MOCK_LOGIN_RESPONSE.user)
    return MOCK_LOGIN_RESPONSE
  }

  let loginCode = code
  if (!loginCode) {
    const { code: wxCode } = await Taro.login()
    loginCode = wxCode
  }

  const response = await http.post('/auth/wechat/login', { code: loginCode, profile })
  const data = response.data
  saveToken(data.access_token, data.refresh_token)
  saveUserInfo(data.user)
  return data
}

export const adminLogin = async (username: string, password: string): Promise<any> => {
  const response = await http.post('/auth/login', { username, password })
  Taro.setStorageSync('access_token', response.data.access_token)
  return response.data
}

export const fetchAdminProfile = async (): Promise<any> => (await http.get('/auth/me')).data
export const fetchCurrentUser = async (): Promise<any> => (await http.get('/auth/user/me')).data

export const refreshAccessToken = async (refreshToken?: string): Promise<RefreshTokenResponse> => {
  const token = refreshToken || getRefreshToken()
  if (!token) throw new Error('No refresh token available')

  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newAccessToken = 'mock_access_token_refreshed_' + Date.now()
    saveToken(newAccessToken, token)
    return { access_token: newAccessToken, expires_in: 7200 }
  }

  const response = await http.post('/auth/refresh', { refresh_token: token })
  const data = response.data
  saveToken(data.access_token, token)
  return data
}

export const logout = async (): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    clearToken()
    return
  }

  try {
    await http.post('/auth/logout')
  } finally {
    clearToken()
  }
}

export const decryptWechatPhone = async (encryptedData: string, iv: string): Promise<DecryptPhoneResponse> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { phone: '13800138000' }
  }
  const response = await http.post('/wechat/decrypt-phone', { encrypted_data: encryptedData, iv })
  return response.data
}

export const autoLogin = async (): Promise<boolean> => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  if (!accessToken) return false
  if (CONFIG.USE_MOCK) return true

  try {
    await http.get('/users/me')
    return true
  } catch (error: any) {
    if (error?.response?.status === 401 && refreshToken) {
      try {
        await refreshAccessToken(refreshToken)
        return true
      } catch {
        clearToken()
        return false
      }
    }
    clearToken()
    return false
  }
}

export const requireLogin = async (): Promise<void> => {
  const loggedIn = await autoLogin()
  if (loggedIn) return
  try {
    await wechatLogin()
  } catch (error) {
    Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    throw error
  }
}

export default {
  adminLogin,
  fetchAdminProfile,
  wechatLogin,
  fetchCurrentUser,
  refreshAccessToken,
  logout,
  decryptWechatPhone,
  autoLogin,
  requireLogin,
  isLoggedIn,
  getAccessToken,
  clearToken,
}
