export interface User {
  id: number
  name: string
  avatar?: string
  phone?: string
  school?: string
  department?: string
  position?: string
  wechat_openid?: string
  created_at: string
}

export interface SignupRecord {
  id: number
  activity: {
    id: number
    title: string
    cover_url?: string
    start_time: string
    end_time: string
    location_city?: string
    location_name?: string
  }
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  personal: {
    name: string
    phone: string
    school: string
    department: string
    position?: string
  }
  payment?: {
    invoice_title: string
    email: string
    payment_screenshot?: string
  }
  accommodation?: any
  transport?: any
  companions?: any[]
  rejection_reason?: string
}

export interface SignupsResponse {
  items: SignupRecord[]
  total: number
  page: number
  per_page: number
}
