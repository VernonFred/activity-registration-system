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

// 系统通知
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

// @我的（别人@我的评论）
export interface MentionItem {
  id: number
  user_name: string
  user_avatar: string
  user_org: string
  comment_text: string
  my_original_text: string
  time: string
  activity_id?: number
  comment_id?: number
}

// 我的评论
export interface MyCommentItem {
  id: number
  activity_id: number
  activity_category: string
  activity_title: string
  activity_desc: string
  rating: number
  stats: { likes: number; comments: number; favorites: number; shares: number }
  comment_text: string
  user_avatar: string
  is_liked?: boolean
  is_favorited?: boolean
}

// 徽章分类
export type BadgeCategory = 'start' | 'interact' | 'honor' | 'easter'

// 徽章
export interface Badge {
  id: number
  name: string
  icon_url: string
  category: BadgeCategory
  is_earned: boolean
  description?: string
  slogan?: string
  earned_at?: string
  is_featured?: boolean
  is_hidden?: boolean
}
