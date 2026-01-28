/**
 * 互动相关 API 服务
 * 创建时间: 2026年1月8日
 *
 * 接口列表:
 * - POST   /api/v1/engagements/:id/favorite - 收藏活动
 * - DELETE /api/v1/engagements/:id/favorite - 取消收藏
 * - POST   /api/v1/engagements/:id/like - 点赞活动
 * - DELETE /api/v1/engagements/:id/like - 取消点赞
 * - POST   /api/v1/engagements/:id/share - 记录分享
 * - GET    /api/v1/activities/:id/engagement - 获取互动数据
 */

import { http } from './http'
import CONFIG from '../config'

// ============================================================
// 类型定义
// ============================================================

export interface EngagementData {
  favorite_count: number
  like_count: number
  share_count: number
  is_favorited: boolean
  is_liked: boolean
}

// ============================================================
// Mock 数据
// ============================================================

const MOCK_ENGAGEMENT_DATA: Record<number, EngagementData> = {}

const getMockEngagementData = (activityId: number): EngagementData => {
  if (!MOCK_ENGAGEMENT_DATA[activityId]) {
    MOCK_ENGAGEMENT_DATA[activityId] = {
      favorite_count: Math.floor(Math.random() * 100),
      like_count: Math.floor(Math.random() * 200),
      share_count: Math.floor(Math.random() * 50),
      is_favorited: false,
      is_liked: false
    }
  }
  return MOCK_ENGAGEMENT_DATA[activityId]
}

// ============================================================
// API 方法
// ============================================================

/**
 * 获取活动互动数据
 * @param activityId 活动ID
 */
export const fetchEngagementData = async (activityId: number): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))
    return getMockEngagementData(activityId)
  }

  // 真实 API
  const response = await http.get(`/activities/${activityId}/engagement`)
  return response.data
}

/**
 * 收藏活动
 * @param activityId 活动ID
 */
export const favoriteActivity = async (activityId: number): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const data = getMockEngagementData(activityId)
    data.is_favorited = true
    data.favorite_count += 1

    return data
  }

  // 真实 API
  const response = await http.post(`/engagements/${activityId}/favorite`)
  return response.data
}

/**
 * 取消收藏
 * @param activityId 活动ID
 */
export const unfavoriteActivity = async (activityId: number): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const data = getMockEngagementData(activityId)
    data.is_favorited = false
    data.favorite_count = Math.max(0, data.favorite_count - 1)

    return data
  }

  // 真实 API
  const response = await http.delete(`/engagements/${activityId}/favorite`)
  return response.data
}

/**
 * 点赞活动
 * @param activityId 活动ID
 */
export const likeActivity = async (activityId: number): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const data = getMockEngagementData(activityId)
    data.is_liked = true
    data.like_count += 1

    return data
  }

  // 真实 API
  const response = await http.post(`/engagements/${activityId}/like`)
  return response.data
}

/**
 * 取消点赞
 * @param activityId 活动ID
 */
export const unlikeActivity = async (activityId: number): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 300))

    const data = getMockEngagementData(activityId)
    data.is_liked = false
    data.like_count = Math.max(0, data.like_count - 1)

    return data
  }

  // 真实 API
  const response = await http.delete(`/engagements/${activityId}/like`)
  return response.data
}

/**
 * 记录分享
 * @param activityId 活动ID
 * @param channel 分享渠道 (wechat/moments/link)
 */
export const shareActivity = async (
  activityId: number,
  channel: 'wechat' | 'moments' | 'link' = 'wechat'
): Promise<EngagementData> => {
  if (CONFIG.USE_MOCK) {
    // Mock 数据
    await new Promise(resolve => setTimeout(resolve, 200))

    const data = getMockEngagementData(activityId)
    data.share_count += 1

    return data
  }

  // 真实 API
  const response = await http.post(`/engagements/${activityId}/share`, { channel })
  return response.data
}
