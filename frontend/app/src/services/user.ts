/**
 * 用户相关 API 服务
 * 创建时间: 2026年1月7日
 */

import Taro from '@tarojs/taro'
import { http } from './http'
import { CONFIG } from '../config'
import { applyMockSignupOverride, MOCK_SIGNUPS, MOCK_USER, setMockSignupFormOverride } from './user-mock'
import type { SignupsResponse, SignupRecord, User } from './user-types'

type SignupFormOverride = Partial<Pick<SignupRecord, 'personal' | 'payment' | 'accommodation' | 'transport'>>

export const fetchCurrentUser = async (): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const stored = Taro.getStorageSync('mock_user_overrides')
    return stored ? { ...MOCK_USER, ...stored } : MOCK_USER
  }
  return (await http.get('/users/me')).data
}

export const updateUser = async (data: Partial<User>): Promise<User> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const stored = Taro.getStorageSync('mock_user_overrides') || {}
    const merged = { ...stored, ...data }
    Taro.setStorageSync('mock_user_overrides', merged)
    return { ...MOCK_USER, ...merged }
  }
  return (await http.put('/users/me', data)).data
}

export const fetchMySignups = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  page?: number
  per_page?: number
  keyword?: string
}): Promise<SignupsResponse> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    let signups = MOCK_SIGNUPS.map(applyMockSignupOverride)
    if (params?.status && params.status !== 'all') signups = signups.filter((signup) => signup.status === params.status)
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      signups = signups.filter((signup) => signup.activity.title.toLowerCase().includes(keyword) || signup.activity.location_city?.toLowerCase().includes(keyword) || signup.activity.location_name?.toLowerCase().includes(keyword))
    }
    const page = params?.page || 1
    const per_page = params?.per_page || 10
    const start = (page - 1) * per_page
    return { items: signups.slice(start, start + per_page), total: signups.length, page, per_page }
  }
  return (await http.get('/users/me/signups', { params: { status: params?.status === 'all' ? undefined : params?.status, page: params?.page || 1, per_page: params?.per_page || 10, keyword: params?.keyword } })).data
}

export const fetchSignupDetail = async (signupId: number): Promise<SignupRecord> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const signup = MOCK_SIGNUPS.find((item) => item.id === signupId)
    if (!signup) throw new Error('报名记录不存在')
    return applyMockSignupOverride(signup)
  }
  return (await http.get(`/signups/${signupId}`)).data
}

export const updateSignupFormData = async (signupId: number, data: SignupFormOverride): Promise<SignupRecord> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    setMockSignupFormOverride(signupId, data)
    const target = MOCK_SIGNUPS.find((item) => item.id === signupId)
    if (!target) throw new Error('报名记录不存在')
    return applyMockSignupOverride(target)
  }
  return (await http.patch(`/signups/${signupId}`, { extra: { personal: data.personal, payment: data.payment, accommodation: data.accommodation, transport: data.transport } })).data
}

export const cancelSignup = async (signupId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return
  }
  await http.delete(`/signups/${signupId}`)
}
