export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type AdminPaymentListItem = {
  id: number
  activityId: number
  activityTitle: string
  userId: number
  userName: string
  amount: number
  status: 'pending' | 'paid' | 'refunding' | 'refunded' | 'failed'
  method: 'wechat' | 'manual' | 'offline'
  paidAt?: string
}

export type AdminUserListItem = {
  id: number
  name: string
  phone?: string
  school?: string
  signupCount: number
  badgeCount: number
  lastActiveAt?: string
}

export type AdminCommentListItem = {
  id: number
  activityId: number
  activityTitle: string
  userId: number
  userName: string
  rating?: number
  content: string
  isPublic: boolean
  createdAt: string
}

export type AdminSettings = {
  notificationEnabled: boolean
  defaultReminderHours: number
  allowManualCheckin: boolean
  sessionTimeoutMinutes: number
}
