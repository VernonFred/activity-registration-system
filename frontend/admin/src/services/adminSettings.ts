import http from './http'
import type { AdminSettings } from './adminTypes'

export type AdminUserAccountPayload = {
  name: string
  email: string
  role?: string
}

export async function getAdminSettings() {
  const resp = await http.get<AdminSettings>('/admin/settings')
  return resp.data
}

export async function updateAdminSettings(payload: Partial<AdminSettings>) {
  const resp = await http.patch<AdminSettings>('/admin/settings', payload)
  return resp.data
}

export async function listAdminAccounts() {
  const resp = await http.get('/admin/admin-users')
  return resp.data
}

export async function createAdminAccount(payload: AdminUserAccountPayload) {
  const resp = await http.post('/admin/admin-users', payload)
  return resp.data
}

export async function updateAdminAccount(accountId: number, payload: Partial<AdminUserAccountPayload>) {
  const resp = await http.patch(`/admin/admin-users/${accountId}`, payload)
  return resp.data
}

export async function deleteAdminAccount(accountId: number) {
  const resp = await http.delete(`/admin/admin-users/${accountId}`)
  return resp.data
}
