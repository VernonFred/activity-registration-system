/**
 * Search 页面常量
 * 创建时间: 2025年12月9日
 */
import type { Category, HotSearchItem } from './types'

// 活动分类
export const CATEGORIES: Category[] = [
  { key: 'all', label: '所有活动' },
  { key: 'forum', label: '论坛' },
  { key: 'summit', label: '峰会' },
]

// 状态中英文转换
export const STATUS_MAP: Record<string, string> = {
  signup: '报名中',
  upcoming: '即将开始',
  ongoing: '进行中',
  finished: '已结束',
  draft: '草稿',
  scheduled: '即将开始',
  published: '报名中',
  closed: '已截止',
  archived: '已结束',
}

// 模拟热门搜索
export const MOCK_HOT_SEARCHES: HotSearchItem[] = [
  { 
    id: 1, 
    title: '第八届高等教育博览会', 
    count: '1,23k 搜索', 
    time: '今日',
    cover: 'https://picsum.photos/200/200?random=1'
  },
  { 
    id: 2, 
    title: '2025教育创新峰会', 
    count: '856 搜索', 
    time: '本周',
    cover: 'https://picsum.photos/200/200?random=2'
  },
  { 
    id: 3, 
    title: '智慧校园建设论坛', 
    count: '632 搜索', 
    time: '本周',
    cover: 'https://picsum.photos/200/200?random=3'
  },
]

/**
 * 获取状态标签
 */
export const getStatusLabel = (status: string) => STATUS_MAP[status] || status

