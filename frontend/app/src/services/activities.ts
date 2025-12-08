import Taro from '@tarojs/taro'
import { CONFIG } from '../config'
import { getFilteredActivities, getFeaturedActivities, getHistoricalActivities, getActivityById } from '../mock'

const BASE_URL = CONFIG.API_BASE_URL + '/api/v1'

/**
 * 获取活动列表
 * @param params 筛选参数
 */
export const fetchActivityList = (params: {
  page?: number
  per_page?: number
  status?: string
  city?: string
  keyword?: string
}) => {
  // Mock 模式
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getFilteredActivities(params))
      }, 500) // 模拟网络延迟
    })
  }

  // 真实 API 模式
  return Taro.request({
    url: `${BASE_URL}/activities`,
    method: 'GET',
    data: params,
  }).then(res => res.data)
}

/**
 * 获取热门精选活动
 */
export const fetchFeaturedActivities = () => {
  // Mock 模式
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getFeaturedActivities())
      }, 300)
    })
  }

  // 真实 API 模式（可能需要后端提供专门的接口）
  return Taro.request({
    url: `${BASE_URL}/activities/featured`,
    method: 'GET',
  }).then(res => res.data)
}

/**
 * 获取历史活动
 */
export const fetchHistoricalActivities = () => {
  // Mock 模式
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getHistoricalActivities())
      }, 300)
    })
  }

  // 真实 API 模式
  return Taro.request({
    url: `${BASE_URL}/activities`,
    method: 'GET',
    data: { status: 'finished' },
  }).then(res => res.data)
}

/**
 * 获取活动详情
 * @param id 活动 ID
 */
export const fetchActivityDetail = (id: number) => {
  // Mock 模式
  if (CONFIG.USE_MOCK) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const activity = getActivityById(id)
        if (activity) {
          resolve(activity)
        } else {
          reject(new Error('活动不存在'))
        }
      }, 300)
    })
  }

  // 真实 API 模式
  return Taro.request({
    url: `${BASE_URL}/activities/${id}`,
    method: 'GET',
  }).then(res => res.data)
}

/**
 * 搜索活动
 * @param keyword 搜索关键词
 */
export const searchActivities = (keyword: string, params?: any) => {
  return fetchActivityList({
    keyword,
    ...params,
  })
}
