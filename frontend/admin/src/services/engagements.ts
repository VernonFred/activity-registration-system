import http from './http'

export async function getEngagement(activity_id: number) {
  const resp = await http.get(`/activities/${activity_id}/engagement`)
  return resp.data
}

export async function listComments(activity_id: number, params: { limit?: number; offset?: number } = {}) {
  const resp = await http.get(`/activities/${activity_id}/comments`, { params })
  return resp.data
}

export async function recentFeed(activity_id: number, limit = 20) {
  const resp = await http.get(`/activities/${activity_id}/feed`, { params: { limit } })
  return resp.data
}
