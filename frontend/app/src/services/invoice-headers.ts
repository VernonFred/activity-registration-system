import api from './http'
import { CONFIG } from '../config'
import {
  getMockInvoiceHeaders,
  getMockInvoiceHeaderDetail,
  getMockInvoiceHeaderCopyText,
  createMockInvoiceHeader,
  updateMockInvoiceHeader,
  deleteMockInvoiceHeader,
} from '../mock'

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
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockInvoiceHeaders(params)), 500)
    })
  }
  const { data } = await api.get('/invoice-headers', { params })
  return data
}

export const fetchInvoiceHeaderDetail = async (id: number): Promise<InvoiceHeaderItem> => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = getMockInvoiceHeaderDetail(id)
        item ? resolve(item) : reject(new Error('Not found'))
      }, 300)
    })
  }
  const { data } = await api.get(`/invoice-headers/${id}`)
  return data
}

export const fetchInvoiceHeaderCopyText = async (id: number): Promise<{ text: string }> => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getMockInvoiceHeaderCopyText(id)), 200)
    })
  }
  const { data } = await api.get(`/invoice-headers/${id}/copy-text`)
  return data
}

export const createInvoiceHeader = async (payload: InvoiceHeaderCreatePayload): Promise<InvoiceHeaderItem> => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(createMockInvoiceHeader(payload)), 500)
    })
  }
  const { data } = await api.post('/invoice-headers', payload)
  return data
}

export const updateInvoiceHeader = async (id: number, payload: Partial<InvoiceHeaderCreatePayload>): Promise<InvoiceHeaderItem> => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = updateMockInvoiceHeader(id, payload)
        item ? resolve(item) : reject(new Error('Not found'))
      }, 500)
    })
  }
  const { data } = await api.patch(`/invoice-headers/${id}`, payload)
  return data
}

export const deleteInvoiceHeader = async (id: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        deleteMockInvoiceHeader(id)
        resolve()
      }, 300)
    })
  }
  await api.delete(`/invoice-headers/${id}`)
}
