/**
 * 互动功能服务
 * 包括：收藏、点赞、分享等
 */
import api from './http'
import { addFavorite, removeFavorite } from '../utils/storage'

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

