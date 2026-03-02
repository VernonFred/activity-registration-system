/**
 * 发票抬头 Mock 数据
 */
import type { InvoiceHeaderItem, InvoiceHeaderListResponse } from '../services/invoice-headers'

let mockId = 100

const MOCK_INVOICE_HEADERS: InvoiceHeaderItem[] = [
  {
    id: 1,
    user_id: 1,
    name: '湖南大学',
    type: 'company',
    tax_number: '12430000444761230T',
    address: '湖南省长沙市岳麓区麓山南路2号',
    phone: '0731-88822000',
    bank_name: '中国工商银行长沙岳麓支行',
    bank_account: '1901 0225 0920 0100 123',
    created_at: '2025-03-01T10:00:00Z',
    updated_at: '2025-03-01T10:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    name: '王小利',
    type: 'personal',
    created_at: '2025-04-15T14:00:00Z',
    updated_at: '2025-04-15T14:00:00Z',
  },
  {
    id: 3,
    user_id: 1,
    name: '长沙强智科技发展有限公司',
    type: 'company',
    tax_number: '91430100MA4L2KNR5X',
    address: '长沙市岳麓区金星中路468号',
    phone: '0731-88888888',
    bank_name: '中国建设银行长沙高新支行',
    bank_account: '4300 1501 6210 5200 456',
    created_at: '2025-05-20T09:00:00Z',
    updated_at: '2025-05-20T09:00:00Z',
  },
  {
    id: 4,
    user_id: 1,
    name: '湖南大学信息学院',
    type: 'company',
    tax_number: '12430000444761230T',
    address: '湖南省长沙市岳麓区麓山南路2号信息学院',
    phone: '0731-88822100',
    bank_name: '中国工商银行长沙岳麓支行',
    bank_account: '1901 0225 0920 0100 456',
    created_at: '2025-06-10T11:00:00Z',
    updated_at: '2025-06-10T11:00:00Z',
  },
]

let mockHeaders = [...MOCK_INVOICE_HEADERS]

export function getMockInvoiceHeaders(params: {
  page?: number
  per_page?: number
  type?: string
} = {}): InvoiceHeaderListResponse {
  const { page = 1, per_page = 10, type } = params
  let filtered = [...mockHeaders]

  if (type && type !== 'all') {
    filtered = filtered.filter(h => h.type === type)
  }

  const total = filtered.length
  const total_pages = Math.ceil(total / per_page)
  const start = (page - 1) * per_page
  const items = filtered.slice(start, start + per_page)

  return { items, total, page, per_page, total_pages }
}

export function getMockInvoiceHeaderDetail(id: number): InvoiceHeaderItem | null {
  return mockHeaders.find(h => h.id === id) || null
}

export function getMockInvoiceHeaderCopyText(id: number): { text: string } {
  const header = mockHeaders.find(h => h.id === id)
  if (!header) return { text: '' }

  if (header.type === 'personal') {
    return { text: `发票抬头：${header.name}\n类型：个人` }
  }
  const lines = [
    `发票抬头：${header.name}`,
    `纳税人识别号：${header.tax_number || ''}`,
    `地址：${header.address || ''}`,
    `电话：${header.phone || ''}`,
    `开户银行：${header.bank_name || ''}`,
    `银行账号：${header.bank_account || ''}`,
  ]
  return { text: lines.filter(l => !l.endsWith('：')).join('\n') }
}

export function createMockInvoiceHeader(payload: Partial<InvoiceHeaderItem>): InvoiceHeaderItem {
  mockId++
  const now = new Date().toISOString()
  const item: InvoiceHeaderItem = {
    id: mockId,
    user_id: 1,
    name: payload.name || '',
    type: payload.type || 'personal',
    tax_number: payload.tax_number,
    address: payload.address,
    phone: payload.phone,
    bank_name: payload.bank_name,
    bank_account: payload.bank_account,
    created_at: now,
    updated_at: now,
  }
  mockHeaders.unshift(item)
  return item
}

export function updateMockInvoiceHeader(id: number, payload: Partial<InvoiceHeaderItem>): InvoiceHeaderItem | null {
  const idx = mockHeaders.findIndex(h => h.id === id)
  if (idx === -1) return null
  mockHeaders[idx] = { ...mockHeaders[idx], ...payload, updated_at: new Date().toISOString() }
  return mockHeaders[idx]
}

export function deleteMockInvoiceHeader(id: number): boolean {
  const before = mockHeaders.length
  mockHeaders = mockHeaders.filter(h => h.id !== id)
  return mockHeaders.length < before
}
