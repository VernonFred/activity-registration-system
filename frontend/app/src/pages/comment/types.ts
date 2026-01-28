/**
 * 评论页面类型定义
 */

export type CommentSortType = 'hottest' | 'time' | 'newest'

export interface Rating {
  average: number
  total_count: number
  user_rating?: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface Reply {
  id: number
  comment_id: number
  user_name: string
  user_avatar?: string
  content: string
  reply_to?: string
  created_at: string
}

export interface Comment {
  id: number
  user_name: string
  user_avatar: string
  rating: number
  content: string
  images?: string[]
  created_at: string
  like_count: number
  reply_count: number
  is_liked: boolean
  replies: Reply[]
}
