import http from './http'

export async function listSignups(params: { activity_id?: number; user_id?: number; limit?: number; offset?: number } = {}) {
  const resp = await http.get('/signups', { params })
  return resp.data
}

export async function countSignups(params: { activity_id?: number; user_id?: number; statuses?: string[]; checkin_status?: string } = {}) {
  const resp = await http.get('/signups/count', { params })
  return resp.data
}

export async function updateSignup(id: number, payload: any) {
  const resp = await http.patch(`/signups/${id}`, payload)
  return resp.data
}

export async function deleteSignup(id: number) {
  const resp = await http.delete(`/signups/${id}`)
  return resp.data
}

export async function bulkDeleteSignups(ids: number[]) {
  const resp = await http.post('/signups/bulk-delete', { ids })
  return resp.data
}

/**
 * 批量审核报名
 * @param signup_ids 报名ID列表
 * @param action 'approve' | 'reject'
 * @param message 审核备注（可选）
 */
export async function bulkReviewSignups(signup_ids: number[], action: 'approve' | 'reject', message?: string) {
  const resp = await http.post('/signups/bulk-review', { signup_ids, action, message })
  return resp.data
}

/**
 * 获取单个报名详情
 */
export async function getSignup(id: number) {
  const resp = await http.get(`/signups/${id}`)
  return resp.data
}

/**
 * 签到核验
 */
export async function checkinSignup(signupId: number, checkinStatus: 'checked_in' | 'no_show' = 'checked_in') {
  const resp = await http.patch(`/signups/${signupId}`, { checkin_status: checkinStatus })
  return resp.data
}
