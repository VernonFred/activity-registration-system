/**
 * Profile 页面类型定义
 * 创建时间: 2025年12月9日
 */

// Tab 类型
export type ProfileTab = 'activities' | 'badges' | 'notifications' | 'settings'

// 通知子Tab类型
export type NotifyTab = 'system' | 'mentions' | 'comments'

// 用户信息
export interface UserInfo {
  id: number
  name: string
  avatar_url?: string
  organization?: string
  title?: string
  bio?: string
}

// 报名记录
export interface SignupRecord {
  id: number
  activity_id: number
  activity_title: string
  activity_desc?: string
  activity_date: string
  activity_end_date?: string
  activity_location?: string
  status: 'pending' | 'approved' | 'rejected'
  checkin_status: 'not_checked_in' | 'checked_in' | 'no_show'
  payment_status?: 'unpaid' | 'paid'
  transport_completed?: boolean
  likes: number
  comments: number
  favorites: number
  shares: number
  is_liked?: boolean
  is_favorited?: boolean
  is_commented?: boolean
  companions?: Companion[]
}

// 同行人员
export interface Companion {
  id: number
  name: string
}

// 通知
export interface Notification {
  id: number
  type: 'success' | 'warning' | 'info' | 'badge'
  title: string
  content: string
  time: string
  is_new: boolean
  action_url?: string
  action_text?: string
}

// 徽章
export interface Badge {
  id: number
  name: string
  icon_url: string
  category: string
  is_earned: boolean
}
