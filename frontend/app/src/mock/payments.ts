/**
 * 缴费 Mock 数据
 */
import type { PaymentItem, PaymentListResponse } from '../services/payments'

const MOCK_PAYMENTS: PaymentItem[] = [
  {
    id: 1,
    user_id: 1,
    activity_id: 1,
    activity_title: '2025暑期老客户培训会议',
    amount: 2800,
    category: '培训',
    status: 'paid',
    pay_date: '2025-06-15',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    date_range: '2025.07.30-08.02',
    payer: '王小利',
    order_no: 'PAY20250615001',
    transaction_no: 'TXN20250615001',
    created_at: '2025-06-15T10:00:00Z',
    updated_at: '2025-06-15T10:05:00Z',
  },
  {
    id: 2,
    user_id: 1,
    activity_id: 2,
    activity_title: '第三届人工智能教育应用论坛',
    amount: 1500,
    category: '论坛',
    status: 'paid',
    pay_date: '2025-05-20',
    cover_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    date_range: '2025.06.10-06.12',
    payer: '王小利',
    order_no: 'PAY20250520001',
    transaction_no: 'TXN20250520001',
    created_at: '2025-05-20T14:30:00Z',
    updated_at: '2025-05-20T14:35:00Z',
  },
  {
    id: 3,
    user_id: 1,
    activity_id: 3,
    activity_title: '智慧校园建设峰会',
    amount: 3200,
    category: '峰会',
    status: 'unpaid',
    cover_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
    date_range: '2025.09.15-09.18',
    payer: '王小利',
    order_no: 'PAY20250801001',
    created_at: '2025-08-01T09:00:00Z',
    updated_at: '2025-08-01T09:00:00Z',
  },
  {
    id: 4,
    user_id: 1,
    activity_id: 4,
    activity_title: '教育信息化研讨会',
    amount: 800,
    category: '研讨会',
    status: 'paid',
    pay_date: '2025-04-10',
    cover_url: 'https://images.unsplash.com/photo-1560439514-4e9645039924?w=400',
    date_range: '2025.04.25-04.26',
    payer: '王小利',
    order_no: 'PAY20250410001',
    transaction_no: 'TXN20250410001',
    created_at: '2025-04-10T11:00:00Z',
    updated_at: '2025-04-10T11:05:00Z',
  },
  {
    id: 5,
    user_id: 1,
    activity_id: 5,
    activity_title: '高校数字化转型培训班',
    amount: 1200,
    category: '培训',
    status: 'paid',
    pay_date: '2025-03-05',
    cover_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400',
    date_range: '2025.03.20-03.22',
    payer: '王小利',
    order_no: 'PAY20250305001',
    transaction_no: 'TXN20250305001',
    created_at: '2025-03-05T08:30:00Z',
    updated_at: '2025-03-05T08:35:00Z',
  },
  {
    id: 6,
    user_id: 1,
    activity_id: 6,
    activity_title: '新一代教学平台发布会',
    amount: 0,
    category: '论坛',
    status: 'paid',
    pay_date: '2025-07-01',
    cover_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
    date_range: '2025.07.15-07.16',
    payer: '王小利',
    order_no: 'PAY20250701001',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
]

export function getMockPayments(params: {
  page?: number
  per_page?: number
  status?: string
  category?: string
  activity_id?: number
} = {}): PaymentListResponse {
  const { page = 1, per_page = 10, status, category, activity_id } = params
  let filtered = [...MOCK_PAYMENTS]

  if (status && status !== 'all') {
    filtered = filtered.filter(p => p.status === status)
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category)
  }
  if (activity_id) {
    filtered = filtered.filter(p => p.activity_id === activity_id)
  }

  const total = filtered.length
  const total_pages = Math.ceil(total / per_page)
  const start = (page - 1) * per_page
  const items = filtered.slice(start, start + per_page)

  return { items, total, page, per_page, total_pages }
}

export function getMockPaymentDetail(id: number): PaymentItem | null {
  return MOCK_PAYMENTS.find(p => p.id === id) || null
}
