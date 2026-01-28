/**
 * 评论/评分相关 API 服务
 * 创建时间: 2026年1月7日
 *
 * 接口列表:
 * - GET  /api/v1/activities/:id/comments - 获取评论列表
 * - POST /api/v1/activities/:id/comments - 发布评论
 * - DELETE /api/v1/comments/:id - 删除评论
 * - GET  /api/v1/activities/:id/rating - 获取评分统计
 * - POST /api/v1/activities/:id/rating - 提交评分
 * - POST /api/v1/comments/:id/like - 点赞评论
 * - DELETE /api/v1/comments/:id/like - 取消点赞
 */

import { http } from './http'
import CONFIG from '../config'

// ============================================================
// 类型定义
// ============================================================

export interface Comment {
  id: number
  user: {
    id: number
    name: string
    avatar?: string
  }
  rating: number
  content: string
  images?: string[]
  created_at: string
  like_count: number
  reply_count: number
  is_liked: boolean
  replies?: CommentReply[]
}

export interface CommentReply {
  id: number
  comment_id: number
  user: {
    id: number
    name: string
    avatar?: string
  }
  content: string
  created_at: string
  reply_to?: {
    id: number
    name: string
  }
}

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

export interface CommentsResponse {
  items: Comment[]
  total: number
  page: number
  per_page: number
  avg_rating?: number
}

// ============================================================
// Mock 数据
// ============================================================

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: '张三',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    rating: 5,
    content: '活动非常精彩，组织得很好，学到了很多东西！会议议程安排合理，讲师水平都很高。酒店环境也不错，推荐大家参加！',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'],
    created_at: '2026-01-05T14:30:00Z',
    like_count: 28,
    reply_count: 3,
    is_liked: false,
    replies: [
      {
        id: 11,
        comment_id: 1,
        user: {
          id: 2,
          name: '李四'
        },
        content: '同感！这次活动确实很棒',
        created_at: '2026-01-05T15:20:00Z'
      },
      {
        id: 12,
        comment_id: 1,
        user: {
          id: 3,
          name: '王五'
        },
        content: '请问您是参加哪个分论坛的？',
        created_at: '2026-01-05T16:10:00Z',
        reply_to: {
          id: 1,
          name: '张三'
        }
      }
    ]
  },
  {
    id: 2,
    user: {
      id: 4,
      name: '李明',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    rating: 4,
    content: '整体不错，就是会场有点挤。建议下次可以考虑更大的场地。',
    created_at: '2026-01-04T10:15:00Z',
    like_count: 15,
    reply_count: 1,
    is_liked: true
  },
  {
    id: 3,
    user: {
      id: 5,
      name: '王芳',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    rating: 5,
    content: '非常值得参加的活动！',
    created_at: '2026-01-03T18:45:00Z',
    like_count: 42,
    reply_count: 0,
    is_liked: false
  },
  {
    id: 4,
    user: {
      id: 6,
      name: '赵强',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    rating: 5,
    content: '收获满满，期待下次活动！',
    images: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400'
    ],
    created_at: '2026-01-02T20:30:00Z',
    like_count: 8,
    reply_count: 0,
    is_liked: false
  }
]

const MOCK_RATING: Rating = {
  average: 4.8,
  total_count: 128,
  user_rating: 0,
  distribution: {
    5: 98,
    4: 20,
    3: 6,
    2: 2,
    1: 2
  }
}

// ============================================================
// API 方法
// ============================================================

/**
 * 获取活动评论列表
 * @param activityId 活动ID
 * @param params 查询参数
 */
export const fetchComments = async (
  activityId: number,
  params?: {
    page?: number
    per_page?: number
    sort_by?: 'newest' | 'hottest' | 'rating_desc'
  }
): Promise<CommentsResponse> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    let comments = [...MOCK_COMMENTS]

    // 排序
    if (params?.sort_by === 'hottest') {
      comments.sort((a, b) => b.like_count - a.like_count)
    } else if (params?.sort_by === 'rating_desc') {
      comments.sort((a, b) => b.rating - a.rating)
    } else {
      comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return {
      items: comments,
      total: comments.length,
      page: params?.page || 1,
      per_page: params?.per_page || 20,
      avg_rating: MOCK_RATING.average
    }
  }

  // 真实 API
  const response = await http.get(`/activities/${activityId}/comments`, {
    params: {
      page: params?.page || 1,
      per_page: params?.per_page || 20,
      sort_by: params?.sort_by || 'newest'
    }
  })
  return response.data
}

/**
 * 发布评论
 * @param activityId 活动ID
 * @param data 评论数据
 */
export const createComment = async (
  activityId: number,
  data: {
    rating: number
    content: string
    images?: string[]
    parent_id?: number
  }
): Promise<Comment> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 500))

    const newComment: Comment = {
      id: Date.now(),
      user: {
        id: 999,
        name: '当前用户',
        avatar: 'https://i.pravatar.cc/150?img=10'
      },
      rating: data.rating,
      content: data.content,
      images: data.images,
      created_at: new Date().toISOString(),
      like_count: 0,
      reply_count: 0,
      is_liked: false
    }

    return newComment
  }

  // 真实 API
  const response = await http.post(`/activities/${activityId}/comments`, data)
  return response.data
}

/**
 * 删除评论
 * @param commentId 评论ID
 */
export const deleteComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))
    return
  }

  // 真实 API
  await http.delete(`/comments/${commentId}`)
}

/**
 * 获取活动评分统计
 * @param activityId 活动ID
 */
export const fetchRating = async (activityId: number): Promise<Rating> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))
    return MOCK_RATING
  }

  // 真实 API
  const response = await http.get(`/activities/${activityId}/rating`)
  return response.data
}

/**
 * 提交评分
 * @param activityId 活动ID
 * @param rating 评分 (1-5)
 */
export const submitRating = async (
  activityId: number,
  rating: number
): Promise<Rating> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const newRating = {
      ...MOCK_RATING,
      user_rating: rating,
      total_count: MOCK_RATING.total_count + 1,
      average: ((MOCK_RATING.average * MOCK_RATING.total_count + rating) / (MOCK_RATING.total_count + 1)),
      distribution: {
        ...MOCK_RATING.distribution,
        [rating]: MOCK_RATING.distribution[rating as keyof Rating['distribution']] + 1
      }
    }

    return newRating
  }

  // 真实 API
  const response = await http.post(`/activities/${activityId}/rating`, { rating })
  return response.data
}

/**
 * 点赞评论
 * @param commentId 评论ID
 */
export const likeComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))
    return
  }

  // 真实 API
  await http.post(`/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 * @param commentId 评论ID
 */
export const unlikeComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))
    return
  }

  // 真实 API
  await http.delete(`/comments/${commentId}/like`)
}
