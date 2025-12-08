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

export const createSignup = async (payload: SignupPayload) => {
  const { data } = await api.post('/signups', payload)
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
