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
  agenda?: AgendaItem[] | AgendaGroup[] | AgendaDay[]  // 支持扁平数组、分组数组或多天数组
  hotels?: Hotel[]
  live_url?: string
  extra?: Record<string, any>
}

// 演讲人/主持人信息
export interface Speaker {
  name: string
  title: string        // 职位/介绍
  avatar?: string      // 头像 URL
}

export type Moderator = Speaker  // 主持人类型与演讲人相同

// 议程项类型
export type AgendaItemType = 'speech' | 'break' | 'discussion' | 'activity'

// 议程项（扩展版 - 支持嵌套结构）
export interface AgendaItem {
  id: number
  time_start: string
  time_end: string
  title: string
  type?: AgendaItemType        // 新增：类型（演讲/茶歇/讨论等）
  speaker?: Speaker | string   // 扩展：支持对象或字符串（兼容旧数据）
  location?: string
  tag?: string
  description?: string         // 新增：详细描述
}

// 议程分组（新增 - 支持嵌套结构）
export interface AgendaGroup {
  id: number
  title: string                // 分组标题（如"开幕仪式"、"主旨报告"）
  time_start?: string          // 分组开始时间（可选）
  time_end?: string            // 分组结束时间（可选）
  moderator?: Moderator        // 主持人信息（可选）
  items: AgendaItem[]          // 该分组下的议程项列表
  description?: string         // 分组描述（可选）
}

// 议程日期分组（多天会议支持）
export interface AgendaDay {
  id: number
  date: string                 // 日期（YYYY-MM-DD格式）
  display_date: string         // 显示文本（如"2025年11月12日（第一天）"）
  groups: AgendaGroup[]        // 该天的议程分组列表
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

