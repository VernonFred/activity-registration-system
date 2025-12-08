import http from './http'

export async function getOverview(days?: number) {
  const params: any = {}
  if (days) params.days = days
  const resp = await http.get('/reports/overview', { params })
  return resp.data
}

export async function getActivityReport(activityId: number, days?: number) {
  const params: any = {}
  if (days) params.days = days
  const resp = await http.get(`/reports/activity/${activityId}`, { params })
  return resp.data
}
