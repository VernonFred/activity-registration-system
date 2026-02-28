import api from './http'

export interface InvoiceHeaderItem {
  id: number
  user_id: number
  name: string
  type: 'personal' | 'company'
  tax_number?: string
  address?: string
  phone?: string
  bank_name?: string
  bank_account?: string
  created_at: string
  updated_at: string
}

export interface InvoiceHeaderListResponse {
  items: InvoiceHeaderItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface InvoiceHeaderCreatePayload {
  name: string
  type: 'personal' | 'company'
  tax_number?: string
  address?: string
  phone?: string
  bank_name?: string
  bank_account?: string
}

export const fetchInvoiceHeaders = async (params: {
  page?: number
  per_page?: number
  type?: string
} = {}): Promise<InvoiceHeaderListResponse> => {
  const { data } = await api.get('/invoice-headers', { params })
  return data
}

export const fetchInvoiceHeaderDetail = async (id: number): Promise<InvoiceHeaderItem> => {
  const { data } = await api.get(`/invoice-headers/${id}`)
  return data
}

export const fetchInvoiceHeaderCopyText = async (id: number): Promise<{ text: string }> => {
  const { data } = await api.get(`/invoice-headers/${id}/copy-text`)
  return data
}

export const createInvoiceHeader = async (payload: InvoiceHeaderCreatePayload): Promise<InvoiceHeaderItem> => {
  const { data } = await api.post('/invoice-headers', payload)
  return data
}

export const updateInvoiceHeader = async (id: number, payload: Partial<InvoiceHeaderCreatePayload>): Promise<InvoiceHeaderItem> => {
  const { data } = await api.patch(`/invoice-headers/${id}`, payload)
  return data
}

export const deleteInvoiceHeader = async (id: number): Promise<void> => {
  await api.delete(`/invoice-headers/${id}`)
}
