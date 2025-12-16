import api from './http'

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
  const { data } = await api.post('/api/v1/registrations', formData)
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
