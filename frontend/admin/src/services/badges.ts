import http from './http'

export async function listBadges() {
  const resp = await http.get('/badges')
  return resp.data
}

