import http from './http'

export function getToken(): string | null {
  return localStorage.getItem('admin_token')
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token)
}

export function clearToken() {
  localStorage.removeItem('admin_token')
}

export async function login(username: string, password: string): Promise<void> {
  const resp = await http.post('/auth/login', { username, password })
  setToken(resp.data.access_token)
}

export async function profile(): Promise<any> {
  const resp = await http.get('/auth/me')
  return resp.data
}

