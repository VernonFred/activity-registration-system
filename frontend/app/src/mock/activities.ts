import type { MockActivity } from './activity-types'
import { finishedActivities } from './activities-finished'
import { ongoingActivities } from './activities-ongoing'
import { signupActivities } from './activities-signup'
import { upcomingActivities } from './activities-upcoming'

export const mockActivities: MockActivity[] = [
  ...signupActivities,
  ...upcomingActivities,
  ...ongoingActivities,
  ...finishedActivities,
]

/**
 * 根据筛选条件获取活动列表
 */
export const getFilteredActivities = (filters: {
  status?: string
  city?: string
  keyword?: string
  page?: number
  per_page?: number
}) => {
  let result = [...mockActivities]

  // 按状态筛选
  if (filters.status && filters.status !== 'all') {
    result = result.filter(a => a.status === filters.status)
  }

  // 按城市筛选
  if (filters.city && filters.city !== 'all') {
    result = result.filter(a => a.location === filters.city)
  }

  // 按关键词搜索
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(
      a =>
        a.title.toLowerCase().includes(keyword) ||
        a.description.toLowerCase().includes(keyword) ||
        a.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  // 分页
  const page = filters.page || 1
  const per_page = filters.per_page || 10
  const start = (page - 1) * per_page
  const end = start + per_page

  return {
    items: result.slice(start, end),
    total: result.length,
    page,
    per_page,
    has_more: end < result.length,
  }
}

/**
 * 获取热门精选（报名中的活动，取前 5 个）
 */
export const getFeaturedActivities = () => {
  return mockActivities
    .filter(a => a.status === 'signup')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
}

/**
 * 获取历史活动（已结束的活动）
 */
export const getHistoricalActivities = () => {
  return mockActivities
    .filter(a => a.status === 'finished')
    .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
}

/**
 * 根据 ID 获取活动详情
 */
export const getActivityById = (id: number) => {
  return mockActivities.find(a => a.id === id)
}

