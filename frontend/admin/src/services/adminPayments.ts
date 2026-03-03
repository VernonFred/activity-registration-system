import http from './http'
import type { AdminPaymentListItem, PaginatedResponse } from './adminTypes'

export type AdminPaymentsQuery = {
  page?: number
  pageSize?: number
  activityId?: number
  keyword?: string
  status?: AdminPaymentListItem['status']
  method?: AdminPaymentListItem['method']
}

export async function listAdminPayments(params: AdminPaymentsQuery = {}) {
  const resp = await http.get<PaginatedResponse<AdminPaymentListItem>>('/admin/payments', { params })
  return resp.data
}

export async function getAdminPayment(paymentId: number) {
  const resp = await http.get<AdminPaymentListItem>(`/admin/payments/${paymentId}`)
  return resp.data
}

export async function confirmAdminPayment(paymentId: number) {
  const resp = await http.post(`/admin/payments/${paymentId}/confirm`)
  return resp.data
}

export async function refundAdminPayment(paymentId: number) {
  const resp = await http.post(`/admin/payments/${paymentId}/refund`)
  return resp.data
}
