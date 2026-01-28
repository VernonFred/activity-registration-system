/**
 * ActivityDetail 页面类型定义
 * 创建时间: 2025年12月9日
 */

// Tab 类型
export type TabKey = 'overview' | 'agenda' | 'hotel' | 'live' | 'comment'

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

// 酒店设施
export interface HotelFacility {
  icon: string       // 图标名称
  label: string      // 设施名称
}

// 交通指南
export interface TransportInfo {
  type: 'subway' | 'bus' | 'drive'  // 地铁/公交/自驾
  title: string                      // 标题（如"地铁"）
  description: string                // 详细描述
}

// 天气信息
export interface WeatherInfo {
  temperature: number    // 温度（摄氏度）
  condition: string      // 天气状况（多云、晴天等）
  humidity: number       // 湿度（%）
  wind_speed: number     // 风速（km/h）
  visibility: number     // 能见度（km）
}

// 酒店信息
export interface Hotel {
  id: number
  name: string
  logo?: string
  image?: string
  room_type: string
  price: number
  price_note?: string              // 价格备注（如"单双同价"）
  booking_tip?: string
  contact_name?: string
  contact_phone?: string
  facilities?: HotelFacility[]     // 设施列表（改为对象数组）
  address?: string
  map_url?: string
  map_image?: string               // 静态地图图片
  transport?: TransportInfo[]      // 交通指南
  weather?: WeatherInfo            // 当地天气
}

// 评分信息
export interface Rating {
  average: number              // 平均分 (0-5)
  total_count: number          // 总评分数
  user_rating?: number         // 当前用户的评分 (0-5，0表示未评分)
  distribution: {              // 评分分布
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// 评论排序类型
export type CommentSortType = 'hottest' | 'time' | 'newest'

// 评论回复
export interface CommentReply {
  id: number
  comment_id: number
  user_name: string
  user_avatar?: string
  content: string
  created_at: string
  reply_to?: string            // 回复给谁（用户名）
}

// 评论
export interface Comment {
  id: number
  user_name: string
  user_avatar?: string
  rating: number               // 用户给的评分 (1-5)
  content: string
  images?: string[]            // 评论图片
  created_at: string
  like_count: number
  reply_count: number
  is_liked: boolean           // 当前用户是否已点赞
  replies?: CommentReply[]    // 回复列表
}

