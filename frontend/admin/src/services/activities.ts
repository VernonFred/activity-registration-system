import http from './http'

export type ActivityStatus = 'draft' | 'scheduled' | 'published' | 'closed' | 'archived'

export async function listActivities(params: { statuses?: ActivityStatus[]; keyword?: string; limit?: number; offset?: number } = {}) {
  const resp = await http.get('/activities', { params })
  return resp.data
}

export async function getActivity(id: number) {
  const resp = await http.get(`/activities/${id}`)
  return resp.data
}

export async function createActivity(payload: any) {
  const resp = await http.post('/activities', payload)
  return resp.data
}

export async function updateActivity(id: number, payload: any) {
  const resp = await http.patch(`/activities/${id}`, payload)
  return resp.data
}

export async function getActivityStats(id: number) {
  const resp = await http.get(`/activities/${id}/stats`)
  return resp.data
}

export async function exportSignups(id: number, format: 'csv' | 'xlsx' = 'csv', ids?: number[]) {
  const params: any = { format }
  if (ids && ids.length) params.ids = ids
  const resp = await http.get(`/activities/${id}/exports/signups`, { params, responseType: 'blob' })
  return resp.data
}

export async function exportCommentsCsv(id: number) {
  const resp = await http.get(`/activities/${id}/exports/comments`, { responseType: 'blob' })
  return resp.data
}

export async function exportSharesCsv(id: number) {
  const resp = await http.get(`/activities/${id}/exports/shares`, { responseType: 'blob' })
  return resp.data
}

export async function deleteActivity(id: number) {
  const resp = await http.delete(`/activities/${id}`)
  return resp.data
}
