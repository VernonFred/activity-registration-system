/**
 * 鉴权相关 API 服务
 * 创建时间: 2026年1月7日
 * 更新时间: 2026年1月8日
 *
 * 接口列表:
 * - POST /api/v1/auth/wechat/login - 微信登录
 * - POST /api/v1/auth/refresh - 刷新 Token
 * - POST /api/v1/auth/logout - 退出登录
 * - POST /api/v1/wechat/decrypt-phone - 微信手机号解密
 * - POST /api/v1/auth/login - 管理后台登录（保留）
 * - GET  /api/v1/auth/me - 获取管理员信息（保留）
 */

import Taro from '@tarojs/taro'
import { http } from './http'
import CONFIG from '../config'

// ============================================================
// 类型定义
// ============================================================

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: number
    name: string
    avatar?: string
    phone?: string
  }
}

export interface RefreshTokenResponse {
  access_token: string
  expires_in: number
}

export interface DecryptPhoneResponse {
  phone: string
}

// ============================================================
// Mock 数据
// ============================================================

const MOCK_LOGIN_RESPONSE: LoginResponse = {
  access_token: 'mock_access_token_' + Date.now(),
  refresh_token: 'mock_refresh_token_' + Date.now(),
  expires_in: 7200, // 2小时
  user: {
    id: 1,
    name: '张三',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '13800138000'
  }
}

// ============================================================
// Token 管理
// ============================================================

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

/**
 * 保存 Token
 */
export const saveToken = (accessToken: string, refreshToken: string): void => {
  Taro.setStorageSync(TOKEN_KEY, accessToken)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 获取 Access Token
 */
export const getAccessToken = (): string | null => {
  return Taro.getStorageSync(TOKEN_KEY)
}

/**
 * 获取 Refresh Token
 */
export const getRefreshToken = (): string | null => {
  return Taro.getStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * 清除 Token
 */
export const clearToken = (): void => {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
  Taro.removeStorageSync(USER_INFO_KEY)
}

/**
 * 保存用户信息
 */
export const saveUserInfo = (user: any): void => {
  Taro.setStorageSync(USER_INFO_KEY, user)
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): any => {
  return Taro.getStorageSync(USER_INFO_KEY)
}

/**
 * 检查是否已登录
 */
export const isLoggedIn = (): boolean => {
  return !!getAccessToken()
}

// ============================================================
// API 方法
// ============================================================

/**
 * 微信登录
 * @param code 微信登录 code
 * @param profile 用户信息（可选）
 */
export const wechatLogin = async (code?: string, profile?: Record<string, unknown>): Promise<LoginResponse> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))

    // 保存 Token
    saveToken(MOCK_LOGIN_RESPONSE.access_token, MOCK_LOGIN_RESPONSE.refresh_token)
    saveUserInfo(MOCK_LOGIN_RESPONSE.user)

    return MOCK_LOGIN_RESPONSE
  }

  // 真实 API
  // 如果没有传入 code，先调用微信登录获取 code
  let loginCode = code
  if (!loginCode) {
    const { code: wxCode } = await Taro.login()
    loginCode = wxCode
  }

  const response = await http.post('/auth/wechat/login', { code: loginCode, profile })
  const data = response.data

  // 保存 Token
  saveToken(data.access_token, data.refresh_token)
  saveUserInfo(data.user)

  return data
}

/**
 * 管理后台登录（保留原有功能）
 * @param username 用户名
 * @param password 密码
 */
export const adminLogin = async (username: string, password: string): Promise<any> => {
  const response = await http.post('/auth/login', { username, password })
  Taro.setStorageSync('access_token', response.data.access_token)
  return response.data
}

/**
 * 获取管理员信息（保留原有功能）
 */
export const fetchAdminProfile = async (): Promise<any> => {
  const response = await http.get('/auth/me')
  return response.data
}

/**
 * 获取当前用户信息（保留原有功能）
 */
export const fetchCurrentUser = async (): Promise<any> => {
  const response = await http.get('/auth/user/me')
  return response.data
}

/**
 * 刷新 Token
 * @param refreshToken 刷新令牌
 */
export const refreshAccessToken = async (refreshToken?: string): Promise<RefreshTokenResponse> => {
  const token = refreshToken || getRefreshToken()

  if (!token) {
    throw new Error('No refresh token available')
  }

  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const newAccessToken = 'mock_access_token_refreshed_' + Date.now()
    saveToken(newAccessToken, token)

    return {
      access_token: newAccessToken,
      expires_in: 7200
    }
  }

  // 真实 API
  const response = await http.post('/auth/refresh', { refresh_token: token })
  const data = response.data

  // 保存新的 Access Token
  saveToken(data.access_token, token)

  return data
}

/**
 * 退出登录
 */
export const logout = async (): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))
    clearToken()
    return
  }

  // 真实 API
  try {
    await http.post('/auth/logout')
  } finally {
    clearToken()
  }
}

/**
 * 微信手机号解密
 * @param encryptedData 加密数据
 * @param iv 偏移向量
 */
export const decryptWechatPhone = async (
  encryptedData: string,
  iv: string
): Promise<DecryptPhoneResponse> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      phone: '13800138000'
    }
  }

  // 真实 API
  const response = await http.post('/wechat/decrypt-phone', {
    encrypted_data: encryptedData,
    iv
  })
  return response.data
}

/**
 * 自动登录（启动时调用）
 * 如果本地有 Token，则验证 Token 是否有效
 * 如果 Token 无效，尝试用 Refresh Token 刷新
 * 如果都无效，清除本地数据
 */
export const autoLogin = async (): Promise<boolean> => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  // 没有 Token，返回 false
  if (!accessToken) {
    return false
  }

  if (CONFIG.USE_MOCK) {
    // Mock 模式下直接返回 true
    return true
  }

  try {
    // 验证 Token 是否有效（通过调用一个简单的接口）
    await http.get('/users/me')
    return true
  } catch (error: any) {
    // Token 无效，尝试刷新
    if (error?.response?.status === 401 && refreshToken) {
      try {
        await refreshAccessToken(refreshToken)
        return true
      } catch (refreshError) {
        // 刷新失败，清除 Token
        clearToken()
        return false
      }
    }

    // 其他错误，清除 Token
    clearToken()
    return false
  }
}

/**
 * 强制登录（跳转到登录页）
 */
export const requireLogin = async (): Promise<void> => {
  const loggedIn = await autoLogin()

  if (!loggedIn) {
    // 跳转到登录页
    // TODO: 实现登录页后取消注释
    // Taro.navigateTo({ url: '/pages/login/index' })

    // 临时方案：直接调用微信登录
    try {
      await wechatLogin()
    } catch (error) {
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
      throw error
    }
  }
}

// 默认导出（兼容旧代码）
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
  clearToken
}
