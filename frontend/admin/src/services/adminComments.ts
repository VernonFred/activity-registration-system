import http from './http'
import type { AdminCommentListItem, PaginatedResponse } from './adminTypes'

export type AdminCommentsQuery = {
  page?: number
  pageSize?: number
  activityId?: number
  keyword?: string
  isPublic?: boolean
}

export type UpdateAdminCommentPayload = {
  isPublic?: boolean
  isPinned?: boolean
}

export async function listAdminComments(params: AdminCommentsQuery = {}) {
  const resp = await http.get<PaginatedResponse<AdminCommentListItem>>('/admin/comments', { params })
  return resp.data
}

export async function updateAdminComment(commentId: number, payload: UpdateAdminCommentPayload) {
  const resp = await http.patch(`/admin/comments/${commentId}`, payload)
  return resp.data
}

export async function deleteAdminComment(commentId: number) {
  const resp = await http.delete(`/admin/comments/${commentId}`)
  return resp.data
}
