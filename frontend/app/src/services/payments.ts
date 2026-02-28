import api from './http'

export interface PaymentItem {
  id: number
  user_id: number
  activity_id: number
  activity_title: string
  amount: number
  category: string
  status: string
  pay_date?: string
  cover_url?: string
  date_range?: string
  time_range?: string
  payer?: string
  order_no?: string
  transaction_no?: string
  payment_screenshot?: string
  created_at: string
  updated_at: string
}

export interface PaymentListResponse {
  items: PaymentItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const fetchPayments = async (params: {
  page?: number
  per_page?: number
  status?: string
  category?: string
  activity_id?: number
} = {}): Promise<PaymentListResponse> => {
  const { data } = await api.get('/payments', { params })
  return data
}

export const fetchPaymentDetail = async (id: number): Promise<PaymentItem> => {
  const { data } = await api.get(`/payments/${id}`)
  return data
}

export const deletePayment = async (id: number): Promise<void> => {
  await api.delete(`/payments/${id}`)
}

export const bulkDeletePayments = async (ids: number[]): Promise<{ deleted: number }> => {
  const { data } = await api.post('/payments/bulk-delete', { ids })
  return data
}
