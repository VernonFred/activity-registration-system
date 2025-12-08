import http from './http'

export type BadgeRuleType = 'first_approved' | 'total_approved' | 'total_checked_in' | 'activity_tag_attendance'

export async function listRules() {
  const resp = await http.get('/badge-rules')
  return resp.data
}

export async function createRule(payload: any) {
  const resp = await http.post('/badge-rules', payload)
  return resp.data
}

export async function updateRule(id: number, payload: any) {
  const resp = await http.patch(`/badge-rules/${id}`, payload)
  return resp.data
}

export async function deleteRule(id: number) {
  const resp = await http.delete(`/badge-rules/${id}`)
  return resp.data
}

export async function previewRule(id: number, payload: { user_id: number; activity_id?: number }) {
  const resp = await http.post(`/badge-rules/${id}/preview`, payload)
  return resp.data
}

