/**
 * 互动功能服务
 * 包括：收藏、点赞、分享等
 */
import api from './http'
import { addFavorite, removeFavorite, addLike, removeLike } from '../utils/storage'

/**
 * 切换收藏状态
 * @param activityId 活动ID
 * @param isFavorited 当前是否已收藏
 */
export async function toggleFavorite(activityId: number, isFavorited: boolean): Promise<void> {
  try {
    if (isFavorited) {
      // 取消收藏
      await api.delete(`/engagements/${activityId}/favorite`)
      removeFavorite(activityId)
    } else {
      // 添加收藏
      await api.post(`/engagements/${activityId}/favorite`)
      addFavorite(activityId)
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    throw error
  }
}

/**
 * 获取活动的互动统计（包括收藏状态）
 * @param activityId 活动ID
 */
export async function getActivityEngagement(activityId: number) {
  try {
    const { data } = await api.get(`/engagements/${activityId}/engagement`)
    return data
  } catch (error) {
    console.error('获取活动互动信息失败:', error)
    throw error
  }
}

/**
 * 切换点赞状态
 * @param activityId 活动ID
 * @param isLiked 当前是否已点赞
 */
export async function toggleLike(activityId: number, isLiked: boolean): Promise<void> {
  try {
    if (isLiked) {
      // 取消点赞
      await api.delete(`/engagements/${activityId}/like`)
      removeLike(activityId)
    } else {
      // 添加点赞
      await api.post(`/engagements/${activityId}/like`)
      addLike(activityId)
    }
  } catch (error) {
    console.error('切换点赞状态失败:', error)
    throw error
  }
}

/**
 * 记录分享行为
 * @param activityId 活动ID
 * @param channel 分享渠道（如 'wechat', 'moments' 等）
 */
export async function recordShare(activityId: number, channel?: string): Promise<void> {
  try {
    await api.post(`/engagements/${activityId}/share`, { channel: channel || 'wechat' })
  } catch (error) {
    console.error('记录分享失败:', error)
    // 分享记录失败不影响用户体验，仅打印日志
  }
}

/**
 * 获取互动摘要（别名函数，更直观的命名）
 * @param activityId 活动ID
 */
export async function getEngagementSummary(activityId: number) {
  return getActivityEngagement(activityId)
}

