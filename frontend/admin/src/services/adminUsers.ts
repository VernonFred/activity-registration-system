import http from './http'
import type { AdminUserListItem, PaginatedResponse } from './adminTypes'

export type AdminUsersQuery = {
  page?: number
  pageSize?: number
  keyword?: string
  school?: string
}

export async function listAdminUsers(params: AdminUsersQuery = {}) {
  const resp = await http.get<PaginatedResponse<AdminUserListItem>>('/admin/users', { params })
  return resp.data
}

export async function getAdminUser(userId: number) {
  const resp = await http.get<AdminUserListItem>(`/admin/users/${userId}`)
  return resp.data
}

export async function getAdminUserSignups(userId: number) {
  const resp = await http.get(`/admin/users/${userId}/signups`)
  return resp.data
}

export async function getAdminUserPayments(userId: number) {
  const resp = await http.get(`/admin/users/${userId}/payments`)
  return resp.data
}

export async function getAdminUserBadges(userId: number) {
  const resp = await http.get(`/admin/users/${userId}/badges`)
  return resp.data
}

export async function getAdminUserComments(userId: number) {
  const resp = await http.get(`/admin/users/${userId}/comments`)
  return resp.data
}
