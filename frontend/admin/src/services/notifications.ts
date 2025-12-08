import http from './http'

export async function listLogs(params: { user_id?: number; limit?: number } = {}) {
  const resp = await http.get('/notifications', { params })
  return resp.data
}

export async function preview(payload: any) {
  const resp = await http.post('/notifications/preview', payload)
  return resp.data
}

