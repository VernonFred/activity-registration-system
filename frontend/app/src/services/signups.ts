import api from './http'
import { CONFIG } from '../config'

export interface SignupPayload {
  activity_id: number
  answers: Array<{
    field_id: number
    value_text?: string
    value_json?: unknown
  }>
  extra?: Record<string, unknown>
}

// 前端表单数据结构（匹配报名页面）
export interface RegistrationFormData {
  activity_id: number
  personal: {
    name: string
    school: string
    department: string
    position?: string
    phone: string
  }
  payment: {
    invoice_title: string
    email: string
    payment_screenshot?: string
  }
  accommodation: {
    accommodation_type: 'self' | 'organizer'
    hotel: string
    room_type: 'double' | 'standard'
    stay_type: 'single' | 'shared'
  }
  transport: {
    pickup_point?: string
    arrival_time?: string
    flight_train_number?: string
    dropoff_point?: string
    return_time?: string
    return_flight_train_number?: string
  }
}

export const createSignup = async (payload: SignupPayload) => {
  const { data } = await api.post('/signups', payload)
  return data
}

// 提交报名表单（使用前端数据结构）
export const submitRegistration = async (formData: RegistrationFormData) => {
  // Mock 模式：返回模拟成功响应
  if (CONFIG.USE_MOCK) {
    console.log('📝 Mock模式：报名提交', formData)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '报名成功',
          registration_id: Math.floor(Math.random() * 10000),
          registration_number: `REG${Date.now()}`,
          data: formData
        })
      }, 800) // 模拟网络延迟
    })
  }

  // 真实 API 模式：修复 URL（baseURL 已包含 /api/v1）
  const { data } = await api.post('/registrations', formData)
  return data
}

export const fetchMySignups = async (params: Record<string, unknown> = {}) => {
  const { data } = await api.get('/signups', { params })
  return data
}

export const reviewSignup = async (
  signupId: number,
  action: 'approve' | 'reject',
  message?: string
) => {
  const { data } = await api.post(`/signups/${signupId}/review`, { action, message })
  return data
}

/**
 * 创建同行人员
 * @param signupId 主报名ID
 * @param companionData 同行人员数据（不包含 activity_id，继承主报名的活动ID）
 */
export const createCompanion = async (
  signupId: number,
  companionData: Omit<RegistrationFormData, 'activity_id'>
) => {
  // Mock 模式：返回模拟成功响应
  if (CONFIG.USE_MOCK) {
    console.log('📝 Mock模式：同行人员创建', { signupId, companionData })
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '已添加同行人员',
          companion_id: Math.floor(Math.random() * 10000),
          data: companionData
        })
      }, 600) // 模拟网络延迟
    })
  }

  // 真实 API 模式
  const { data } = await api.post(`/signups/${signupId}/companions`, companionData)
  return data
}
