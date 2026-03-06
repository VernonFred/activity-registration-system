/**
 * 活动 Mock 数据
 * 包含：20+ 条活动数据，覆盖各种状态和场景
 */

export interface MockActivity {
  id: number
  title: string
  location: string // 城市
  venue: string // 具体地点
  cover: string // 封面图
  status: 'signup' | 'upcoming' | 'ongoing' | 'finished' // 状态
  start_time: string
  end_time: string
  signup_deadline: string
  is_free: boolean
  rating: number // 评分
  rating_count: number // 评分人数
  signup_count: number // 报名人数
  max_attendees: number // 最大人数
  description: string // 简介
  tags: string[] // 标签
  created_at: string
  article_url?: string // 微信文章链接（已结束的活动）
  contact_name?: string
  contact_phone?: string
  contact_email?: string
}


