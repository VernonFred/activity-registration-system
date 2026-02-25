/**
 * 我的活动列表页 - 类型定义
 */

// 报名状态
export type RegistrationStatus = 'registered' | 'participated'

// 兼容服务层使用
export type ActivityStatus = 'upcoming' | 'ongoing' | 'finished'

// 参与者
export interface Participant {
  id: string
  name: string
  isPrimary: boolean            // 是否为主报名人
  paymentStatus: 'paid' | 'unpaid'
  checkinStatus: 'checked' | 'unchecked'
  needsTransportInfo?: boolean  // 是否需要完善交通信息
}

// 活动卡片数据
export interface ActivityItem {
  id: string
  title: string
  description: string
  date: string                  // 格式: 'YYYY-MM-DD'
  status: RegistrationStatus
  likes: number
  comments: number
  favorites: number
  shares: number
  participants: Participant[]
}

// 功能 Tab 类型
export type FunctionTab = 'activities' | 'records' | 'notifications' | 'settings'

// 筛选相关（保留兼容）
export interface FilterOption {
  label: string
  value: string
}

export interface FilterState {
  city: string
  timeRange: string
  status: string
}
