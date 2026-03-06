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

export interface RegistrationStepPayload {
  step_key: string
  step_title: string
  values: Record<string, any>
}

export interface RegistrationFormData {
  activity_id: number
  steps: RegistrationStepPayload[]
  personal?: Record<string, any>
  payment?: Record<string, any>
  accommodation?: Record<string, any>
  transport?: Record<string, any>
}

export const createSignup = async (payload: SignupPayload) => {
  const { data } = await api.post('/signups', payload)
  return data
}

export const submitRegistration = async (formData: RegistrationFormData) => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '报名成功',
          registration_id: Math.floor(Math.random() * 10000),
          registration_number: `REG${Date.now()}`,
          data: formData,
        })
      }, 800)
    })
  }

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
  message?: string,
) => {
  const { data } = await api.post(`/signups/${signupId}/review`, { action, message })
  return data
}

export const createCompanion = async (
  signupId: number,
  companionData: Record<string, any>,
) => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: '已添加同行人员',
          companion_id: Math.floor(Math.random() * 10000),
          data: companionData,
        })
      }, 600)
    })
  }

  const { data } = await api.post(`/signups/${signupId}/companions`, companionData)
  return data
}
