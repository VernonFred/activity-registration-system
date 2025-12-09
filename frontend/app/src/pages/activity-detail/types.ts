/**
 * ActivityDetail 页面类型定义
 * 创建时间: 2025年12月9日
 */

// Tab 类型
export type TabKey = 'overview' | 'agenda' | 'hotel' | 'live'

// 活动数据类型
export interface Activity {
  id: number
  title: string
  cover_url?: string
  status: string
  start_time: string
  end_time: string
  signup_deadline?: string
  location_name?: string
  location_address?: string
  location_city?: string
  description?: string
  max_participants?: number
  current_participants?: number
  fee_type?: string
  fee_amount?: number
  agenda?: AgendaItem[]
  hotels?: Hotel[]
  live_url?: string
  extra?: Record<string, any>
}

// 议程项
export interface AgendaItem {
  id: number
  time_start: string
  time_end: string
  title: string
  speaker?: string
  location?: string
  tag?: string
}

// 酒店信息
export interface Hotel {
  id: number
  name: string
  logo?: string
  image?: string
  room_type: string
  price: number
  booking_tip?: string
  contact_name?: string
  contact_phone?: string
  facilities?: string[]
  address?: string
  map_url?: string
}

