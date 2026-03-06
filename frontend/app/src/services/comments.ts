/**
 * 评论/评分相关 API 服务
 * 创建时间: 2026年1月7日
 */

import { http } from './http'
import { CONFIG } from '../config'
import type { Comment, CommentsResponse, Rating } from './comments-types'
import { getMockCommentsByActivity, getMockCommentsForActivity, MOCK_RATING, setMockCommentsByActivity } from './comments-mock'

export const fetchComments = async (
  activityId: number,
  params?: { page?: number; per_page?: number; sort_by?: 'newest' | 'hottest' | 'rating_desc' }
): Promise<CommentsResponse> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const comments = [...getMockCommentsForActivity(activityId)]
    if (params?.sort_by === 'hottest') comments.sort((a, b) => b.like_count - a.like_count)
    else if (params?.sort_by === 'rating_desc') comments.sort((a, b) => b.rating - a.rating)
    else comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return { items: comments, total: comments.length, page: params?.page || 1, per_page: params?.per_page || 20, avg_rating: MOCK_RATING.average }
  }
  return (await http.get(`/activities/${activityId}/comments`, { params: { page: params?.page || 1, per_page: params?.per_page || 20, sort_by: params?.sort_by || 'newest' } })).data
}

export const createComment = async (activityId: number, data: { rating: number; content: string; images?: string[]; parent_id?: number }): Promise<Comment> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newComment: Comment = { id: Date.now(), user: { id: 1, name: '张三', avatar: 'https://i.pravatar.cc/150?img=10' }, rating: data.rating, content: data.content, images: data.images, created_at: new Date().toISOString(), like_count: 0, reply_count: 0, is_liked: false }
    const cache = getMockCommentsByActivity()
    const key = String(activityId)
    const list = cache[key] ? [...cache[key]] : [...getMockCommentsForActivity(activityId)]
    cache[key] = [newComment, ...list]
    setMockCommentsByActivity(cache)
    return newComment
  }
  return (await http.post(`/activities/${activityId}/comments`, data)).data
}

export const deleteComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const cache = getMockCommentsByActivity()
    for (const key of Object.keys(cache)) cache[key] = cache[key].filter((comment) => comment.id !== commentId)
    setMockCommentsByActivity(cache)
    return
  }
  await http.delete(`/comments/${commentId}`)
}

export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const cache = getMockCommentsByActivity()
    let found: Comment | null = null
    for (const key of Object.keys(cache)) {
      cache[key] = cache[key].map((comment) => {
        if (comment.id !== commentId) return comment
        found = { ...comment, content }
        return found as Comment
      })
    }
    setMockCommentsByActivity(cache)
    if (found) return found
    return { id: commentId, user: { id: 999, name: '当前用户' }, rating: 5, content, created_at: new Date().toISOString(), like_count: 0, reply_count: 0, is_liked: false }
  }
  return (await http.put(`/comments/${commentId}`, { content })).data
}

export const fetchRating = async (activityId: number): Promise<Rating> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return MOCK_RATING
  }
  return (await http.get(`/activities/${activityId}/rating`)).data
}

export const submitRating = async (activityId: number, rating: number): Promise<Rating> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { ...MOCK_RATING, user_rating: rating, total_count: MOCK_RATING.total_count + 1, average: (MOCK_RATING.average * MOCK_RATING.total_count + rating) / (MOCK_RATING.total_count + 1), distribution: { ...MOCK_RATING.distribution, [rating]: MOCK_RATING.distribution[rating as keyof Rating['distribution']] + 1 } }
  }
  return (await http.post(`/activities/${activityId}/rating`, { rating })).data
}

export const likeComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const cache = getMockCommentsByActivity()
    for (const key of Object.keys(cache)) cache[key] = cache[key].map((comment) => comment.id === commentId ? { ...comment, is_liked: true, like_count: comment.is_liked ? comment.like_count : comment.like_count + 1 } : comment)
    setMockCommentsByActivity(cache)
    return
  }
  await http.post(`/comments/${commentId}/like`)
}

export const unlikeComment = async (commentId: number): Promise<void> => {
  if (CONFIG.USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const cache = getMockCommentsByActivity()
    for (const key of Object.keys(cache)) cache[key] = cache[key].map((comment) => comment.id === commentId ? { ...comment, is_liked: false, like_count: Math.max(0, comment.like_count - (comment.is_liked ? 1 : 0)) } : comment)
    setMockCommentsByActivity(cache)
    return
  }
  await http.delete(`/comments/${commentId}/like`)
}
