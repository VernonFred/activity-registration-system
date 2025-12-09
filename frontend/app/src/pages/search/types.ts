/**
 * Search 页面类型定义
 * 创建时间: 2025年12月9日
 */
import type { MockActivity } from '../../mock/activities'

// 分类类型
export interface Category {
  key: string
  label: string
}

// 热门搜索项
export interface HotSearchItem {
  id: number
  title: string
  count: string
  time: string
  cover: string
}

// 最近浏览项
export interface RecentViewItem {
  id: number
  title: string
  cover_url?: string
  date?: string
  time?: string
  status?: string
  location?: string
}

// 搜索结果类型
export type SearchResult = MockActivity

