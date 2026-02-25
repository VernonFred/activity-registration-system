/**
 * 签到相关 API 服务（用户端页面调用）
 */
import { http } from './http'
import { CONFIG } from '../config'
import Taro from '@tarojs/taro'

export interface CheckinPayload {
  token: string
  force?: boolean
}

const MOCK_CHECKIN_OVERRIDES_KEY = 'mock_checkin_overrides'

export interface MockCheckinOverride {
  checkin_status: 'checked_in'
  checkin_time: string
}

export function getMockCheckinOverrides(): Record<string, MockCheckinOverride> {
  try {
    const raw = Taro.getStorageSync(MOCK_CHECKIN_OVERRIDES_KEY)
    if (!raw) return {}
    if (typeof raw === 'string') return JSON.parse(raw)
    return raw as Record<string, MockCheckinOverride>
  } catch (error) {
    console.error('读取签到覆盖状态失败:', error)
    return {}
  }
}

export function setMockCheckinOverride(signupId: number, override: MockCheckinOverride) {
  try {
    const prev = getMockCheckinOverrides()
    prev[String(signupId)] = override
    Taro.setStorageSync(MOCK_CHECKIN_OVERRIDES_KEY, JSON.stringify(prev))
  } catch (error) {
    console.error('写入签到覆盖状态失败:', error)
  }
}

export const checkinSignup = async (signupId: number, payload: CheckinPayload) => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const result = {
      id: signupId,
      checkin_status: 'checked_in',
      checkin_time: new Date().toISOString(),
    } as const
    setMockCheckinOverride(signupId, {
      checkin_status: result.checkin_status,
      checkin_time: result.checkin_time,
    })
    return result
  }

  const response = await http.post(`/signups/${signupId}/checkins`, payload)
  return response.data
}
