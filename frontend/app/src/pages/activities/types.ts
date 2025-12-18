/**
 * 报名列表页 - 类型定义
 * 创建时间: 2025年12月09日 12:00
 */

// 活动状态类型
export type ActivityStatus = 'upcoming' | 'ongoing' | 'finished'

// 筛选选项
export interface FilterOption {
  label: string
  value: string
}

// 活动卡片数据
export interface ActivityItem {
  id: string
  title: string
  cover: string
  rating: number
  ratingCount: number
  startDate: string
  endDate: string
  city: string
  location: string
  status: ActivityStatus
  isFree: boolean
  price?: number
}

// 筛选状态
export interface FilterState {
  city: string
  timeRange: string
  status: string
}

