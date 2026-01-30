/**
 * 评论页面常量和Mock数据
 * 创建时间: 2026年1月28日
 */
import type { Comment, Rating } from './types'

// 默认头像（base64 SVG - 灰色圆形用户图标，兼容所有平台）
export const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxOCIgZmlsbD0iI2JkYmRiZCIvPjxlbGxpcHNlIGN4PSI1MCIgY3k9Ijg1IiByeD0iMzIiIHJ5PSIyNSIgZmlsbD0iI2JkYmRiZCIvPjwvc3ZnPg=='

export interface CurrentUser {
  id: number
  name: string
  avatar: string
  organization: string
}

// Mock 当前用户
export const MOCK_CURRENT_USER: CurrentUser = {
  id: 1,
  name: '王小利',
  avatar: 'https://i.pravatar.cc/150?img=12',
  organization: '湖南大学信息学院中心'
}

// Mock 评分数据
export const MOCK_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: 0,
  distribution: { 5: 98, 4: 20, 3: 6, 2: 2, 1: 2 }
}

// Mock 评论数据 - 使用ISO格式日期（兼容iOS）
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user_name: '王小利',
    user_avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    content: '这场活动举办得非常好，干货满满',
    created_at: '2026-01-05T14:30:00',
    like_count: 70,
    reply_count: 10,
    is_liked: false,
    replies: []
  },
  {
    id: 2,
    user_name: '王小二',
    user_avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    content: '真的就是干货满满！',
    created_at: '2026-01-05T15:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  },
  {
    id: 3,
    user_name: '王大二',
    user_avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    content: '活动举办得非常精彩',
    created_at: '2026-01-05T16:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  },
  {
    id: 4,
    user_name: '王小利',
    user_avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    content: '这场活动举办得非常好，干货满满',
    created_at: '2026-01-05T17:00:00',
    like_count: 70,
    reply_count: 0,
    is_liked: false,
    replies: []
  }
]

// 格式化时间 - 兼容iOS日期格式
export const formatTime = (time: string): string => {
  const now = new Date()
  // 兼容iOS：将空格格式转换为ISO格式
  const isoTime = time.includes(' ') ? time.replace(' ', 'T') : time
  const commentTime = new Date(isoTime)
  const diff = now.getTime() - commentTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 7) return isoTime.split('T')[0]
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  return '刚刚'
}
