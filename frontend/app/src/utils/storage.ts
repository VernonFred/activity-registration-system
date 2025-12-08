/**
 * 本地存储工具
 * 用于管理最近搜索、最近浏览等数据
 */
import Taro from '@tarojs/taro'

// ==========================================
// 最近搜索管理
// ==========================================

const RECENT_SEARCHES_KEY = 'recent_searches'
const MAX_RECENT_SEARCHES = 10

export interface RecentSearch {
  keyword: string
  timestamp: number
}

/**
 * 获取最近搜索列表
 */
export function getRecentSearches(): string[] {
  try {
    const data = Taro.getStorageSync(RECENT_SEARCHES_KEY)
    if (!data) return []
    const searches: RecentSearch[] = JSON.parse(data)
    // 按时间倒序排列
    return searches
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.keyword)
  } catch (error) {
    console.error('读取最近搜索失败:', error)
    return []
  }
}

/**
 * 添加最近搜索
 * @param keyword 搜索关键词
 */
export function addRecentSearch(keyword: string): void {
  if (!keyword || !keyword.trim()) return
  
  const trimmedKeyword = keyword.trim()
  
  try {
    const searches = getRecentSearches()
    
    // 去重：如果已存在，先移除
    const filtered = searches.filter(item => item !== trimmedKeyword)
    
    // 添加到最前面
    const updated = [trimmedKeyword, ...filtered]
    
    // 限制最大数量
    const limited = updated.slice(0, MAX_RECENT_SEARCHES)
    
    // 转换为带时间戳的格式
    const withTimestamp: RecentSearch[] = limited.map(kw => ({
      keyword: kw,
      timestamp: Date.now()
    }))
    
    Taro.setStorageSync(RECENT_SEARCHES_KEY, JSON.stringify(withTimestamp))
  } catch (error) {
    console.error('保存最近搜索失败:', error)
  }
}

/**
 * 删除单条最近搜索
 * @param keyword 要删除的关键词
 */
export function removeRecentSearch(keyword: string): void {
  try {
    const searches = getRecentSearches()
    const filtered = searches.filter(item => item !== keyword)
    
    const withTimestamp: RecentSearch[] = filtered.map(kw => ({
      keyword: kw,
      timestamp: Date.now()
    }))
    
    Taro.setStorageSync(RECENT_SEARCHES_KEY, JSON.stringify(withTimestamp))
  } catch (error) {
    console.error('删除最近搜索失败:', error)
  }
}

/**
 * 清空所有最近搜索
 */
export function clearRecentSearches(): void {
  try {
    Taro.removeStorageSync(RECENT_SEARCHES_KEY)
  } catch (error) {
    console.error('清空最近搜索失败:', error)
  }
}

// ==========================================
// 最近浏览管理
// ==========================================

const RECENT_VIEWS_KEY = 'recent_views'
const MAX_RECENT_VIEWS = 20

export interface RecentViewActivity {
  id: number
  title: string
  cover_url: string
  date: string
  time: string
  status: string
  location: string
  timestamp: number
}

/**
 * 获取最近浏览列表
 */
export function getRecentViews(): RecentViewActivity[] {
  try {
    const data = Taro.getStorageSync(RECENT_VIEWS_KEY)
    if (!data) return []
    const views: RecentViewActivity[] = JSON.parse(data)
    // 按时间倒序排列
    return views.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('读取最近浏览失败:', error)
    return []
  }
}

/**
 * 添加最近浏览
 * @param activity 活动信息
 */
export function addRecentView(activity: Omit<RecentViewActivity, 'timestamp'>): void {
  try {
    const views = getRecentViews()
    
    // 去重：如果已存在该活动，先移除
    const filtered = views.filter(item => item.id !== activity.id)
    
    // 添加到最前面
    const updated: RecentViewActivity[] = [
      { ...activity, timestamp: Date.now() },
      ...filtered
    ]
    
    // 限制最大数量
    const limited = updated.slice(0, MAX_RECENT_VIEWS)
    
    Taro.setStorageSync(RECENT_VIEWS_KEY, JSON.stringify(limited))
  } catch (error) {
    console.error('保存最近浏览失败:', error)
  }
}

/**
 * 清空所有最近浏览
 */
export function clearRecentViews(): void {
  try {
    Taro.removeStorageSync(RECENT_VIEWS_KEY)
  } catch (error) {
    console.error('清空最近浏览失败:', error)
  }
}

// ==========================================
// 收藏状态管理（本地缓存）
// ==========================================

const FAVORITES_KEY = 'favorite_activities'

/**
 * 获取本地收藏列表
 */
export function getFavorites(): Set<number> {
  try {
    const data = Taro.getStorageSync(FAVORITES_KEY)
    if (!data) return new Set()
    const ids: number[] = JSON.parse(data)
    return new Set(ids)
  } catch (error) {
    console.error('读取收藏列表失败:', error)
    return new Set()
  }
}

/**
 * 添加收藏（本地）
 */
export function addFavorite(activityId: number): void {
  try {
    const favorites = getFavorites()
    favorites.add(activityId)
    Taro.setStorageSync(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  } catch (error) {
    console.error('保存收藏失败:', error)
  }
}

/**
 * 移除收藏（本地）
 */
export function removeFavorite(activityId: number): void {
  try {
    const favorites = getFavorites()
    favorites.delete(activityId)
    Taro.setStorageSync(FAVORITES_KEY, JSON.stringify(Array.from(favorites)))
  } catch (error) {
    console.error('移除收藏失败:', error)
  }
}

/**
 * 批量设置收藏状态（用于从服务器同步）
 */
export function setFavorites(activityIds: number[]): void {
  try {
    Taro.setStorageSync(FAVORITES_KEY, JSON.stringify(activityIds))
  } catch (error) {
    console.error('设置收藏列表失败:', error)
  }
}

